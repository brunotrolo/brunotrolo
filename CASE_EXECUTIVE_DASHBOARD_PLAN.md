# PLANO: DASHBOARD EXECUTIVO DE CASOS SALESFORCE
## Arquitetura: Apps Script + Google Sheets + Web App (toggles + auto-refresh)

**Status:** Plano Aprovado - Pronto para Implementação
**Data:** 2026-08-15
**Repositório:** brunotrolo/brunotrolo
**Role:** AI Solution Architect

---

## CONTEXTO

Reaproveitando a mesma arquitetura já validada no `PREDICTIVE_MONITORING_PLAN.md` (Apps Script + OAuth 2.0 direto no Salesforce + Google Sheets como camada de dados), o objetivo agora é um **dashboard executivo de Casos do Salesforce**, mais simples que o projeto de monitoramento preditivo (sem ML, sem Colab, sem alertas) — apenas visualização com:

- Atualização automática dos dados a cada 10 minutos (backend)
- Refresh automático do front-end do Web App (o executivo não precisa recarregar a página)
- Variações de visualização controladas por **toggles** no próprio dashboard (sem precisar de nova consulta ao Salesforce a cada clique)

Como não há dependência de Colab/ML externo, este projeto é **mais confiável** que o de monitoramento preditivo — elimina o maior risco daquele projeto (Colab "dormindo"). A única infraestrutura externa ao Google é o próprio Salesforce, cuja conectividade via Apps Script já está sendo validada na Fase 0 do projeto irmão.

**Dependência:** Este projeto assume que a Fase 0 do `PREDICTIVE_MONITORING_PLAN.md` (conectividade Apps Script ↔ Salesforce via OAuth REST) foi validada com sucesso. Reaproveita o mesmo Connected App / padrão de credenciais em Script Properties — não precisa repetir a validação de conectividade do zero.

---

## ARQUITETURA

```
Salesforce (objeto Case)
    ↓ (Apps Script consulta via REST API, a cada 10 min — mesmo padrão OAuth já validado)
Google Sheets (camada de dados: snapshot atual + histórico para tendências)
    ↓
Google Apps Script Web App (HTML Service)
    ↓ (JS client-side: auto-refresh a cada 10 min via google.script.run)
Dashboard renderizado com Google Charts + Toggles (troca de visão sem nova consulta)
```

**Por que Google Charts:** biblioteca nativa do Google, carregada do CDN do próprio Google — evita o risco de bloqueio de domínio externo por política do Workspace Admin (o mesmo risco que o ngrok tem no projeto de monitoramento preditivo).

**Por que Sheets como camada intermediária (não consulta live a cada acesso):** permite manter histórico para gráficos de tendência (casos criados/fechados por dia, evolução do backlog) e evita múltiplas chamadas simultâneas ao Salesforce se vários executivos abrirem o dashboard ao mesmo tempo.

**Toggles são client-side:** o Web App busca o dataset completo uma vez a cada ciclo de refresh (10 min) e os toggles apenas re-renderizam esse dataset já carregado (agrupando/filtrando em JavaScript), sem round-trip adicional ao Sheets ou Salesforce a cada clique.

---

## DADOS E MÉTRICAS

**Consulta Salesforce (autoria nova — não existe query de Case no repositório hoje):**

```sql
SELECT Id, CaseNumber, Status, Priority, Origin, RecordType.Name,
       Owner.Name, CreatedDate, ClosedDate, IsClosed
FROM Case
WHERE CreatedDate = LAST_N_DAYS:30
ORDER BY CreatedDate DESC
```

**Métricas executivas cobertas:**
- Total de casos abertos / fechados
- Distribuição por Status, Prioridade, Dono/Fila, Origem
- Aging: casos abertos há mais de X dias (SLA)
- Tendência: casos criados vs. fechados por dia (últimos 30 dias)

**Toggles da interface:**
- **Agrupamento:** Por Status | Por Prioridade | Por Dono | Por Origem
- **Período:** Hoje | Últimos 7 dias | Últimos 30 dias | Todos os casos abertos
- **Escopo:** Todos | Somente Abertos | Somente Fechados

**Risco de volume a observar:** SOQL sem paginação retorna até 2.000 registros. Se o volume de casos nos últimos 30 dias ultrapassar isso, será necessário paginar via `nextRecordsUrl`. Não implementar isso no MVP — validar volume real primeiro e tratar na Fase 3 se necessário.

---

## ESTRUTURA DE DADOS (Google Sheets)

Planilha: `SF-Case-Executive-Dashboard` (separada da planilha do projeto de monitoramento preditivo, para isolar responsabilidades — mesmo Connected App do Salesforce pode ser reaproveitado)

**Aba `Config`:** mesma convenção do projeto irmão (chave/valor: `LAST_RUN`, etc.)

**Aba `Cases_Snapshot`:** sobrescrita a cada execução (10 min) — CaseNumber, Status, Priority, OwnerName, Origin, RecordType, CreatedDate, ClosedDate, IsClosed, AgeDays

**Aba `Metrics_History`:** append-only — Timestamp, TotalOpen, TotalCreatedToday, TotalClosedToday, AvgAgeDays (base para os gráficos de tendência)

**Aba `Log`:** mesma convenção operacional do projeto irmão (Timestamp, Step, Status, DurationMs, Details) — visibilidade de falhas na coleta

---

## ESTRUTURA DE ARQUIVOS

```
case-dashboard/
├── apps-script/
│   ├── Code.gs                     (trigger 10min + doGet do Web App)
│   ├── SalesforceCaseConnector.gs  (auth OAuth + SOQL de Case — reaproveita padrão do SalesforceConnector.gs irmão)
│   ├── SheetWriter.gs              (grava snapshot + histórico)
│   ├── DashboardService.gs         (função server-side chamada pelo front: retorna JSON agregado)
│   ├── appsscript.json
│   └── WebApp/
│       ├── Index.html              (shell do dashboard)
│       ├── Styles.html             (CSS, incluído via HtmlService templating)
│       └── Script.html             (JS client-side: auto-refresh 10min, lógica dos toggles, Google Charts)
└── tests/
    ├── aggregation.test.js         (testa lógica pura de agrupamento/filtro, extraída do Script.html)
    └── appsscript.test.js
```

---

## FASES

### Fase 1 — MVP (coleta + armazenamento + Web App básico)
- `SalesforceCaseConnector.gs`: autentica (mesmo fluxo `refresh_token` do projeto irmão) e executa a SOQL de Case
- `SheetWriter.gs`: grava snapshot em `Cases_Snapshot` e acrescenta linha em `Metrics_History`
- Trigger de 10 em 10 minutos (`ScriptApp.newTrigger(...).everyMinutes(10)`)
- Web App simples (`doGet`) exibindo tabela com os dados do snapshot, sem toggles ainda
- **Definition of Done:** Web App acessível via URL, mostrando dados reais de Case, atualizados a cada 10 min

### Fase 2 — Dashboard completo (toggles + gráficos + auto-refresh)
- `DashboardService.gs`: função chamada pelo front (`google.script.run.getDashboardData()`) retorna JSON com snapshot + histórico
- `Script.html`: implementa os 3 toggles (Agrupamento / Período / Escopo), renderiza com Google Charts (barras para distribuição, linha para tendência)
- Auto-refresh client-side:
```javascript
function refreshDashboard() {
  google.script.run.withSuccessHandler(renderDashboard).getDashboardData();
}
setInterval(refreshDashboard, 10 * 60 * 1000);
refreshDashboard();
```
- **Definition of Done:** todos os toggles funcionam sem nova chamada ao backend; dashboard atualiza sozinho a cada 10 min sem reload manual da página

### Fase 3 — CI/CD + Hardening
- `.github/workflows/case-dashboard-ci.yml`: testes unitários (lógica de agregação em `aggregation.test.js` via Jest) + deploy automático via `clasp push` — mesma convenção do `phase0-ci.yml` do projeto irmão
- Tratamento de erro: se a coleta falhar, Web App exibe "última atualização" com timestamp e aviso de dado potencialmente desatualizado (mesma filosofia de transparência do health-check do projeto de monitoramento preditivo)
- Paginação SOQL se o volume de casos exigir (ver risco de volume acima)
- Controle de acesso do Web App: deploy com "Executar como: Eu (desenvolvedor)" + "Quem tem acesso: qualquer pessoa no domínio da empresa" (dashboard interno, não público)

---

## DECISÕES TÉCNICAS

1. **Reaproveita o Connected App / padrão OAuth** já documentado em `SALESFORCE_MCP_SETUP.md` e usado no `PREDICTIVE_MONITORING_PLAN.md` — sem necessidade de nova configuração de autenticação.
2. **Planilha separada** da do projeto de monitoramento preditivo, para isolar responsabilidades (Case dashboard vs. Nebula Logger). Mesmas credenciais Salesforce podem ser reutilizadas.
3. **Sem Fase 0 própria de conectividade** — depende da Fase 0 do projeto irmão já ter validado que Apps Script consegue autenticar e chamar a REST API do Salesforce na estrutura da empresa.
4. **Google Charts em vez de qualquer lib externa** — reduz risco de bloqueio por política de rede corporativa (mesma classe de risco do ngrok, evitada aqui).
5. **Toggles são 100% client-side** — apenas 1 fetch de dados a cada 10 min, toggles só re-renderizam o dataset já carregado.

---

## CRITÉRIOS DE SUCESSO

- Fase 1 conclui com dados reais de Case visíveis no Web App
- Fase 2: os 3 toggles funcionam instantaneamente (sem lag perceptível) e o dashboard atualiza sozinho a cada 10 min
- Fase 3: pipeline CI roda testes e faz deploy automático ao mesclar na branch de destino
- Custo total: **$0/mês** (Apps Script, Sheets e Google Charts são gratuitos; sem dependência de Colab/ngrok)
