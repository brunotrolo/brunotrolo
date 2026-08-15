# PLANO: MONITORAMENTO PREDITIVO SALESFORCE (Nebula Logger + ML)
## Arquitetura: Apps Script + Google Colab + Google Sheets

**Status:** Plano Aprovado - Fase 0 em Implementação
**Data:** 2026-08-15
**Repositório:** brunotrolo/brunotrolo
**Role:** AI Solution Architect

---

## CONTEXTO

O objetivo é construir um sistema que monitora os logs de integração do Nebula Logger no Salesforce e prevê falhas de API com 5-10 minutos de antecedência, usando ML (Prophet + Isolation Forest), com aprendizado contínuo via feedback humano. Restrições da empresa: sem Google Cloud/AWS pagos nesta fase, sem licença Einstein, precisa rodar 24/7 (ou o mais próximo disso), e não pode depender de infraestrutura que a empresa não libera.

Depois de avaliar alternativas (Apex+LWC nativo, Cloud Functions, etc.), a arquitetura escolhida é 100% baseada em ferramentas Google gratuitas + Salesforce:

```
Salesforce (Nebula Logger)
    ↓ (consulta últimos 30 min, a cada 5 min)
Google Apps Script (orquestrador, roda nos servidores do Google)
    ↓ (envia dados para análise)
Google Colab (Prophet + Isolation Forest — ML e detecção de anomalias)
    ↓ (retorna score de risco + anomalias)
Google Apps Script
    ↓ (grava resultado)
Google Sheets (histórico + aba de problemas)
    ↓ (se severidade alta)
Comunicação (Email/Slack/WhatsApp)
```

**Antes de construir isso tudo, existe um risco real e não-óbvio:** o Apps Script roda nos servidores do Google (não na máquina do usuário), e a Salesforce corporativa pode ter Trusted IP Ranges, restrições de Connected App, ou o Google Workspace da empresa pode bloquear chamadas externas (`UrlFetchApp`) saindo do Apps Script. Se qualquer uma dessas travas existir, o projeto inteiro trava — por isso a **Fase 0** existe: um teste de conectividade mínimo, sem lógica de negócio nenhuma, só para provar que a cadeia funciona na estrutura da empresa antes de investir tempo no MVP completo.

---

## VISÃO GERAL DAS FASES

| Fase | Objetivo | Duração Estimada |
|------|----------|-------------------|
| **Fase 0** | Validar conectividade (Apps Script → Salesforce, Apps Script → Colab, CI/CD) | 3-5 dias úteis |
| Fase 1 | MVP funcional: dados reais do Nebula Logger + ML real (Prophet + Isolation Forest) | 2-3 semanas |
| Fase 2 | Severidade + comunicação automática (alertas) | 1 semana |
| Fase 3 | Aprendizado contínuo + resiliência (fallback se Colab não acordar) | 1-2 semanas |
| Fase 4 | Hardening / produção | contínuo |

---

# FASE 0 — VALIDAÇÃO DE CONECTIVIDADE (CRÍTICA)

## Objetivo

Provar, com o menor esforço possível, que os três elos da corrente funcionam dentro da estrutura da empresa:
1. Apps Script consegue autenticar e ler dados do Salesforce
2. Apps Script consegue chamar o Colab e receber uma resposta
3. O pipeline de CI/CD consegue testar e publicar essa solução automaticamente

**Nada de lógica de negócio nesta fase.** Sem Nebula Logger real, sem Prophet, sem Isolation Forest, sem alertas. Só "a chamada funciona ou não funciona" — respondido em uma planilha simples.

## Por que isso importa (riscos que só aparecem na estrutura real da empresa)

Estes riscos não aparecem em teoria, só testando na prática:

| Risco | Como se manifesta | Por que só descobre testando |
|-------|--------------------|-------------------------------|
| Salesforce Trusted IP Ranges | Login OAuth rejeitado mesmo com credenciais corretas | Apps Script roda em IPs compartilhados do Google, não no IP da empresa |
| Connected App exige aprovação de admin | Token não é emitido / erro `invalid_grant` | Só aparece ao tentar o fluxo OAuth de verdade |
| Google Workspace Admin bloqueia `UrlFetchApp` externo | Apps Script não consegue chamar URLs fora do domínio Google | Política de segurança do Workspace, invisível até testar |
| Google Workspace bloqueia criação de Triggers | Agendamento a cada 5 min simplesmente não dispara | Só aparece ao tentar criar o trigger |
| ngrok (túnel do Colab) bloqueado por proxy corporativo | Timeout constante nas chamadas ao Colab | Depende da política de rede/segurança da empresa |

Se qualquer um desses bloquear, é melhor descobrir em 3-5 dias (Fase 0) do que depois de 3 semanas construindo o MVP completo (Fase 1).

## Decisão Técnica: "Chamar o MCP" via Apps Script

**Importante esclarecimento:** o MCP Salesforce do repositório (`SALESFORCE_MCP_SETUP.md`) é projetado para ser usado pelo Claude Desktop/Code, que sobe o servidor MCP localmente (via `npx`, comunicação stdio) na máquina do usuário. O Google Apps Script roda nos servidores do Google e **não consegue conversar com um processo MCP local** — não existe rede entre eles.

**Solução:** Apps Script vai fazer exatamente o que o MCP faz por baixo dos panos — autenticar via OAuth 2.0 e chamar a REST API do Salesforce diretamente (`UrlFetchApp`). O resultado funcional é o mesmo (dados do Salesforce chegam ao Apps Script), só que sem a camada de abstração MCP, que não faz sentido para um script (MCP existe para agentes de IA como o Claude, não para scripts tradicionais).

Setup necessário (uma vez, manual):
1. Reutilizar o Connected App já documentado em `SALESFORCE_MCP_SETUP.md`, OU criar um Connected App dedicado para o Apps Script (recomendado, para isolar permissões)
2. Gerar um `refresh_token` uma única vez (via fluxo OAuth padrão ou Workbench/Postman)
3. Guardar `client_id`, `client_secret`, `refresh_token` em **Script Properties** do Apps Script (nunca hardcoded no código)

## Componentes da Fase 0

### 1. Google Sheets (ultra simples — 2 abas)

Planilha: `SF-Predictive-POC`

**Aba `Config`:**
| Chave | Valor |
|-------|-------|
| COLAB_MOCK_URL | (URL do ngrok, atualizada manualmente a cada sessão do Colab) |
| LAST_RUN | (timestamp da última execução) |
| PHASE | 0 |

**Aba `Log`:**
| Timestamp | Test | Status | DurationMs | Details |
|-----------|------|--------|------------|---------|

### 2. Google Apps Script

Estrutura de arquivos:
```
phase0-poc/apps-script/
├── Code.gs                 (orquestrador)
├── SalesforceConnector.gs  (auth + chamada REST)
├── ColabConnector.gs       (chamada ao mock do Colab)
├── SheetLogger.gs          (grava resultado na aba Log)
├── appsscript.json         (manifest do projeto)
```

**`SalesforceConnector.gs`** — autentica e faz 1 SOQL trivial:
```javascript
function testSalesforceConnection_() {
  const start = new Date().getTime();
  try {
    const props = PropertiesService.getScriptProperties();
    const tokenResponse = UrlFetchApp.fetch('https://login.salesforce.com/services/oauth2/token', {
      method: 'post',
      payload: {
        grant_type: 'refresh_token',
        client_id: props.getProperty('SF_CLIENT_ID'),
        client_secret: props.getProperty('SF_CLIENT_SECRET'),
        refresh_token: props.getProperty('SF_REFRESH_TOKEN')
      },
      muteHttpExceptions: true
    });
    const tokenData = JSON.parse(tokenResponse.getContentText());
    if (!tokenData.access_token) throw new Error('Sem access_token: ' + tokenResponse.getContentText());

    const queryUrl = tokenData.instance_url + '/services/data/v60.0/query?q=' +
      encodeURIComponent('SELECT Id FROM User LIMIT 1');
    const queryResponse = UrlFetchApp.fetch(queryUrl, {
      headers: { Authorization: 'Bearer ' + tokenData.access_token },
      muteHttpExceptions: true
    });

    return {
      success: queryResponse.getResponseCode() === 200,
      details: queryResponse.getContentText().substring(0, 200),
      durationMs: new Date().getTime() - start
    };
  } catch (e) {
    return { success: false, details: e.message, durationMs: new Date().getTime() - start };
  }
}
```

**`ColabConnector.gs`** — chama o mock do Colab:
```javascript
function testColabConnection_() {
  const start = new Date().getTime();
  try {
    const colabUrl = getConfigValue_('COLAB_MOCK_URL');
    const response = UrlFetchApp.fetch(colabUrl + '/mock', { muteHttpExceptions: true });
    const data = JSON.parse(response.getContentText());
    return {
      success: data.status === 'ok',
      details: JSON.stringify(data),
      durationMs: new Date().getTime() - start
    };
  } catch (e) {
    return { success: false, details: e.message, durationMs: new Date().getTime() - start };
  }
}
```

**`Code.gs`** — orquestrador + trigger:
```javascript
function runPhase0Validation() {
  logResult_('Salesforce_REST_Auth', testSalesforceConnection_());
  logResult_('Colab_Mock', testColabConnection_());
}

function createTimeTrigger() {
  ScriptApp.newTrigger('runPhase0Validation')
    .timeBased()
    .everyMinutes(5)
    .create();
}
```

### 3. Google Colab (mock puro)

```
phase0-poc/colab/
├── phase0_mock.ipynb   (notebook real, roda no Colab)
├── mock_api.py         (mesma lógica, espelhada para testes no CI)
```

**Lógica do mock** (`mock_api.py`, roda tanto no Colab quanto localmente no CI):
```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/mock', methods=['GET', 'POST'])
def mock():
    return jsonify({"status": "ok", "source": "colab-mock", "message": "Colab reachable"})

if __name__ == '__main__':
    app.run()
```

No notebook do Colab, célula adicional expõe isso publicamente via `pyngrok`:
```python
!pip install flask pyngrok
from pyngrok import ngrok
public_url = ngrok.connect(5000)
print(public_url)  # copiar essa URL para a aba Config da planilha
```

**Limitação conhecida e aceita:** URLs do ngrok free são efêmeras — a cada nova sessão do Colab, o usuário precisa copiar a nova URL para a aba `Config`. Isso é aceitável para a Fase 0 e POC; se virar gargalo operacional na Fase 3+, avaliar alternativa (servidor próprio, Replit, etc.).

### 4. Pipeline GitHub Actions (testes + deploy)

```
.github/workflows/phase0-ci.yml
```

```yaml
name: Phase 0 - CI/CD POC
on:
  push:
    branches: [master]
    paths: ['phase0-poc/**']
  pull_request:
    paths: ['phase0-poc/**']

jobs:
  unit-tests-python:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - run: pip install flask pytest
      - run: pytest phase0-poc/tests/test_mock_api.py -v

  unit-tests-appsscript:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm install --save-dev jest
      - run: npx jest phase0-poc/tests/appsscript.test.js

  deploy-apps-script:
    needs: [unit-tests-python, unit-tests-appsscript]
    if: github.ref == 'refs/heads/master'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm install -g @google/clasp
      - run: echo "${{ secrets.CLASP_CREDENTIALS }}" > ~/.clasprc.json
      - run: cd phase0-poc/apps-script && clasp push --force
```

**Teste unitário do mock (Python/pytest):**
```python
# phase0-poc/tests/test_mock_api.py
from phase0_poc.colab.mock_api import app

def test_mock_endpoint_returns_ok():
    client = app.test_client()
    response = client.get('/mock')
    assert response.status_code == 200
    assert response.get_json()['status'] == 'ok'
```

**Nota sobre "publicar nas plataformas":** o deploy automático real (`clasp push`) funciona para o Apps Script. Para o Colab **não existe deploy via API** no sentido tradicional — o notebook precisa ser aberto e executado manualmente pelo usuário (ou por uma automação futura). O CI garante que a lógica do mock (espelhada em `mock_api.py`) está testada e versionada, mas a execução real no Colab continua manual nesta fase. Isso é uma limitação conhecida do Colab, não do pipeline.

## Passo a Passo de Setup (Fase 0)

1. Criar a planilha `SF-Predictive-POC` no Google Drive com as abas `Config` e `Log`
2. Criar o projeto Apps Script vinculado à planilha (`clasp create` ou via UI)
3. No Salesforce: criar/reutilizar Connected App, gerar `refresh_token` uma vez
4. Salvar credenciais em Script Properties do Apps Script
5. Abrir o notebook `phase0_mock.ipynb` no Colab, rodar as células (sobe Flask + ngrok)
6. Copiar a URL do ngrok para a aba `Config`
7. Rodar `runPhase0Validation()` manualmente uma vez — validar que a aba `Log` recebeu 2 linhas com `Status = OK`
8. Criar o trigger de 5 em 5 minutos (`createTimeTrigger()`) e deixar rodar por 1h (12 execuções)
9. Configurar `clasp login` localmente uma vez, extrair `~/.clasprc.json`, salvar como secret `CLASP_CREDENTIALS` no GitHub
10. Fazer push do código para o repositório, verificar que o pipeline roda verde e faz deploy

## Definition of Done (Fase 0)

- [ ] Apps Script autentica no Salesforce e lê 1 registro real via REST API
- [ ] Resultado gravado na aba `Log` com timestamp, status e duração
- [ ] Apps Script chama o mock do Colab e recebe `{"status": "ok"}`
- [ ] Resultado do Colab também gravado na aba `Log`
- [ ] Trigger de 5 em 5 minutos roda por pelo menos 1 hora contínua sem erro (12 execuções)
- [ ] Pipeline GitHub Actions roda testes unitários (Python + Apps Script) e fica verde
- [ ] Pipeline faz deploy automático do Apps Script via `clasp push` ao mesclar na `master`
- [ ] Nenhum bloqueio de rede/firewall identificado nas chamadas ao Salesforce ou ao ngrok

**Se qualquer item falhar:** documentar o erro exato na aba `Log`, escalar para o time de infraestrutura/segurança da empresa antes de avançar para a Fase 1.

## Riscos Específicos da Fase 0

| Risco | Mitigação |
|-------|-----------|
| Trusted IP Range da Salesforce rejeita IP do Apps Script | Configurar relaxamento de IP no Connected App ou liberar range do Google Cloud |
| Workspace Admin bloqueia `UrlFetchApp` para domínios externos | Escalar para o admin do Workspace da empresa; validar política em Admin Console |
| Workspace Admin desabilita criação de Triggers | Escalar para o admin; alternativa: execução manual/botão no Web App |
| ngrok bloqueado por proxy corporativo | Testar de rede pessoal vs. corporativa; considerar alternativa ao ngrok se bloqueado permanentemente |
| `refresh_token` expira ou é revogado | Documentar processo de renovação manual no runbook |

---

# FASE 1 — MVP FUNCIONAL

**Pré-requisito:** Fase 0 com Definition of Done 100% completo.

**Objetivo:** Substituir os mocks por lógica real.

- Apps Script consulta Nebula Logger de verdade (últimos 30 min, a cada 5 min) via REST API
- Colab roda Prophet (previsão de latência) + Isolation Forest (detecção de anomalias) de verdade
- Apps Script grava toda execução na aba `Log` (histórico) da planilha
- Se anomalia/problema detectado → grava também na aba `Problemas`

**Estrutura de dados (Sheets ampliada):**

Aba `Metrics_5min`: timestamp, serviço, latência média, taxa de erro, risk_score
Aba `Problemas`: timestamp, serviço, risk_score, severidade, descrição, status (Novo/Reconhecido/Resolvido/Falso Positivo)

**Lógica ML no Colab** (retorno do endpoint `/predict`):
```json
{
  "risk_score": 0.85,
  "predicted_latency_ms": 820,
  "minutes_until_failure": 7,
  "anomaly_count": 3,
  "confidence": 0.92
}
```

Reaproveita a lógica de Prophet (decomposição de tendência/sazonalidade/changepoints) + Isolation Forest (detecção de outliers em latência, taxa de erro, status de circuit breaker) já desenhada nas iterações anteriores deste plano.

---

# FASE 2 — SEVERIDADE E COMUNICAÇÃO

**Objetivo:** Quando um problema é gravado na aba `Problemas` com severidade alta, disparar comunicação automaticamente.

**Regra de severidade:**
```
risk_score > 0.85           → CRÍTICA
0.70 < risk_score <= 0.85   → ALTA
0.40 < risk_score <= 0.70   → MÉDIA
risk_score <= 0.40          → BAIXA (não alerta, só loga)
```

**Canais de comunicação (por ordem de simplicidade de implementação):**

1. **Email nativo** (`MailApp.sendEmail()`) — zero configuração extra, disponível direto no Apps Script
2. **Slack Incoming Webhook** — só precisa de 1 URL, `UrlFetchApp.fetch()` simples
3. **WhatsApp** — atenção: a integração de WhatsApp existente é um servidor MCP, consumido por um agente Claude — não é diretamente chamável pelo Apps Script. Para usar WhatsApp a partir do Apps Script, seria necessário expor a API subjacente do WhatsApp (a que o MCP server usa por baixo dos panos) como um endpoint HTTP simples que o Apps Script possa chamar. Investigar isso como item separado antes de assumir como canal Fase 2.

**Recomendação:** Começar com Email (Fase 2 imediata, zero risco), adicionar Slack como upgrade rápido, avaliar WhatsApp como stretch goal após validar a API subjacente.

---

# FASE 3 — APRENDIZADO CONTÍNUO E RESILIÊNCIA

**Objetivo:** Sistema fica mais preciso sozinho + não fica "cego" se o Colab estiver dormindo.

### 3.1 Feedback Loop (aprendizado autônomo)

- Usuário marca um registro da aba `Problemas` como "Falso Positivo" (na planilha ou em um Web App simples)
- Rotina semanal no Colab lê os feedbacks, recalibra o `contamination` do Isolation Forest, re-treina o Prophet com a janela de 30 dias
- Modelo fica mais preciso semana a semana sem intervenção manual

### 3.2 Health Monitoring + Fallback

- Web App do Apps Script exibe painel de saúde: status do Colab (🟢 OK / 🔴 Dormindo / 🟡 Timeout), última execução bem-sucedida, falhas consecutivas
- Se Colab não responder (timeout), Apps Script:
  - Registra `COLAB_SLEEPING` na aba `Config`/`Log` — **não esconde a falha**
  - Opcional: aplica fallback heurístico simples (média móvel + desvio padrão) direto no Apps Script, para não ficar 100% cego enquanto o Colab não acorda
- Botão manual no Web App para forçar nova tentativa de "acordar" o Colab

---

# FASE 4 — HARDENING

- Rate limiting nas chamadas ao Salesforce (respeitar limites de API)
- Retry com backoff exponencial nas chamadas ao Colab
- Auditoria: quem marcou o quê como falso positivo, quando
- Runbook de troubleshooting (o que fazer se Colab não acorda, se token expira, etc.)
- Revisão de retenção de dados nas abas do Sheets (evitar planilha crescer indefinidamente)

---

## ESTRUTURA DE REPOSITÓRIO (visão completa, todas as fases)

```
brunotrolo/
├── PREDICTIVE_MONITORING_PLAN.md      ← este documento
├── phase0-poc/
│   ├── apps-script/
│   │   ├── Code.gs
│   │   ├── SalesforceConnector.gs
│   │   ├── ColabConnector.gs
│   │   ├── SheetLogger.gs
│   │   └── appsscript.json
│   ├── colab/
│   │   ├── phase0_mock.ipynb
│   │   └── mock_api.py
│   └── tests/
│       ├── test_mock_api.py
│       └── appsscript.test.js
├── monitoring/                         ← Fase 1+ (código real)
│   ├── apps-script/
│   ├── colab/
│   │   ├── predictive_model.ipynb
│   │   ├── prophet_forecast.py
│   │   └── isolation_forest_anomaly.py
│   └── tests/
└── .github/
    └── workflows/
        ├── phase0-ci.yml
        └── monitoring-ci.yml           ← Fase 1+
```

---

## DECISÕES TÉCNICAS CRÍTICAS (resumo)

1. **"MCP" a partir do Apps Script = REST API direta.** MCP é protocolo para agentes de IA (Claude), não para scripts. Apps Script replica o que o MCP faz por baixo (OAuth + REST), sem a camada MCP.
2. **Colab sem HTTP nativo → ngrok.** URLs efêmeras são uma limitação aceita nesta fase.
3. **ML fica fora do Salesforce, orquestração fica dentro do fluxo Google.** Nada de Apex/LWC nesta arquitetura — tudo Apps Script + Sheets + Colab.
4. **WhatsApp MCP não é diretamente utilizável pelo Apps Script** sem expor a API subjacente como HTTP simples — tratado como item de investigação separado, não bloqueante.
5. **Deploy do Colab não é automatizável via CI** da forma tradicional — CI testa e versiona a lógica espelhada, execução real permanece manual até decisão de migrar para outra plataforma.

---

## CRITÉRIOS DE SUCESSO GERAIS

- Fase 0 conclui em até 5 dias úteis com todos os itens do Definition of Done atendidos
- Fase 1 gera previsões reais com pelo menos 70% de precisão inicial (melhorando nas fases seguintes)
- Fase 2 dispara alerta por email em menos de 1 minuto após detecção de severidade alta
- Fase 3 mostra redução de falsos positivos semana a semana
- Custo total do projeto: **$0-10/mês** (ngrok free, Colab free, Apps Script/Sheets gratuitos, GitHub Actions dentro do free tier)
