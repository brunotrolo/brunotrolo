# Plan — `busca-cliente/001` — Busca e identificação de cliente com NBO e seleção de produto

> **Desenhado sem System Design ratificado — revisar tokens/componentes quando ratificado.**

| Campo | Valor |
|---|---|
| **Domínio** | `busca-cliente` — Busca de Cliente |
| **Capacidade** | 001 — Busca e identificação de cliente com NBO e seleção de produto |
| **Slug** | `001-busca-identificacao-cliente-nbo-selecao-produto` |
| **Status** | pronto para build — protótipo validado (gate VIII) + complemento técnico `fsc-journey-tech-planner` — aguardando execução de `tasks.md` |
| **Spec** | `specs/busca-cliente/001-busca-identificacao-cliente-nbo-selecao-produto/spec.md` (24 cenários — 23 ativos + Cenário 24 removido, 17× [NEEDS CLARIFICATION] — revisão integral 2026-09-06 + ajustes pós-protótipo) |
| **Constitution gates** | Princípio I (fundação dados `_fundacao/001` não iniciada — autorizada exploração), Princípio II (System Design não iniciado — gate leve, aviso acima), Princípios IV e V NON-NEGOTIABLE aplicados passo a passo |
| **System Design** | `docs/design-system/SYSTEM-DESIGN.md` — **não iniciado** |
| **Decisões de arquitetura de origem** | `ConversaGoogleGemini.md` — backend 100% Apex desacoplado sem Integration Procedures, frontend LWC Modular via LMS (cockpit/busca/NBO/hub/drawer), OmniStudio reservado para jornadas transacionais subsequentes, modelo Account+Contact sem Person Account + Opportunity para NBO + Asset para contratos/cartões, sem objetos `FinServ__*` |

> Este `plan.md` cobre **apenas o desenho de UX/UI** (papel `fsc-journey-ux-designer`). Não detalha Apex, integrações ou modelo de dados — isso é do `fsc-journey-tech-planner`. Artefatos nomeados aqui são nomes concretos de componentes/canais LWC para dar rastreabilidade a `tasks.md`/`architecture.md` e ao `prototype/`.

---

## 1. Tabela de passos — linguagem de negócio (24 cenários → 10 passos + 1 transversal)

Cobertura: todos os 24 cenários do `spec.md` estão mapeados em `Cenários` abaixo. Nenhum cenário sem linha navegável no futuro `prototype/`.

| Passo | Persona | Gatilho | Dados lidos | Dados gravados | Pontos de decisão | Condição de saída | Cenários |
|---|---|---|---|---|---|---|---|
| **P1 — Entrada e validação por modo** | Operador | Operador escolhe o modo (PF/PJ/Protocolo/Não cliente) centralizado no topo, digita o valor abaixo e confirma pelo botão "Localizar" ou Enter | Nenhum (validação local); máscara só em PF/PJ | Nenhum em SF nesta etapa (valor normalizado publicado em memória via LMS) | PF 11 dígitos vs PJ 14 numérico vs PJ 14 alfanumérico BACEN vs Protocolo 5+ chars vs Não cliente qualquer valor; formato inválido mantém "Localizar" desabilitado | Botão/Enter habilitado apenas com formato válido do modo; máscara aplicada sem alterar valor lógico | 1, 2, 3, 4, 5 + EL-01, EL-02 |
| **P2 — Orquestração paralela de consultas corporativas** | Sistema (em nome do operador) | Evento `CUSTOMER_SEARCH_TRIGGERED` com documento normalizado | Dados cadastrais corporativos, carteira completa (Porto Bank + Holding), elegibilidade NBO, detalhe de vias de cartão (lazy) | Nenhum síncrono em SF; upsert assíncrono em segundo plano (fora do escopo UI, a cargo do tech-planner) | Quais fontes consultar em paralelo vs. lazy (vias só se cartão for selecionado) | Três chamadas desacopladas disparadas sem bloquear umas às outras; cada área da tela escuta seu próprio retorno | 21, parte de 6/7/11 |
| **P3 — Cartão de identificação enriquecido** | Operador (leitura) | Retorno da consulta cadastral | Nome/razão, tipo, documento, segmento, situação do cadastro, contato, endereço, renda/score, agência/conta | Nenhum | PF vs PJ na apresentação; dado disponível vs. ausente | Cartão enriquecido renderizado com skeleton enquanto carrega; dados refletem retorno corporativo em memória | 6 + parte de 21 |
| **P4 — Hub de produtos Porto Bank (grade transacional)** | Operador (seleção) | Retorno da carteira Porto Bank + gate NBO decidido | Lista de vínculos ativos por tipo com resumo (ex.: "4 plásticos", "6 cotas", "5 posições") | Nenhum nesta etapa; seleção publicada via LMS | Produto com sub-seleção (cartão/consórcio/investimentos) vs. seleção direta (conta digital); produto sem vínculo não gera cartão ocioso | Grade renderizada só após decisão da oferta (ou direto sem oferta); cada tipo com um cartão selecionável | 7, 9 + EL-12 |
| **P5 — Visibilidade informativa da Holding** | Operador (leitura) | Retorno da carteira Holding | Vínculos Porto Seguro/Holding (seguro auto, residencial, saúde e equivalentes) | Nenhum (somente leitura) | Distinguir visualmente Holding (informativo) de Porto Bank (transacional) | Bloco informativo renderizado separado, sem ação de seleção, com skeleton próprio | 8 |
| **P6 — Banner de oferta NBO (pré-atendimento prioritário, com gate)** | Operador (abordagem) | Retorno do motor de NBO | Oferta elegível: narrativa (produto, elegibilidade, bandeiras, limite pré-aprovado, anuidade, benefícios) | Ao abordar/dispensar: registro de abordagem/dispensa (Opportunity — fora do escopo UI, via Apex assíncrono) + liberação do hub | Uma vs. múltiplas ofertas; ofertas duplicadas suprimidas; Abordar vs. Dispensar (sem pular) | Banner destacado se houver oferta; recolhido se não houver; com oferta, o hub fica bloqueado com aviso até a decisão | 11, 12, 13, 14, 15 + RN-04, RN-05 |
| **P7 — Seleção primária do produto motivador** | Operador | Clique/toque em um cartão do hub (conta digital) | Contexto já em memória (cliente + carteira) | Contexto de interação parcial (cliente + produto) publicado via LMS | Produto exige modal (cartão/consórcio/investimentos) vs. encerra aqui (conta digital); clique errado reversível antes de avançar | Estado visual de selecionado aplicado; contexto fixado; jornada de identificação considerada encerrada para produtos sem sub-seleção | 16 + RN-07 |
| **P8 — Modais de sub-seleção condicional** | Operador | Seleção de cartão, consórcio ou investimentos no hub | Vias/plásticos (bandeira, categoria, final mascarado, portador, limite, anuidade, situação); cotas (tipo, grupo/cota, valor, contemplação, parcela, situação); posições (classe, produto, valor, rentabilidade, vencimento, risco) | Contexto final (cliente + produto + via/cota/posição) publicado via LMS | Item ativo vs. cancelado vs. bloqueado; titular vs. adicional; várias cotas no mesmo grupo; múltiplas páginas se 10+ itens | Modal aberto sem recarregar grade; item selecionado fixa contexto final e encerra identificação; Cancelar desfaz a seleção | 17, 18, 19, 20 + EL-03, EL-04, EL-05 |
| **P9 — Estados transversais: carregamento, ausência e falha parcial** | Operador | Qualquer retorno (sucesso, vazio, erro, timeout) | Flags de estado por área (loading / empty / error / partial) | Nenhum | Sucesso total vs. falha parcial de uma fonte vs. indisponibilidade total vs. documento não encontrado | Cada área com skeleton/placeholder; falha de NBO não suprime cadastro e vice-versa; mensagem discreta sem bloquear seleção; documento não encontrado com mensagem clara e campo preservado | 10, 21, 22 + EL-08, EL-09 |
| **P10 — REMOVIDO (histórico de sessão retirado por decisão do negócio)** | — | — | — | — | — | Sem re-acesso rápido; cada identificação parte de nova busca (Cenário 24 removido) | — |
| **PT — Extensibilidade de catálogo (transversal, não é tela)** | Negócio/Admin | Configuração de novo tipo de produto Porto Bank | Catálogo configurável de tipos de produto (nome, ícone, regra de via) | Nenhum em runtime (config via metadado) | — | Novo produto surge no hub quando cliente o possui, sem refatorar busca, NBO ou drawer de cartões | 23 + RN-12 |

**Saída formal da capacidade (consumida por `atendimento/*` e `household-360/*`):** `Contexto de interação = { cliente identificado (Account+Contact por documento) + produto Porto Bank selecionado + item específico (via/cota/posição) quando aplicável }` + `registro de abordagem/dispensa de oferta` quando houve NBO. Ver RN-09.

---

## 2. Vereditos padrão vs. customizado — gate padrão/declarativo primeiro (Princípio IV)

Reavaliação do zero, passo a passo, conforme Princípio IV. Para cada passo: veredito **padrão** ou **customizado** + justificativa de uma linha por que o padrão não cobre quando customizado. Só para passos customizados aplica-se a árvore de decisão do Princípio V (licenciamento → iteração negócio → exibição registro → lógica complexa → orquestração → Experience Cloud).

> **Gate de licenciamento (Q1 da árvore):** `constitution.md` registra `[NEEDS CLARIFICATION: OmniStudio licenciado?]` — não confirmado. Por regra do papel, **assume-se LWC por padrão e registra-se a dependência**. Isso por si só já desvia FlexCard/OmniScript para LWC até confirmação, independentemente dos demais critérios.

### P1 — Entrada e validação por modo
- **Veredito:** **customizado**
- **Por que padrão não cobre (1 linha):** Componentes padrão (Lightning input / Flow screen) não oferecem seletor PF/PJ/Protocolo/Não cliente com máscara dinâmica CPF vs. CNPJ numérico vs. CNPJ alfanumérico BACEN com normalização, validação client-side de comprimento/formato que mantém ação desabilitada e hotkeys (Enter/F2) com foco automático sem `lock` de tela.
- **Tecnologia (árvore):** Q1 licenciamento não confirmado → LWC; Q4 lógica client-side complexa + performance (TMA, cada milissegundo conta) → **LWC**
- **Artefato concreto:** `c-customer-search-bar` (dentro de `c-customer-search-shell` orquestrador) — publica `CustomerInteractionChannel__c : { type: 'CUSTOMER_SEARCH_TRIGGERED', documentNormalized, documentMasked, docType, timestamp }`
- **Nota vs. ConversaGemini:** converge com a conversa (LWC), mas aqui por Q1+Q4, não por preferência.

### P2 — Orquestração paralela
- **Veredito:** **customizado** (camada UI de orquestração; persistência é do tech-planner)
- **Por que padrão não cobre:** Flow declarativo / ações padrão não executam chamadas externas paralelas não-bloqueantes com skeletons independentes por área e publicação via LMS sem travar navegação.
- **Tecnologia:** Q4 estado complexo + Q5 orquestração de múltiplas chamadas → **LWC (orquestrador)**
- **Artefato:** `c-customer-search-shell` (shell/container) — dispara `Promise.allSettled` para NBO + cadastro/carteira; vias em lazy; assina/publica em `CustomerInteractionChannel__c`
- **Sem detalhar Apex:** contratos de serviço ficam para tech-planner.

### P3 — Faixa de identificação rápida
- **Veredito:** **customizado**
- **Por que padrão não cobre:** Highlights Panel / compact layout padrão só lê registro já gravado em SF; aqui a faixa deve refletir DTO em memória antes do upsert assíncrono e exibir skeleton por área com densidade compacta bancária.
- **Tecnologia:** Q1 → LWC; Q3 exibiria FlexCard se licenciado (painel de contexto), mas Q1 força LWC. Q4 performance → **LWC**
- **Artefato:** `c-customer-header-summary`
- **Alternativa se OmniStudio vier a ser licenciado:** `FlexCard c-customer-header-flex` seria reavaliada — registrar como dívida de reavaliação, não como decisão atual.

### P4 — Hub de produtos Porto Bank
- **Veredito:** **customizado**
- **Por que padrão não cobre:** Related List / Dynamic Related List é tabela, não grade de cartões selecionáveis com contagem agregada por tipo, estado selecionado reversível e catálogo extensível sem refatorar layout.
- **Tecnologia:** Q4 lógica de seleção + extensibilidade por metadado + Jest → **LWC**
- **Artefato:** `c-product-hub` — renderiza `c-product-card` por tipo; dados vêm de `CustomerInteractionChannel__c`; publica `PRODUCT_SELECTED`

### P5 — Visibilidade informativa Holding
- **Veredito:** **customizado**
- **Por que padrão não cobre:** Mesmo motivo de P3/P4 + requisito de distinção visual transacional vs. informativo e ausência de ação de seleção — não expressável por related list padrão sem customização de estilo/comportamento por área.
- **Tecnologia:** Q1 → LWC; Q3 seria FlexCard informativa se licenciada → **LWC**
- **Artefato:** `c-holding-strip` (ou seção dentro de `c-product-hub` com `variant="holding-informative"` — decisão final no protótipo)

### P6 — Banner NBO
- **Veredito:** **customizado**
- **Por que padrão não cobre:** Componente padrão de banner/notificação não colapsa automaticamente quando sem oferta, não carrega paralelo com skeleton próprio, não distingue oferta de erro de sistema e não orquestra ações Abordar/Dispensar com supressão por sessão.
- **Tecnologia:** Q1 → LWC; Q2 iteração por negócio (regra de priorização de ofertas) poderia puxar para OmniScript se licenciado e se negócio exigir edição sem deploy, mas Q1 + Q4 (performance pré-atendimento) prevalecem → **LWC**
- **Artefato:** `c-nbo-banner` — consome `NBO_OFFERS_AVAILABLE` / `NBO_EMPTY`; publica `NBO_APPROACHED` / `NBO_DISMISSED`

### P7 — Seleção primária
- **Veredito:** **customizado**
- **Por que padrão não cobre:** Ação padrão New/Edit/Log a Call não fixa "contexto de interação" em 1 gesto com feedback visual reversível e encerramento de jornada sem criar Case/protocolo nesta capacidade.
- **Tecnologia:** Q4 interação stateful → **LWC** (lógica dentro de `c-product-hub` + canal LMS `INTERACTION_CONTEXT_FIXED`)
- **Artefato:** (sem componente novo) — comportamento de `c-product-hub` (só conta digital encerra aqui; demais abrem modal P8)

### P8 — Modais de sub-seleção (cartão, consórcio, investimentos)
- **Veredito:** **customizado**
- **Por que padrão não cobre:** Related List de `Asset`/`Card` não entrega modal com cards por item (vias com máscara `•••• 1234`, badges funcionais por situação verde/cinza/âmbar, distinção titular vs. adicional; cotas com grupo/cota/valor/contemplação; posições com rentabilidade/vencimento/risco), paginação/scroll para 10+ itens e seleção que fixa contexto final sem recarregar grade (Cancelar desfaz a seleção).
- **Tecnologia:** Q1 → LWC; Q4 lógica condicional complexa → **LWC**
- **Artefatos:** `c-card-drawer` (aberto por `PRODUCT_SELECTED { productType: 'CARTAO' }`, publica `CARD_SELECTED`), `c-consorcio-drawer` (`PRODUCT_SELECTED { CONSORCIO }`, publica `COTA_SELECTED`), `c-investimento-drawer` (`PRODUCT_SELECTED { INVESTIMENTOS }`, publica `INVESTIMENTO_SELECTED`)

### P9 — Estados transversais
- **Veredito:** **customizado** (padrão transversal)
- **Por que padrão não cobre:** Componentes padrão não oferecem skeleton por área, mensagens discretas de falha parcial por fonte e preservação do documento digitado em indisponibilidade total sem exibir dado obsoleto.
- **Tecnologia:** **LWC (padrão de estado)** — `c-skeleton`, `c-inline-error` (ou SLDS `slds-skeleton` + `illustration` states) consumidos por todos os componentes acima
- **Artefato:** pattern, não componente de negócio novo

### P10 — REMOVIDO (histórico retirado por decisão do negócio; sem componente, sem task)

### PT — Extensibilidade
- **Veredito:** **customizado** (propriedade arquitetural)
- **Por que padrão não cobre:** App Builder declarativo exige rearranjo manual de componentes por tipo; extensibilidade "adicionar tipo sem tocar nos demais" exige catálogo dirigido por metadado (Custom Metadata Type) consumido por LWC.
- **Tecnologia:** **LWC + Custom Metadata Type** (tipo a cargo do tech-planner; UI apenas consome)
- **Artefato:** config `ProductCatalog__mdt` consumida por `c-product-hub`

---

## 3. Árvore de decisão Princípio V — síntese por passo customizado

| Passo | Q1 Licenciamento OmniStudio? | Q2 It. negócio sem deploy? | Q3 Exibição de registro leve? | Q4 Lógica client-side / performance? | Q5 Orquestra múltiplas chamadas? | Q6 Experience Cloud? | Resultado |
|---|---|---|---|---|---|---|---|
| P1 | Não confirmado → LWC | — | — | Sim (4 modos, máscara BACEN, hotkeys, TMA) | — | Não | **LWC** `c-customer-search-bar` |
| P2 | Não confirmado → LWC | — | — | Sim | Sim (paralelo) | Não | **LWC** `c-customer-search-shell` |
| P3 | Não confirmado → LWC | Não | Sim, mas Q1 bloqueia FlexCard | Sim (skeleton, DTO em memória) | — | Não | **LWC** `c-customer-header-summary` |
| P4 | Não confirmado → LWC | Não | Não (grade interativa) | Sim | — | Não | **LWC** `c-product-hub` |
| P5 | Não confirmado → LWC | Não | Sim, mas Q1 bloqueia | Sim | — | Não | **LWC** `c-holding-strip` |
| P6 | Não confirmado → LWC | Potencialmente sim (priorização), mas Q1 prevalece | Não (banner com ação) | Sim (colapso, supressão) | — | Não | **LWC** `c-nbo-banner` |
| P7 | Não confirmado → LWC | Não | Não | Sim | — | Não | **LWC** (comportamento em `c-product-hub`, só conta digital) |
| P8 | Não confirmado → LWC | Não | Não (modais interativos) | Sim | Sim (lazy) | Não | **LWC** `c-card-drawer` + `c-consorcio-drawer` + `c-investimento-drawer` |
| P9 | — | — | — | Sim | — | Não | **LWC pattern** |
| P10 | — | — | — | — | — | — | **REMOVIDO** |

> **Leitura:** Se OmniStudio vier a ser confirmado como licenciado, reavaliar P3/P5 (FlexCard candidata forte para painéis informativos) e P6/P2 (OmniScript + IPs) — mas isso **não altera** a decisão atual, e qualquer reavaliação exige registro em `SYSTEM-DESIGN.md` e confirmação do negócio, não alteração silenciosa aqui.

---

## 4. Classificação final da capacidade

**100% customizado**

Nenhum passo desta jornada é coberto por recurso padrão/declarativo do FSC (Lightning App Builder com componentes padrão/dinâmicos, page layouts, related lists, ações padrão, list views, Flow declarativo sem LWC embutido) pelos motivos registrados acima — todos exigem seletor de 4 modos com máscara BACEN, DTO em memória antes de persistência, skeletons independentes, grade extensível por metadado, modais de sub-seleção com badges funcionais ou gate da oferta sobre o hub.

- **Alternativa padrão mais próxima rejeitada:** Lightning App Builder com Highlights Panel (faixa), Related Lists de `Asset`/`Opportunity` (produtos/NBO) e Flow screen para busca — rejeitada porque (1) lê apenas registro gravado, não DTO pré-upsert, (2) não oferece máscara/validação BACEN client-side nem hotkeys, (3) não permite grade de cartões extensível nem drawer com paginação/badges, e (4) não orquestra chamadas paralelas não-bloqueantes com recolhimento automático quando sem oferta.
- **Gate do orchestrator:** por ser `100% customizado`, exige justificativa (esta seção) + confirmação explícita do usuário antes de avançar para `prototype/` e `tasks.md` (Constituição Princípio IV, gate rígido). **Não é falha** — é o esperado para esta jornada de alta performance.

Se algum passo vier a ser considerado "padrão" após fundação de dados e confirmação de objetos, a classificação migra para `misto` e este `plan.md` é revisado com a mesma justificativa por passo.

---

## 5. Premissas abertas mantidas — 17× [NEEDS CLARIFICATION] (não bloquearam o desenho; item 11 removido com o histórico)

Conforme instrução do orchestrator, o desenho prosseguiu sem bloquear. Cada item abaixo é **premissa aberta** — nenhuma regra foi inventada. O protótipo usa placeholder neutro e `tasks.md`/`architecture.md` não detalham regra até decisão do negócio. Revisão 2026-09-06 adicionou 17–18 (perguntadas na conversa e não respondidas).

| # | Premissa aberta — [pergunta] | Impacto no desenho atual | Placeholder no protótipo |
|---|---|---|---|
| 01 | Premissa aberta — [NEEDS CLARIFICATION: LGPD e sigilo bancário — base legal e trilha de consentimento para exibir dados demográficos, carteira Holding e ofertas a qualquer operador que informe CPF/CNPJ? Há perfis que veem menos dados?] | Visibilidade total assumida como ilustrativa; sem controle de perfis desenhado | Sem badge de restrição; nota "visibilidade sujeita a perfis LGPD" |
| 02 | Premissa aberta — [NEEDS CLARIFICATION: Quem pode ver o quê — operadores Porto Bank veem carteira completa da Holding por padrão ou apenas resumo? Restrição por papel/segmento?] | P5 desenhado como resumo informativo | P5 com dados fictícios genéricos e rótulo "informativo — sem ação" |
| 03 | Premissa aberta — [NEEDS CLARIFICATION: Retenção e ciclo de vida da oferta — por quanto tempo oferta permanece válida? Quando vira perdida/expirada e quando pode voltar?] | Sem expiração desenhada | Banner sem contador; sem estado "expirada" |
| 04 | Premissa aberta — [NEEDS CLARIFICATION: Múltiplas ofertas — regra de priorização/ordenação (propensão, valor, ordem fixa)? Quantas exibir simultaneamente?] | P6 com 1 oferta em destaque | Protótipo mostra 1 oferta; lista múltipla como "ver N ofertas" desabilitado |
| 05 | Premissa aberta — [NEEDS CLARIFICATION: Dispensa de oferta — registrar motivo? Por quanto tempo suprimida (sessão, dias, até nova elegibilidade)?] | Supressão desenhada como sessão | Ao dispensar, banner some na sessão; sem campo de motivo |
| 06 | Premissa aberta — [NEEDS CLARIFICATION: Prevalência de dados — quando base cadastral diverge do cadastro consolidado 360°, qual prevalece e há trilha de auditoria?] | Sem regra de prevalência | Faixa reflete retorno corporativo; sem badge "divergente" |
| 07 | Premissa aberta — [NEEDS CLARIFICATION: CNPJ alfanumérico BACEN — validação exata além de formato (algoritmo verificador, tabela conversão)? Mensagem exata?] | P1 valida formato (14 pos alfanumérico) + DV numérico quando aplicável | Mensagem genérica "Documento em formato inválido" |
| 08 | Premissa aberta — [NEEDS CLARIFICATION: Concorrência — dois operadores buscam mesmo documento simultaneamente; atualização progressiva idempotente? Risco duplicidade? Regra desempate?] | Sem lock desenhado | Sem indicador de concorrência |
| 09 | Premissa aberta — [NEEDS CLARIFICATION: Cliente PJ — exibir/escolher sócio/representante ao telefone ou apenas empresa basta para contexto?] | P3/P7 fixam apenas empresa | Sem seletor de representante; nota "empresa" |
| 10 | Premissa aberta — [NEEDS CLARIFICATION: Mensageria de falha parcial — texto exato quando ofertas ou carteira indisponíveis? Código de erro visível?] | Mensagem discreta genérica | "Ofertas indisponíveis no momento" / "Carteira indisponível" sem código |
| 11 | [REMOVIDO com o Cenário 24 — sem histórico de sessão nesta jornada] | — | — |
| 12 | Premissa aberta — [NEEDS CLARIFICATION: Elegibilidade fina — "não possui produto" considera apenas posse ativa, ou inclui cancelados/encerrados? Upgrade (Gold→Black) conta como NBO?] | Sem filtro fino | Oferta exibida conforme motor; sem badge "upgrade" |
| 13 | Premissa aberta — [NEEDS CLARIFICATION: Auditoria — quais eventos auditar (busca, exibição oferta, seleção, dispensa)? Retenção dos logs?] | Sem trilha visível ao operador | Sem ícone de auditoria; eventos apenas em canal LMS para tech-planner |
| 14 | Premissa aberta — [NEEDS CLARIFICATION: Acessibilidade e responsividade — WCAG ou mobile nesta jornada ou apenas desktop console?] | Desktop console, WCAG AA como baseline implícito | Layout desktop; sem breakpoint mobile desenhado |
| 15 | Premissa aberta — [NEEDS CLARIFICATION: Limite e paginação — máximo de produtos/vias a exibir? Ordenação (ativos primeiro, mais recentes)?] | Sem limite aplicado | Grade sem paginação; drawer com scroll; ordem "ativos primeiro" como placeholder visual |
| 16 | Premissa aberta — [NEEDS CLARIFICATION: Busca por cliente estrangeiro ou sem CPF/CNPJ (passaporte, ID estrangeiro) — fora de escopo ou extensão futura?] | Fora de escopo desta capacidade (RN-01) | Campo aceita apenas CPF/CNPJ; sem opção passaporte |
| 17 | Premissa aberta — [NEEDS CLARIFICATION: Validação de identidade — há etapa de perguntas de segurança/autenticação antes de exibir dados sensíveis, ou depois da seleção?] | Sem gate de MFA/validação positiva nesta jornada | Dados exibidos após documento sem gate — a decidir se insere gate (perguntado na conversa, não respondido) |
| 18 | Premissa aberta — [NEEDS CLARIFICATION: Pós-seleção imediata — ao fixar contexto o sistema cria protocolo automaticamente e abre workspace, ou só disponibiliza contexto?] | Sem criação automática de Case nesta capacidade | Protótipo encerra com "Contexto fixado" — criação de protocolo fica para `atendimento/001` |

---

## 6. Reuso dentro do domínio e acoplamento entre domínios

- **Reuso dentro de `busca-cliente`:** Primeira capacidade do domínio — **não há componente pré-existente para reusar**. Os componentes nomeados acima (`c-customer-search-shell`, `c-customer-search-bar`, `c-nbo-banner`, `c-customer-header-summary`, `c-product-hub`, `c-card-drawer`, `c-consorcio-drawer`, `c-investimento-drawer`) tornam-se o inventário base do domínio. Capacidade futura `busca-cliente/002` (desambiguação de household) **deve** reusar `c-customer-search-bar` e `c-customer-header-summary` em vez de duplicar — registrar em seu `plan.md`.
- **Mapeamento nomes de build ↔ nomes do protótipo:** no build Salesforce os componentes chamam-se `c-*` (ex.: `c-customer-search-bar`); no kit de prototipagem vivem como `ui/buscaClienteSearchBar` (tag `ui-busca-cliente-search-bar`) etc., com o shell em `page/buscaCliente`. A correspondência 1:1 está na tabela do §8. A comunicação no build é via LMS (`CustomerInteractionChannel__c`); no protótipo, o shell compõe os filhos via `@api` props e custom events (`buscar`, `abordar`, `dispensar`, `productselect`) — equivalência mock fiel para validação de UX.
- **Acoplamento silencioso com outro domínio:** **Nenhum.** Não há importação de componente de `atendimento`, `nbo`, `household-360` ou `produto-consorcio`. A passagem de estado para domínios consumidores ocorre **via dado** (contexto de interação + Opportunity/Asset gravados em SF), não via estado compartilhado de front-end. `atendimento/001` consumirá `Opportunity`/`Asset`/`Account`/`Contact` por SOQL/API, não o LMS desta capacidade. Se surgir proposta de card compartilhado (ex.: resumo household útil em `atendimento` e `nbo`), **sinalizar como candidato a `_fundacao/` ou domínio compartilhado** para decisão do usuário — não acoplar silenciosamente.
- **LMS como contrato interno do domínio:** `CustomerInteractionChannel__c` é **interno a `busca-cliente/001`**. Não é contrato entre domínios. Mensagens: `CUSTOMER_SEARCH_TRIGGERED`, `CUSTOMER_IDENTIFIED`, `NBO_OFFERS_AVAILABLE`/`NBO_EMPTY`, `PRODUCT_SELECTED`, `CARD_SELECTED`, `INTERACTION_CONTEXT_FIXED`, `NBO_APPROACHED`/`NBO_DISMISSED`.
- **Microfrontends desacoplados:** cada LWC assina/publica no LMS sem `@api` pai→filho; adicionar produto novo = novo `c-product-card` + entrada em `ProductCatalog__mdt`, sem tocar em `c-nbo-banner` ou `c-card-drawer` (requisito PT / Cenário 23).

---

## 7. Gaps para `fsc-design-system-architect` (System Design ainda não iniciado)

Estes itens não podem ser fechados nesta capacidade e precisam de ratificação em `docs/design-system/SYSTEM-DESIGN.md`. O protótipo usará defaults SLDS mínimos e sinalizará a divergência.

| Gap | Por que precisa de System Design | Default usado no protótipo |
|---|---|---|
| Tokens de cor funcional de status | Verde ativo, cinza cancelado, âmbar bloqueado/pendente precisam de token semântico, não hex solto | `slds-theme_success / slds-theme_shade / slds-theme_warning` como placeholder |
| Token de destaque NBO | Banner de oferta não pode parecer erro/alerta de sistema | `light blue scoped notification` + `utility:opportunity` placeholder |
| Densidade compacta bancária | Operador precisa ver faixa + banner + grade sem scroll | `slds-grid` + `slds-text-heading_small / body_regular` placeholder, sem token de densidade ratificado |
| Padrão de skeleton/loading por área | Cada microfrontend carrega independente | `slds-skeleton` pulsante por área |
| Padrão de drawer/modal lateral | `c-card-drawer` como off-canvas vs. modal precisa de padrão fechado | SLDS Modal enxuto como placeholder; drawer como variante a ratificar |
| Tipografia, elevação, raio de borda | Consistência entre cartões do hub e header | SLDS defaults; sem tokens customizados |
| Estados vazio/erro/ilustração | Documento não encontrado, hub vazio, falha parcial/total | `illustration` SLDS + mensagem discreta placeholder |
| Acessibilidade baseline | WCAG AA, navegação por teclado, leitor de tela para badges e máscara | `aria-live` em banner e faixa, foco gerenciado no shell — a validar com `experience-accessibility-validate` quando System Design ratificar |

---

## 8. Rastreabilidade — cenários → passos → artefatos

| Cenário(s) | Passo | Artefato build → componente do protótipo | Verificação no protótipo (`npm run open -- /busca-cliente`) |
|---|---|---|---|
| 1–5, EL-01/02 | P1 | `c-customer-search-bar` → `ui/buscaClienteSearchBar` | Busca `123.456.789-00` e `12.ABC.345/0001-90`: foco automático, 4 modos no topo, máscara só PF/PJ, "Localizar" desabilitado até formato válido, Enter/F2 |
| 6 | P3 | `c-customer-header-summary` → `ui/buscaClienteHeaderSummary` | Cartão enriquecido após busca: contato, endereço, renda/score, agência/conta, status |
| 7, 9, EL-12 | P4+P9 | `c-product-hub` → `ui/buscaClienteProductHub` | Grade com resumos ("4 plásticos", "6 cotas", "5 posições"); `111.111.111-11` sem hub Porto Bank, sem erro |
| 8 | P5 | `c-holding-strip` → `ui/buscaClienteHoldingStrip` | Bloco informativo com ícones (6 itens no João), sem seleção |
| 11–15 | P6 | `c-nbo-banner` → `ui/buscaClienteNboBanner` | Narrativa Black (bandeiras, limite, anuidade, benefícios); hub bloqueado com aviso até Abordar/Dispensar; sem oferta libera direto |
| 16 | P7 | `c-product-hub` (estado selecionado) | Conta digital: seleção fixa contexto e encerra |
| 17–20, EL-03/04/05 | P8 | `c-card-drawer` → `ui/cardDrawerModal`; `c-consorcio-drawer` → `ui/consorcioDrawerModal`; `c-investimento-drawer` → `ui/investimentoDrawerModal` | Cartão: 4 vias com titular/adicional; consórcio: 6 cotas incl. 2 no grupo Rural 9012; investimentos: 5 posições; Cancelar desfaz seleção |
| 10, 21, 22, EL-08/09 | P9 | patterns no shell `page/buscaCliente` | `000.000.000-00` não encontrado com doc preservado; `999.999.999-99` NBO indisponível sem bloquear; `888.888.888-88` erro total com retry; skeletons por área |
| 24 | — | REMOVIDO | Sem histórico; sem re-acesso |
| 23 | PT | `c-product-hub` + `ProductCatalog__mdt` | Não é tela — propriedade verificada adicionando tipo fictício sem tocar nos demais |

Princípio IX: cada cenário acima tem caminho navegável no `prototype/` (roteiro em `prototype/README.md`) e cada artefato acima tem linha em `architecture.md` com quem chama/lê/escreve/consome.

---

## 9. Anti-patterns checados

- [x] Não se recorreu a LWC/OmniStudio antes de checar padrão — cada passo tem o porquê específico de insuficiência do padrão.
- [x] Não se escolheu OmniStudio "porque é padrão FSC" — Q1 (licenciamento não confirmado) forçou LWC; FlexCard/OmniScript só se licenciado e com iteração sem deploy comprovada.
- [x] Não se escolheu LWC por conforto do time — escolha veio de Q4 (lógica client-side complexa, TMA, máscara BACEN) e Q5 (orquestração paralela).
- [x] Estado entre microfrontends via LMS com contrato interno ao domínio no build (no protótipo, composição via `@api`/eventos com o shell — equivalência mock), e sem vazar como contrato entre domínios.
- [x] Nenhum objeto/campo nomeado como decisão final — mapeamento Account/Contact/Opportunity/Asset é premissa herdada da conversa, a confirmar pelo tech-planner sob Princípio VI.

---

## 10. Próximos gates — 2026-09-06 (aprovado)

1. **Este `plan.md` (UX)** → gate rígido `100% customizado` cumprido (confirmado nesta revisão).
2. **`prototype/`** (`fsc-html-prototyper`, LWC real sobre SLDS2 real) → **validado e aprovado** — ver `prototype/README.md` (Princípio VIII, gate rígido cumprido 2026-09-06).
3. **`fsc-journey-tech-planner`** → complemento técnico §§11–17 + `tasks.md` + `architecture.md` (Princípios VI/VII/IX) — ver abaixo. Status: **pronto para build**.

---

*Fim de `plan.md` — `busca-cliente/001` (UX). Classificação: **100% customizado** — 9 passos ativos + 1 removido (P10) + 1 transversal, 0% padrão, 17 premissas abertas mantidas (revisão 2026-09-06 + ajustes pós-protótipo: 3 modais, gate NBO, 4 modos, sem recents).*

---

# Parte Técnica — complemento `fsc-journey-tech-planner` (2026-09-05)

> **Status do complemento (atualizado 2026-09-07):** `prototype/` em LWC real sobre SLDS2 real **validado e aprovado pelo negócio (gate VIII cumprido)** — evidência em `prototype/README.md` (`npm run build` exit 0, preview `200`). UX não re-litigada, apenas realizada tecnicamente a partir da revisão integral do `spec.md` (18 NEEDS CLARIFICATION).
> **Aviso herdado mantido:** Desenhado sem System Design ratificado (Princípio II, gate leve) — revisar tokens quando `docs/design-system/SYSTEM-DESIGN.md` for ratificado; protótipo usa hooks `--slds-g-*` verificados com fallback.
> **Aviso fundação:** `_fundacao/001` ainda não iniciado (Princípio I, gate rígido) — este complemento prossegue **exploratoriamente** por autorização do solicitante; decisões de modelo aqui são premissas técnicas sujeitas a ratificação da fundação. Ver §17 Riscos.
> **Decisões herdadas de `ConversaGoogleGemini.md` integral (1091 linhas):** backend 100% Apex desacoplado sem Integration Procedures, frontend LWC modular via `lightning/modal` + LMS interno `CustomerInteractionChannel__c` (protótipo usa `ui/cardDrawerModal` + estado local; LMS fica para build Salesforce), OmniStudio reservado para jornadas transacionais seguintes, modelo `Account+Contact` sem Person Account + `Opportunity` para NBO + `Asset` para contratos/vias, sem `FinServ__*`, mesmas APIs externas com fluxos redesenhados, TMA crítico, documento como chave idempotente.

---

## 11. Modelo de dados — origem → destino + checagem Princípio VI (padrão primeiro)

### 11.1 Princípio VI aplicado — por que nenhum objeto customizado novo

**Checagem explícita:** antes de propor objeto/campo novo, verificou-se se objetos padrão FSC cobrem.

| Objeto padrão FSC checado | Cobriria? | Por que não adotado nesta capacidade |
|---|---|---|
| `FinServ__FinancialAccount__c` / `FinServ__FinancialHolding__c` / `FinServ__Card__c` / `FinServ__FinancialAccountRole__c` | Sim, semanticamente | Exigem pacote gerenciado FSC provisionado + `Person Account` + `Household` habilitados — três itens em `constitution.md` ainda `[NEEDS CLARIFICATION]` e bloqueados por `specs/_fundacao/001` não iniciado. Adotá-los agora criaria dependência irreversível e travaria esta capacidade até a fundação decidir. |
| `FinServ__Household__c` / `Relationship Groups` | Sim para 360° futuro | Mesmo bloqueio de fundação. Nesta jornada só é preciso identificar **um titular por documento** (RN-01), não modelar household — household fica para `household-360/*` e `busca-cliente/002`. |
| `FinServ__FinancialGoal__c` | Não | Fora de escopo desta jornada. |
| **Conclusão Princípio VI** | — | **Nenhum objeto customizado novo criado.** Reusa objetos **padrão core já disponíveis em Service Cloud sem FSC** (`Account`, `Contact`, `Asset`, `Opportunity`, `Product2`, `CustomMetadata`) + campos customizados só onde o padrão não tem campo equivalente. Quando `_fundacao/001` ratificar FSC + Person Account + Household, esta decisão é reavaliada e `Asset`→`FinancialAccount` pode migrar via `data-mapping.md` sem quebrar contrato externo (DTO estável). |

**Justificativa `Asset` + `Opportunity` + `Account+Contact` (sem Person Account):**
- `Account+Contact` cobre PF/PJ unificado por documento (RN-01/RN-02) sem depender de Person Account irreversível. PF = `Account` RecordType `Pessoa_Fisica` + `Contact` titular espelhado; PJ = `Account` RecordType `Pessoa_Juridica` + `Contact`(s) opcional(is) — representante fica para 360° (EL-10). Documento normalizado é chave única.
- `Asset` cobre vínculos Porto Bank (cartão global, conta digital, cota consórcio, posição investimento) e, por hierarquia `Asset.ParentId`, cobre vias/plásticos de cartão — é padrão core, já tem `AccountId`/`ContactId`/`Product2Id`/`Status`/`SerialNumber`, e aceita campos customizados para `Last4`/`Brand`/`IsTitular` sem novo objeto.
- `Opportunity` cobre NBO como "oportunidade de venda" (Stage `Elegível`→`Abordada`→`Dispensada`→`Expirada`) — nativa para pipeline comercial, sem criar objeto `Oferta__c` customizado. Cada oferta elegível = 1 `Opportunity` ligada a `Account` + `Product2`.
- `Product2` + `ProductCatalog__mdt` cobre catálogo extensível PT/RN-12 sem novo objeto de domínio.
- Sem `Financ__*` / `FinServ__*`: evita acoplar esta capacidade ao licenciamento FSC ainda não confirmado (mesma razão de P1–P10 forçarem LWC por Q1).

### 11.2 Tabela origem → destino (dado de negócio → campo Salesforce)

| # | Dado de negócio (spec §7) | Origem externa/legada | Destino Salesforce (objeto.campo) | Tipo | Padrão vs. novo | Notas de transformação / Princípio VI |
|---|---|---|---|---|---|---|
| D01 | Documento (CPF/CNPJ/BACEN) chave única | Input operador; API cadastral `GET /clientes/{doc}` | `Account.Document__c` (Text 18, External ID, Unique, Indexed) + `Account.DocumentType__c` (Picklist: `CPF`/`CNPJ`/`CNPJ_ALFANUM`) + `Contact.Document__c` (mirror, não unique) | Campo custom em obj padrão | **Novo campo em obj padrão** — padrão não tem campo documento único indexado | Normalização: `normalizeDoc()` remove máscara, `UPPER`, sem pontuação; validação DV local (PF/CNPJ numérico) antes de callout (Cen 4/EL-01/02). `Document__c` é chave de `upsert` idempotente. |
| D02 | Dados demográficos (nome/razão, tipo PF/PJ, endereço, nasc/fundação, segmento) | API cadastral corporativa | `Account.Name` (PF nome / PJ razão), `Account.RecordType` (PF vs PJ), `Account.CustomerSegment__c` (Text/Picklist), `Account.BillingAddress` (composto), `Account.PersonBirthdate__c` (Date custom em Account PJ/PF), `Contact` espelho (PF titular) | Campos padrão + 2 customs | Novo campo só onde padrão não tem | `Account.BillingAddress` reusado; `CustomerSegment__c` custom porque padrão não tem segmento Porto Bank. Sem sobrescrita silenciosa — ver RN-10/premissa 06 (prevalência pendente, Queueable só upsert se mais recente). |
| D03 | Carteira Porto Bank por tipo (cartão, conta, consórcio, investimentos) — resumo quantitativo | API carteira `GET /clientes/{doc}/carteira` (Holding+Bank) filtrada `origem=PORTO_BANK` | `Asset` (1 por contrato/vínculo): `Asset.AccountId`, `Asset.ContactId`, `Asset.Product2Id`, `Asset.Name`, `Asset.Status` (Ativo/Cancelado/Bloqueado), `Asset.ExternalContractId__c` (External ID), `Asset.ProductType__c` (Picklist), `Asset.Quantity__c` (Number) | Obj padrão + campos custom | **Novo campo em obj padrão** | `ProductType__c` lista extensível via `ProductCatalog__mdt` (PT). `ExternalContractId__c` garante idempotência. `Asset` sem `FinancialAccount`. Quantidade agregada no hub é `COUNT(Asset WHERE ProductType)`. |
| D04 | Carteira Holding informativa (auto, residencial, saúde) | Mesma API carteira filtrada `origem=HOLDING` | `Asset` com `Asset.ProductType__c` = `HOLDING_*` + `Asset.IsHoldingInformative__c` (Checkbox true) — **sem** `Opportunity`, sem seleção transacional (RN-06) | Mesmo `Asset` | Novo checkbox | Somente leitura; LWC `c-holding-strip` filtra `IsHoldingInformative__c=true`; sem DML holding separado — mesmo upsert Queueable, apenas flag. Alternativa descartada: External Object — exigiria OData e não alimenta visão 360° futura. |
| D05 | Detalhe vias/plásticos do cartão (bandeira, categoria, last4, titular/adicional, limite, anuidade, situação) | API processadora `GET /cartoes/{doc}` ou `/clientes/{doc}/cartoes` (lazy só se P7=Cartão) | `Asset` hierárquico: Pai = contrato cartão global; Filhos = vias: `Asset.ParentId` (standard), `Asset.CardBrand__c`, `Asset.CardCategory__c`, `Asset.Last4__c` (Text 4), `Asset.HolderName__c`, `Asset.IsTitular__c` (Checkbox), `Asset.ViaStatus__c` (Ativo/Cancelado/Bloqueado), `Asset.SerialNumber` mirror last4 | Obj padrão + customs | **Novos campos em obj padrão** | `Asset.SerialNumber` padrão só guarda last4 simples; customs dão bandeira/categoria/portador. Histórico completo (EL-04/05): vias canceladas/bloqueadas **persistem** como `Asset` com status correspondente, selecionáveis. |
| D05b | Detalhe cotas de consórcio (tipo Imóvel/Veículo/Rural, grupo/cota, valor, contemplação, parcela, situação) | API consórcio `GET /consorcios/{doc}` (lazy só se P7=Consórcio) | `Asset` hierárquico: Pai = contrato consórcio global; Filhos = cotas: `Asset.ParentId`, `Asset.ConsorcioTipo__c`, `Asset.ConsorcioGrupo__c`, `Asset.ConsorcioCota__c`, `Asset.ValorContrato__c`, `Asset.Contemplacao__c`, `Asset.ViaStatus__c` | Obj padrão + customs | **Novos campos em obj padrão** | Várias cotas no mesmo grupo = vários filhos do mesmo pai. Canceladas persistem selecionáveis. |
| D05c | Detalhe posições de investimento (classe, produto, valor, rentabilidade, vencimento/liquidez, risco) | API investimentos `GET /investimentos/{doc}` (lazy só se P7=Investimentos) | `Asset` hierárquico: Pai = conta investimento global; Filhos = posições: `Asset.ParentId`, `Asset.InvestClasse__c`, `Asset.InvestProduto__c`, `Asset.ValorContrato__c` (reuso), `Asset.Rentabilidade__c`, `Asset.Vencimento__c`, `Asset.Risco__c` | Obj padrão + customs | **Novos campos em obj padrão** | Classes: renda fixa, renda variável, CDB, fundos. |
| D06 | Oferta elegível NBO (produto, benefício, elegibilidade) | Motor NBO `GET /nbo/elegibilidade/{doc}` | `Opportunity` (1 por oferta elegível): `Opportunity.AccountId`, `Opportunity.ContactId`, `Opportunity.Product2Id` (ou `Opportunity.NboProductType__c`), `Opportunity.Name`, `Opportunity.StageName` (`Elegível`), `Opportunity.Amount` (benefício quantificado se houver), `Opportunity.ExternalOfferId__c` (External ID), `Opportunity.NboBenefit__c` (Long Text), `Opportunity.NboStatus__c` | Obj padrão + customs | **Novos campos em obj padrão** | Nenhum `NBO__c` customizado. `ExternalOfferId__c` dedup. Múltiplas ofertas = múltiplas `Opportunity` com `IsPrimaryNbo__c` para ordenação (premissa 04 placeholder = ordem do motor). `Opportunity` já integra com pipeline `nbo/*` futuro. |
| D07 | Registro abordagem/dispensa da oferta | Ação operador em `c-nbo-banner` | `Opportunity.StageName` → `Abordada`/`Dispensada` + `Opportunity.ApproachTimestamp__c` (DateTime), `Opportunity.DismissalReason__c` (placeholder, premissa 05 sem motivo obrigatório), `Opportunity.LastNboInteractionBy__c` (Lookup User) | Campos custom em obj padrão | Novos campos | Update síncrono leve (sem callout) + `NboInteraction__c` opcional via `Task` (`Task.WhatId=OpportunityId`, `Subject=NBO Abordada/Dispensada`) para auditoria. Supressão sessão = `sessionStorage` (P10) + server flag `NboSuppressedUntil__c` se premissa 05 virar dias. |
| D08 | Contexto de interação (saída RN-09) | Construído no front após P7/P8 | Publicado via `CustomerInteractionChannel__c` (LMS) + persistido como `InteractionContext__c` **não é objeto novo** — é `Opportunity`/`Asset`/`Account` já gravados; contexto transitório em `SessionCache` Apex (`Cache.Session`) + `Platform Cache` se necessário | Canal + cache | **Sem objeto novo** | Dados gravados já existem (Account/Asset/Opportunity). Domínios consumidores (`atendimento/*`, `household-360/*`) leem por SOQL/API (`SELECT ... FROM Asset WHERE Account.Document__c=:doc`), não assinam LMS cross-domain. |
| D09 | Catálogo extensível PT/RN-12 | Config negócio | `ProductCatalog__mdt` (Custom Metadata Type): `ProductType__c` (unique), `Label__c`, `IconName__c`, `RequiresViaSelection__c` (Checkbox), `DisplayOrder__c`, `IsActive__c`, `HoldingInformative__c` | **Novo CMDT** (única metadata nova) | **Novo CMDT** — único artefacto novo não-campo, justificado por PT | Hub `c-product-hub` consome `ProductCatalog__mdt` via `getAll()` cacheable; adicionar `FINANCIAMENTO_VEICULOS` = 1 registro CMDT, sem deploy LWC. |
| D10 | Histórico sessão P10 | Sessão operador | `sessionStorage`/`Cache.Session` apenas — **sem objeto**, sem `RecentSearch__c` | Browser/cache | Sem persistência SF | Premissa 11 (LGPD): documento mascarado `***.***.***-**`, sem vazar entre operadores. |

### 11.3 Campos novos — inventário fechado (Princípio VI: só campo, sem objeto de domínio)

**`Account` (3 customs):** `Document__c` (Text 18, External ID, Unique, Required via Validation Rule), `DocumentType__c` (Picklist), `CustomerSegment__c` (Picklist/Text) — `PersonBirthdate__c` se RecordType PF exigir data (ou reusa `Contact.Birthdate`).

**`Contact` (1 custom mirror):** `Document__c` (Text 18, não unique, para `Contact` titular PF espelhar Account; PJ não exige).

**`Asset` (19 customs):** `ExternalContractId__c` (Text, External ID, Unique), `ProductType__c` (Picklist global a partir de `ProductCatalog__mdt` valores), `ViaStatus__c` / reutiliza `Status`, `CardBrand__c`, `CardCategory__c`, `Last4__c`, `HolderName__c`, `IsTitular__c`, `IsHoldingInformative__c`, `ConsorcioTipo__c`, `ConsorcioGrupo__c`, `ConsorcioCota__c`, `ValorContrato__c` (Currency), `Contemplacao__c`, `InvestClasse__c`, `InvestProduto__c`, `Rentabilidade__c`, `Vencimento__c`, `Risco__c` (Picklist Baixo/Moderado/Alto) — `ParentId` é padrão para hierarquia via/cota/posição.

**`Opportunity` (6 customs):** `ExternalOfferId__c` (Text, External ID, Unique), `NboProductType__c`, `NboBenefit__c` (Long Text), `NboStatus__c` (ou Stage), `ApproachTimestamp__c`, `DismissalReason__c` (Text 255), `LastNboInteractionBy__c` (Lookup User), `IsPrimaryNbo__c` (Checkbox), `NboSuppressedUntil__c` (DateTime).

**`Product2` (reuso):** 1 `Product2` por `ProductType` (CARTAO, CONTA_DIGITAL, CONSORCIO, INVESTIMENTOS, HOLDING_*) — `ProductCode` = `ProductType__c`, `IsActive` true.

**`ProductCatalog__mdt` (1 CMDT novo, 8 campos):** ver D09.

**Validation Rules (não são objetos):** `Account_Document_Required` (Document__c não nulo se RecordType PF/PJ), `Account_Document_Unique` (via External ID), `Asset_Last4_Format` (4 dígitos).

**Nenhum `FinServ__*` e nenhum `*__c` de domínio criado.**

### 11.4 External IDs e idempotência (EL-11, RN-10)

- `Account.Document__c` External ID garante `Database.upsert(..., Account.Document__c, false)` idempotente — dois operadores buscando mesmo CPF concorrentemente (premissa 08) não duplicam `Account`; segundo upsert apenas atualiza se payload mais recente (comparado por `LastModifiedDate` externo ou hash). `Asset.ExternalContractId__c` e `Opportunity.ExternalOfferId__c` idem.
- Queueable de upsert usa `allOrNone=false` + `Database.SaveResult` logado; retry só em `UNABLE_TO_LOCK_ROW` com backoff de 1s (1 retry).
- Sem lock de UI — concorrência é resolvida no servidor por chave natural, não por semáforo no LWC (placeholder premissa 08).

### 11.5 Dependência de `_fundacao/001`

Esta seção assume decisão de negócio "cadastro único por documento cobrindo PF/PJ" (spec caveat) e a traduz para `Account+Contact` sem Person Account. Se `_fundacao/001` ratificar **Person Accounts + Household**, o `data-mapping.md` futuro mapeia `Account.Document__c` → `Account.Person...` + `Household__c`, e `Asset` → `FinServ__FinancialAccount__c` sem mudar DTO/LMS — contrato estável. Registrar como tech debt aceita.

---

## 12. Automação — Flow primeiro, Apex justificado (Princípio IV/V)

### 12.1 Gate Flow primeiro — veredito Apex

| Candidato declarativo checado | Por que não cobre |
|---|---|
| **Flow `Autolaunched` / `Record-Triggered` + `HTTP Callout` (Spring '23+)** | Flow não faz `Promise.allSettled` paralelas não-bloqueantes com timeout diferenciado por fonte (NBO 3s vs carteira 2.5s) nem skeletons por área; Flow HTTP Callout é síncrono e sem controle fino de `Continuation` / `Queueable` chaining; DTO tipado com `Last4` mascarado e `IsTitular` exigiria `Apex-Defined` anyway. |
| **Flow + Platform Event p/ upsert assíncrono** | Até poderia desacoplar gravação, mas ainda exigiria Apex para callouts externos + `External ID` upsert + retry idempotente — Flow passaria a ser orquestrador vazio em cima de Apex. |
| **Integration Procedure (OmniStudio)** | Arquiteturalmente vetado pela conversa (backend 100% Apex, sem IP). Q1 licenciamento não confirmado reforça. |

**Veredito:** **Apex puro** — Service Layer desacoplada + `Queueable` + `Continuation` (se LWC usar `Continuation` para callout longo) + `Trigger Handler` **preparado mas inativo nesta capacidade** (handler existe na fundação, não dispara lógica para `Asset`/`Opportunity` desta jornada além de validações).

### 12.2 Arquitetura Apex desacoplada (microsserviços)

```
c-customer-search-shell (LWC)
  │  @wire / imperative Apex (cacheable=false para busca, cacheable=true para catálogo)
  ├─► CustomerSearchController (AuraEnabled façade, sem lógica)
  │     ├─► CustomerSearchService.identify(String normalizedDoc)  // orquestra
  │     │     ├─► DocumentValidator.validate(normalizedDoc, modo) // CPF DV + CNPJ DV + BACEN 12alfa+2dig + Protocolo 5+ + Não-cliente pass-through
  │     │     ├─► CadastroService.fetch(normalizedDoc) ─┐
  │     │     ├─► NboService.fetch(normalizedDoc)       ─┤─► HttpCalloutService (Named Credential, timeout por serviço)
  │     │     └─► HoldingService.fetch(normalizedDoc)   ─┘   Promise.allSettled no LWC; cada service retorna DTO ou ApiFault
  │     │     └─► InteractionContextService.build(...) // monta DTO de saída RN-09
  │     └─► CustomerUpsertQueueable.enqueue(CadastroDTO, WalletDTOs) // fire-and-forget, não retém navegação
  ├─► CardService.fetchVias(doc) // lazy, só se PRODUCT_SELECTED=CARTAO
  ├─► ConsorcioService.fetchCotas(doc) // lazy, só se PRODUCT_SELECTED=CONSORCIO
  ├─► InvestimentoService.fetchPosicoes(doc) // lazy, só se PRODUCT_SELECTED=INVESTIMENTOS
  └─► NboInteractionService.approach/dismiss(ExternalOfferId)
```

**Princípios:**
- Service Layer sem estado, 1 classe por domínio externo (SRP). Nenhum monolito.
- Nenhum trigger com lógica — `AssetTriggerHandler` / `OpportunityTriggerHandler` existem como **classe vazia com `Bypass__c` (Hierarchy Custom Setting)** preparada para `_fundacao`, mas não executam regra nesta capacidade além de validações de formato `Last4`.
- Upsert progressivo em `Queueable` (não `Future` — precisa encadear retry) com `Database.upsert(list, ExternalIdField, false)`.
- `Queueable` publica `PlatformEvent Customer360Upserted__e` opcional para `household-360/*` reagir sem polling (contrato async).

### 12.3 DTOs limpos (sem IP/DataRaptor)

Apex `public class` DTOs com `@AuraEnabled`:

- `CustomerSearchResultDTO { String documentNormalized, String documentMasked, String docType, DemographicDTO demographic, List<ProductSummaryDTO> portoBankWallet, List<HoldingDTO> holdingWallet, List<NboOfferDTO> nboOffers, List<ApiFaultDTO> partialFaults }`
- `NboOfferDTO { String externalOfferId, String productType, String titulo, String narrativa, String benefit, List<String> beneficios, List<String> bandeiras, String limites, String anuidade, String eligibilityReason, Boolean isPrimary, String stage }`
- `ProductSummaryDTO { String productType, String label, Integer quantity, String status, String iconName }`
- `CardViaDTO { String externalContractId, String brand, String category, String last4Masked, String holderName, Boolean isTitular, String limite, String anuidade, String status, String badgeVariant }`
- `ConsorcioCotaDTO { String externalContractId, String tipo, String grupo, String cota, String valor, String contemplacao, String parcela, String status }`
- `InvestimentoPosicaoDTO { String externalContractId, String classe, String produto, String valor, String rentabilidade, String vencimento, String risco }`
- `InteractionContextDTO { String accountId, String contactId, String productType, String assetId, String viaAssetId, String cotaAssetId, String investimentoAssetId, String opportunityId }`

Sem `FinServ__*` no DTO.

### 12.4 Trigger Handler — só esqueleto

`AssetTriggerHandler extends TriggerHandler` (framework `fflib` ou similar leve) com `beforeInsert/beforeUpdate` apenas para `Last4__c` regex e `ExternalContractId` required — desabilitado por `CustomSetting TriggerBypass__c.Asset__c = true` até `_fundacao` ratificar regras. Não deve conter callout nem DML em cadeia.

---

## 13. Segurança — OWD/sharing/permission sets re-derivados (Princípio VII)

> **Premissa aberta 01/02 LGPD:** perfis que veem Holding completo vs. resumo, e base legal/sigilo bancário, são decisões de compliance pendentes. Esta seção propõe mínimo viável re-derivado, sinalizado como premissa aberta, não copiado do legado Service Cloud.

### 13.1 OWD proposto (a ratificar com `_fundacao/001`)

| Objeto | OWD interno proposto | Justificativa | Herança Service Cloud copiada? |
|---|---|---|---|
| `Account` | **Private** | Dado financeiro: operador só vê `Account` que atendeu ou que seu papel permite (fila). `Private` + sharing criteria por fila é baseline LGPD. Legado era `Public Read Only` — não copiado. | Não — re-derivado |
| `Contact` | **Controlled by Parent** | Segue `Account`. | Não |
| `Asset` | **Private** (ou `Controlled by Parent` se `Asset` for `Controlled by Account`) | Vínculo financeiro sensível; holding informativo ainda sensível. | Não |
| `Opportunity` (NBO) | **Private** | Oferta comercial com dado de propensão. | Não |
| `Product2` / `ProductCatalog__mdt` | **Public Read Only** | Catálogo não sensível. | — |
| `CustomerInteractionChannel__c` | — (LMS é browser, não objeto) | Sem OWD. | — |

**Sharing futuro (não nesta capacidade):** `SharingRule` por fila/role (`Role: PortoBank_Agente` vê `Account` com `CustomerSegment__c in (...)`) — a criar em `_fundacao/001`, não aqui. Nesta capacidade apenas OWD + Permission Sets; sem `SharingRule` concreta para não antecipar modelo de fila.

### 13.2 Permission Sets (concretos, sem Profile clonado)

| Permission Set | Quem recebe | Objetos/campos | Apex/LWC |
|---|---|---|---|
| `PS_BuscaCliente_Agente` | Operador Porto Bank (padrão) | `Account` Read (todos campos exceto `BillingAddress` completo se premissa 02 restringir), `Contact` Read, `Asset` Read (todos `ProductType`), `Opportunity` Read (NBO), `ProductCatalog__mdt` Read, `CustomerInteractionChannel__c` — | `CustomerSearchController` `executable`, LWCs `c-customer-search-*` visíveis |
| `PS_BuscaCliente_HoldingRestrito` (opcional, conforme premissa 02) | Subconjunto que vê apenas resumo Holding | `Asset` Read onde `IsHoldingInformative__c=true` só campos `ProductType__c`/`Status` (via FLS), sem `SerialNumber`/`HolderName` | — |
| `PS_BuscaCliente_Admin` | Admin/Tech | `Account/Asset/Opportunity` Create/Edit/Delete + `ProductCatalog__mdt` Customize Application + Bypass `TriggerBypass__c` | `CustomerUpsertQueueable` debug |

FLS: `Account.Document__c` **sem** acesso a `PS_BuscaCliente_Agente`? Ao contrário — precisa ler para busca, mas `BillingAddress` detalhado pode ser restrito conforme premissa 02. Registrar como decisão aberta.

### 13.3 Perfis LGPD como premissa aberta

- Sem `Profile` novo clonado — permission sets cumulativos.
- Auditoria de acesso (premissa 13) via `Event Monitoring`/`Transaction Security` + `Task` de NBO — não via `Field History` nesta capacidade (volume).
- Mascaramento: `Last4__c` só exibe `**** **** **** 1234` no LWC; campo armazena `1234` em texto, não PAN completo — sem `Shield Platform Encryption` nesta fase (a avaliar em `_fundacao`).

---

## 14. Integração — contratos com sistemas externos (sem IP)

> Mesmas APIs externas do legado, fluxos redesenhados para paralelas não-bloqueantes, timeouts finos, DTOs limpos, sem `Integration Procedure`.

### 14.1 Inventário de integrações

| # | Sistema externo | Direção | Operação nesta capacidade | Tecnologia Salesforce | Sync/Async | Timeout | DTO | Chamada por |
|---|---|---|---|---|---|---|---:|---|
| I01 | **Cadastro Corporativo** (demografia + carteira agregada Porto Bank + Holding) | Outbound | `GET /api/v2/clientes/{documentNormalized}` | `CadastroService` → `HttpCalloutService` via `NamedCredential NC_CadastroCorporativo` | Sync (LWC aguarda com skeleton) | **2.5s** (TMA crítico) | `CustomerSearchResultDTO` parcial | `CustomerSearchController.identify()` |
| I02 | **Motor NBO** | Outbound | `GET /api/v1/nbo/elegibilidade/{document}` | `NboService` → `NC_NboMotor` | Sync paralela a I01 (não bloqueia I01) | **3.0s** | `List<NboOfferDTO>` | Mesma `identify()`, `Promise.allSettled` |
| I03 | **Processadora Cartões** (vias/plásticos) | Outbound | `GET /api/v1/cartoes/{document}` ou `GET /cartoes?clienteId={externalId}` | `CardService` → `NC_CartoesProcessadora` | **Lazy** — só se `PRODUCT_SELECTED=CARTAO` | **3.0s** | `List<CardViaDTO>` | `CustomerSearchController.fetchVias()` |
| I03b | **Consórcio** (cotas: tipo, grupo/cota, valor, contemplação) | Outbound | `GET /api/v1/consorcios/{document}` | `ConsorcioService` → `NC_Consorcio` | **Lazy** — só se `PRODUCT_SELECTED=CONSORCIO` | **3.0s** | `List<ConsorcioCotaDTO>` | `CustomerSearchController.fetchCotas()` |
| I03c | **Investimentos** (posições: classe, valor, rentabilidade, risco) | Outbound | `GET /api/v1/investimentos/{document}` | `InvestimentoService` → `NC_Investimentos` | **Lazy** — só se `PRODUCT_SELECTED=INVESTIMENTOS` | **3.0s** | `List<InvestimentoPosicaoDTO>` | `CustomerSearchController.fetchPosicoes()` |
| I04 | **Carteira Holding/Bank detalhada** (se separada de I01) | Outbound | Se I01 já retorna Holding, I04 é campo do mesmo payload — sem callout extra. Se separada: `GET /api/v2/carteira/{doc}` | `HoldingService` (ou branch em `CadastroService`) | Sync paralela | **2.5s** | `List<HoldingDTO>` | `identify()` |
| I05 | **Upsert progressivo visão 360°** (interno, não externo) | Inbound (SF) | `Queueable` upsert `Account/Contact/Asset/Opportunity` + publish `Customer360Upserted__e` | `CustomerUpsertQueueable` | **Async** (fire-and-forget, não retém navegação) | N/A (governor 60s) | SF sObjects | Enfileirado por `identify()` após DTO recebido |

**Sem `Integration Procedure` / `DataRaptor` / `Callable`.** Cada serviço tem interface própria (`ICadastroService`) para mock.

### 14.2 Padrões transversais de integração

- **Paralelas não-bloqueantes:** LWC `c-customer-search-shell` dispara `Promise.allSettled([fetchCadastro(), fetchNbo()])`; cada área renderiza quando sua Promise resolve (Cen 21). `fetchVias()` é lazy separado (Cen 17).
- **Timeouts finos + fallback:** `HttpCalloutService` encapsula `HttpRequest.setTimeout(ms)` por serviço (2.5s/3s). `TimeoutException` → `ApiFaultDTO { source, code='TIMEOUT', message }` → LWC exibe `c-inline-error` discreta por área (Cen 22), não bloqueia outras áreas.
- **DTOs limpos:** Apex define DTOs tipados (ver §12.3); JS consome `CustomerSearchResultDTO` sem `FinServ__*`. Conversão `External JSON → DTO` em `*Service.parse(json)`.
- **Named Credentials com `External Credential` (OAuth2/JWT conforme barramento)** — sem hardcode de endpoint/token no Apex. `NC_*` com `Generate Authorization Header` + `Principal Type: Named Principal`.
- **Retry:** apenas Queueable tem retry (1× `UNABLE_TO_LOCK_ROW`); callouts externos **não** fazem retry automático para não estourar TMA — falha parcial é exibida (Cen 22).
- **Cache:** `ProductCatalog__mdt` via `Cacheable=true`; `CustomerSearchResultDTO` **não** é `cacheable=true` (dado volátil por documento).
- **Idempotência:** ver §11.4.

### 14.3 Contratos cross-domain como data/API (fronteira)

| Consumidor futuro | Lê de | Como | Artefacto desta capacidade que expõe |
|---|---|---|---|
| `atendimento/001` (intake) | `Account.Document__c`, `Asset(ExternalContractId__c)`, `Opportunity(ExternalOfferId__c)` | SOQL `SELECT Id FROM Asset WHERE Account.Document__c=:doc AND ProductType__c=:type` ou Apex `InteractionContextService.getContext(doc)` | `InteractionContextDTO` + `Account/Asset/Opportunity` gravados |
| `household-360/001` | `Account/Contact/Asset` + `Customer360Upserted__e` | Subscribe `Customer360Upserted__e` (CDC/Platform Event) + SOQL | `CustomerUpsertQueueable` publica `Customer360Upserted__e { documentNormalized, accountId }` |
| `nbo/001` | `Opportunity` NBO | SOQL `Opportunity WHERE Account.Document__c=:doc AND Stage='Elegível'` | `Opportunity` + `NboService` |

Nenhum LWC desta capacidade é importado por outro domínio.

---

## 15. Migração — upsert progressivo (não é migração bulk)

Esta capacidade **não** é migração bulk de base legada — isso é `specs/_fundacao/002`. Aqui a "migração" é **upsert progressivo e idempotente** para alimentar visão 360° futura sem travar a busca (RN-10).

- **Fluxo:** `CustomerSearchController.identify()` recebe DTOs externos → enfileira `System.enqueueJob(new CustomerUpsertQueueable(dtos))` → Queueable faz `Database.upsert(accounts, Account.Document__c, false)` → `upsert(assets, Asset.ExternalContractId__c, false)` → `upsert(opportunities, Opportunity.ExternalOfferId__c, false)` → publish `Customer360Upserted__e`.
- **Sem bulk load nesta capacidade:** não há `data-mapping.md` de migração histórica aqui; se `_fundacao/002` precisar mapear `Financ__*` legado → `Asset`, isso é artefacto da fundação, não desta capacidade.
- **Prevalência (premissa 06 aberta):** placeholder = payload externo mais recente vence se `externalLastModified > storedLastModified`; sem trilha de auditoria de divergência nesta fase (a decidir em `_fundacao`).
- **Governor:** Queueable único por busca; `Limits.getQueueableJobs()` guard.

---

## 16. Estratégia de teste — Apex + Jest + validação funcional (rastreada a `spec.md`)

### 16.1 Matriz Cenário → teste (Princípio IX)

| Cenário(s) `spec.md` | Apex test | Jest (LWC) | Validação funcional (prototype/manual) |
|---|---|---|---|
| 1,2,3,4,5 + EL-01/02 (entrada/validação) | `DocumentValidatorTest` (CPF DV, CNPJ DV, BACEN formato 12alfa+2dig, máscara) | `c-customer-search-bar.test.js` (input mask, botão disabled, Enter/F2, foco) | Tela1 protótipo: chips CPF/CNPJ/alfa/inválido/incompleto |
| 6,7,8,9 + EL-12 (faixa/hub/holding) | `CustomerSearchServiceTest` (mock I01 carteira Porto Bank + Holding) | `c-customer-header-summary.test.js`, `c-product-hub.test.js` (grade, contagem, hub vazio), `c-holding-strip.test.js` (informativo sem seleção) | Tela2: `setHubState('empty')` / `setHoldingState` |
| 10 (não encontrado) | `CustomerSearchServiceTest.notFound` | `c-customer-search-shell` empty state | Tela Estados P9: `st-notfound` |
| 11,12,13,14,15 (NBO) | `NboServiceTest` (1 oferta, 0 ofertas, múltiplas, `approach`/`dismiss` update Opportunity) | `c-nbo-banner.test.js` (skeleton, colapso quando vazio, Abordar/Dispensar publica LMS) | Tela2: `setNboState('with'/'empty'/'multiple'/'partial')` |
| 16 (seleção direta) | `InteractionContextServiceTest` (P7 fixa `InteractionContextDTO` sem via) | `c-product-hub` seleção `PRODUCT_SELECTED` → `INTERACTION_CONTEXT_FIXED` | Tela3a |
| 17–20 + EL-03/04/05 (drawer vias) | `CardServiceTest` (5 vias, 12 vias, todas canceladas, titular/adicional) | `c-card-drawer.test.js` (lazy fetch, badge verde/cinza/âmbar, select via → `CARD_SELECTED`) | Tela3b: `setViaFilter('many'/'canceladas')` |
| 21 (progressivo) | `CustomerSearchControllerTest.allSettled` (I01 rápido + I02 lento + vice-versa) | `c-customer-search-shell` skeletons independentes (`Promise.allSettled`) | Tela2 `toggleSkeletons` / Tela Estados `st-skeletons` |
| 22 + EL-08/09 (falha parcial/total) | `*ServiceTest.timeout` (HttpCalloutMock timeout 2.5s/3s → `ApiFaultDTO`) | `c-inline-error.test.js` (mensagem discreta por área, não bloqueia) | Tela Estados `st-partial-nbo` / `st-partial-carteira` / `st-total` |
| 23 PT extensibilidade | `ProductCatalogServiceTest` (add `FINANCIAMENTO_VEICULOS` CMDT → hub sem refatorar) | `c-product-hub` render dinâmico por `ProductCatalog__mdt` | Tela2 `toggleExtraProduct()` |
| 24 P10 histórico | `RecentSearchServiceTest` (sessionStorage mock) | `c-recent-searches.test.js` (mascaramento, reabrir 1-clique, isolamento sessão) | Tela1 histórico |

### 16.2 Detalhe por tipo

**Apex tests (mínimo 75% coverage, `HttpCalloutMock` por serviço):**
- `DocumentValidatorTest`, `CustomerSearchServiceTest`, `CadastroServiceTest`, `NboServiceTest`, `CardServiceTest`, `HoldingServiceTest`, `CustomerUpsertQueueableTest` (idempotência + `UNABLE_TO_LOCK_ROW` retry), `InteractionContextServiceTest`, `NboInteractionServiceTest`.
- Cada teste de serviço usa `Test.setMock(HttpCalloutMock, new MockForI01())` com JSON fixture em `staticresources` mock (sem dado real). Asserts em DTO + `upsert` result + `ApiFaultDTO`.

**Jest para LWC (88%+ branch):**
- `__tests__/` por componente: `c-customer-search-bar`, `c-customer-search-shell`, `c-customer-header-summary`, `c-product-hub`, `c-card-drawer`, `c-nbo-banner`, `c-holding-strip`, `c-recent-searches`.
- Padrão `sfdx-lwc-jest` com `lightning/messageService` mock (`wire` LMS). Seeds do protótipo reusados como fixture.

**Validação funcional:**
- Executar `prototype/index.html` via `file://` cobrindo 24 cenários + ELs usando controles de demonstração (sem `sf` org). Checklist em `tasks.md` T‑F01.

**Sem `data-mapping.md` nesta capacidade.**

---

## 17. Riscos e decisões em aberto

### 17.1 17 premissas abertas herdadas de `spec.md` §9 (placeholder neutro, sem regra inventada; item 11 removido com o histórico)

| # | Premissa (spec §9) | Impacto técnico | Placeholder adotado | Resolve em |
|---|---|---|---|---|
| 01 | LGPD/sigilo — base legal p/ exibir cadastro/Holding/NBO a qualquer operador com CPF | FLS/OWD/Sharing | `PS_BuscaCliente_Agente` vê tudo ilustrativamente; sem badge restrição | `_fundacao/001` + compliance |
| 02 | Quem vê Holding completo vs. resumo | FLS `Asset.IsHoldingInformative__c` + `PS_BuscaCliente_HoldingRestrito` opcional | Holding exibido como 3 cards fictícios, rótulo "informativo" | Compliance |
| 03 | Ciclo vida oferta (validade/expiração/re-oferta) | `Opportunity.NboSuppressedUntil__c` + Stage `Expirada` | Sem contador/expiração no LWC | `nbo/*` + negócio |
| 04 | Priorização múltiplas ofertas | `Opportunity.IsPrimaryNbo__c` + ordem motor | Proto mostra 1 destaque + "Ver 2 ofertas" desabilitado | Negócio NBO |
| 05 | Dispensa: motivo e janela supressão | `DismissalReason__c` + `NboSuppressedUntil__c` | Dispensa some na sessão (`sessionStorage` + `nboDismissed` flag), sem campo motivo obrigatório | Negócio |
| 06 | Prevalência dado divergente (externo vs. 360° consolidado) | Queueable `externalLastModified` vs `storedLastModified` | Externo mais recente vence; sem badge "divergente" nem trilha | `_fundacao/002` |
| 07 | Validação BACEN além de formato (algoritmo DV alfanumérico) | `DocumentValidator.validateCNPJAlfa()` | Valida formato `12alfa+2dig` apenas; DV alfanumérico não validado; msg genérica | BACEN spec |
| 08 | Concorrência 2 operadores mesmo documento | External ID upsert idempotente | Sem lock; segundo upsert atualiza; 1 retry `UNABLE_TO_LOCK_ROW` | `_fundacao/001` |
| 09 | PJ: escolher sócio/representante ao telefone | `Contact` PJ opcional | Só empresa fixa contexto; sem seletor representante | Negócio |
| 10 | Texto exato falha parcial | `ApiFaultDTO.message` | "Ofertas indisponíveis no momento" / "Carteira indisponível" sem código | Negócio/UX writing |
| 11 | [REMOVIDO com o Cenário 24 — sem histórico de sessão] | — | — | — |
| 12 | Elegibilidade fina ("não possui" inclui cancelado? upgrade Gold→Black é NBO?) | `NboService` filtro motor | Sem filtro fino; oferta conforme motor; sem badge "upgrade" | Negócio NBO |
| 13 | Auditoria (quais eventos, retenção logs) | `Task` NBO + `Event Monitoring` | Sem ícone auditoria; eventos no LMS para tech-planner; `Task` para NBO | Compliance |
| 14 | Acessibilidade/responsividade WCAG/mobile | `aria-live`, foco shell | Desktop console, WCAG AA baseline implícito, sem breakpoint mobile | `SYSTEM-DESIGN.md` |
| 15 | Limite/paginação/ordenação hub/vias | `c-card-drawer` scroll | Grade sem paginação; drawer scroll; "ativos primeiro" placeholder | Negócio |
| 16 | Busca estrangeiro/passaporte/ID sem CPF/CNPJ | `DocumentValidator` | Fora escopo RN-01; campo rejeita; sem opção passaporte | Negócio |
| 17 | Validação de identidade (gate antes/depois) | Gate MFA/validação positiva | Sem gate nesta jornada; dados exibidos após documento | Negócio/Compliance |
| 18 | Pós-seleção imediata (protocolo auto vs. contexto) | Criação de protocolo | Sem criação automática; protótipo encerra em "Contexto fixado" | Negócio (`atendimento/001`) |

### 17.2 Riscos estruturais adicionais

| Risco | Descrição | Probabilidade | Impacto | Mitigação |
|---|---|---|---|---|
| R17 | **System Design não ratificado** (Princípio II, gate leve) | Alta (já ocorre) | Médio — retrabalho de tokens/skeletons/badges/drawer | Protótipo usa `SLDS` defaults mínimos; listar gaps em `plan.md` §7; revisar quando `SYSTEM-DESIGN.md` ratificar |
| R18 | **`_fundacao/001` não iniciado** (Princípio I, gate rígido) | Alta | Alto — modelo `Account+Contact`/`Asset`/`Opportunity` pode migrar para `Person Account/Household/FinancialAccount` | Escolha reversível: External IDs + DTO estável + `Asset` já mapeável para `FinancialAccount`; sem objeto customizado de domínio; registrar tech debt em §11.5 |
| R19 | **Licenciamento OmniStudio não confirmado** (constitution `[NEEDS CLARIFICATION]`) | Média | Médio — se licenciado, P3/P5/P6 poderiam ser FlexCard/OmniScript | Decisão LWC mantida por Q1+Q4; se licenciar, reavaliar só `holding-strip`/`nbo-banner` sem refatorar shell; sem IP de qualquer forma |
| R20 | **APIs externas mantidas mas SLA real desconhecido** | Média | Alto TMA — timeouts 2.5s/3s podem estourar em pico | `Promise.allSettled` + `ApiFaultDTO` + skeletons; sem retry callout; Queueable não retém navegação; medir em piloto |
| R21 | **Volume vias EL-03 (12+ activos+cancelados) sem paginação server** | Baixa | Médio perf LWC | Drawer com scroll virtual + `limit 50` no `CardService`; Apex `LIMIT 50` + ordenação `ViaStatus__c` ativos primeiro |

**Nenhum risco bloqueia build exploratório autorizado** — todos têm placeholder neutro e são reversíveis sem custom object de domínio.

---

*Fim de complemento técnico — `fsc-journey-tech-planner` — 2026-09-05. Próximos artefactos: `tasks.md` + `architecture.md`.*

