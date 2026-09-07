# Plan — `household-360/001` — Visão 360° do cliente Porto Bank

| Campo | Valor |
|---|---|
| **Domínio** | `household-360` — Visão 360 do Household |
| **Capacidade** | 001 — Painel consolidado (visão 360° do cliente) |
| **Slug** | `001-visao-360-cliente` |
| **Status** | **validado 100%** — protótipo cobre os **28 cenários** (16 base + 12 de evolução), construído e validado tecnicamente (build exit 0, preview 200 em `/visao-360`, ícones verificados; Fluxo/Segmentação com SVG próprio); aguardando confirmação do negócio (gate VIII) |
| **Spec** | `specs/household-360/001-visao-360-cliente/spec.md` (**28 cenários**, 1× [NEEDS CLARIFICATION]) |
| **Constitution gates** | Princípio I (fundação `_fundacao/001` não iniciada — exploração autorizada), Princípio II (System Design não iniciado — gate leve), Princípios IV/V/VI NON-NEGOTIABLE aplicados passo a passo |
| **System Design** | `docs/design-system/SYSTEM-DESIGN.md` — **não iniciado** |
| **Decisões de arquitetura de origem** | `visao360.md` (local, gitignored) — página independente na Account raiz, 3 colunas, padrão FSC máximo (Highlights, ARC, FlexCards, Related List), Apex só na orquestração/integração sem IPs, NBO com motor externo + idempotência por safra, voláteis sob demanda sem persistir |

> Este `plan.md` cobre UX/UI (§§1–10, papel `fsc-journey-ux-designer`) + complemento técnico (§§11–17, papel `fsc-journey-tech-planner`). Nomes `c-*`/`FSC*` aqui são decisões de build; o protótipo usa equivalentes LWC no kit (tabela §8).

---

## 1. Tabela de passos — linguagem de negócio (28 cenários → 8 passos base + 7 de evolução + 2 transversais)

| Passo | Persona | Gatilho | Dados lidos | Dados gravados | Pontos de decisão | Condição de saída | Cenários |
|---|---|---|---|---|---|---|---|
| **P0 — Entrada pela busca** | Operador | Clique no nome do cliente no cartão da `busca-cliente/001` | Contexto fixado (documento) | Nenhum (navegação) | — | Página 360° aberta com o cliente como raiz, sem redigitação | 1 |
| **P1 — Faixa de destaques (3 colunas)** | Operador (leitura) | Abertura da página | Nome, documento mascarado, selos ouro/verde, telefone, e-mail, endereço, agência/conta, cliente desde, segmento, estado civil, rating, filhos, completude, responsável, necessidades, canais | Nenhum | Alerta presente vs. ausente | Highlights em 3 colunas + skeleton enquanto carrega | 2, 18 |
| **P2 — Resumo cadastral (mesma faixa)** | Operador (leitura) | Abertura da página | Mesmos dados de P1 (distribuídos nas 3 colunas) | Nenhum | Dado disponível vs. ausente | Renderizado na faixa; sem card separado | 3, 18 |
| **P3 — Mapa de relacionamentos em grupos** | Operador (leitura/exploração) | Abertura (grupos) + "Ver árvore completa" (modal) + recolher por grupo | Grupos lado a lado (família + empresas vinculadas); fós e stubs; multinível no modal + detalhe do nó | Nenhum | Grupo aberto vs. recolhido; clique em nó com doc troca a raiz | Grupos visíveis; modal com detalhe do nó | 4, 5, 27 |
| **P4 — Financial Accounts (cartões)** | Operador (seleção) | Abertura + troca de aba por família | Faixa de totais + cartões por produto (número, valor, encerramento, última mov.) | Nenhum | Aba Todos vs. por família; ativo vs. encerrado/bloqueado | Cartões filtrados com badge em texto; vazio sem erro; "Ver relatório" abre detalhe | 6, 7, 20 |
| **P5 — Detalhe volátil do ativo** | Operador (leitura) | Seleção de um cartão (com sub-abas paralelas) | Limites/fatura, saldo/PIX, assembleia, rentabilidade — sob demanda | Nenhum (nunca persiste) | Cache válido (≤180s) vs. reconsulta; sucesso vs. falha com retry | Painel por tipo renderizado ou banner de retry + leitura reduzida | 8, 9, 16, 20 |
| **P6 — NBO estático (sidebar)** | Operador (decisão) | Carga da raiz (sem spinner) | Até 3 ofertas por prioridade + modelo/safra/geração, confiança, motivos "por que" | Recusa (1 clique + motivo) / aceite (marca negociação) | Recusar vs. contratar vs. ignorar; motor fora na 1ª carga do dia (Carlos, só banner) | Ofertas da safra sem duplicar; expiradas encerradas; válidas ausentes mantidas | 10, 11, 12, 13, 25 |
| **P7 — Atividades + histórico em tabela** | Operador (leitura) | Abertura da aba Atividades | NBA (recomendações + CTA), próximos passos (baixa local), timeline rica (filtros, expansão, paginação), histórico (9 colunas) | Nenhum (baixa/expandido são mock local) | Filtro por tipo; expandir vs. recolhido | Tabelas/grades somente leitura; sem abrir protocolo | 14, 23, 24, 26 |
| **P8 — Resumo rico** | Operador (leitura) | Aba Resumo | KPIs, eventos da vida (ordem + filtro ano), tags (busca/filtro/remoção local), wellness, planejamento | Nenhum (remoção de tag é mock local) | Ano com vs. sem eventos; tag buscada vs. não | Cards com estados vazios discretos | 19 |
| **P9 — Financial Goals (donut)** | Operador (leitura) | Aba Financial Goals | Objetivos com alvo/atual/data-alvo + donut SVG; chevron recolhe | Nenhum | Expandido vs. recolhido | Cartões com progresso; sem meta → vazio | 21 |
| **P10 — Inteligência analítica** | Operador (leitura) | Aba Inteligência | Fluxo (barras JUL–DEZ) + segmentação (pizza), comportamento (acordeão Site/App, tabela com expansão), campanhas (acordeão ✓/✗/?) | Nenhum | Canal Site vs. App; Expandido vs. recolhido | Gráficos SVG + tabelas com rolagem | 22 |
| **P11 — Sidebar fixa + navegação** | Operador | Troca de subaba ou troca de raiz | Estado único de NBO + Tags | Nenhum | Aba A vs. B; raiz via árvore | NBO/Tags visíveis em todas; troca volta ao Resumo | 17 |
| **P12 — Responsividade** | Operador | Viewport estreito | Mesmo dado, layout empilhado | Nenhum | Desktop vs. mobile | Grids/tabelas com rolagem própria, sem corte | 28 |
| **P13 — Estados transversais** | Operador | Qualquer retorno | Flags por área (loading/empty/error/retry) | Nenhum | Sucesso vs. parcial vs. total | Skeletons por área; NBO sem skeleton; falha nunca bloqueia | 9, 15 + EL-03 |
| **PT — Extensibilidade** | Negócio/Admin | Nova família/item configurado | Catálogo de tipos | Nenhum em runtime | — | Novo item surge sem refatorar demais áreas | RN-03 |

**Saída formal (para futuras vendas/transações):** `Contexto 360 = { conta raiz + ativo em foco (quando houver) + oferta em negociação (quando houver) }`. Ver RN-05/RN-14.

---

## 2. Vereditos padrão vs. customizado — gate padrão/declarativo primeiro (Princípio IV)

> **Gate Q1:** OmniStudio/FSC provisionados? Não confirmado (`constitution.md` + fundação pendente). Por regra, assume-se o padrão disponível e registra-se a dependência; onde o padrão cobre, a decisão se mantém mesmo sem a confirmação — só a entrega espera a fundação.

### P0 — Entrada pela busca
- **Veredito:** **padrão** (navegação)
- **Por quê:** link/ação de navegação para a página da conta; o clique no nome (ajuste pequeno no cartão da busca) publica o documento. Sem componente novo nesta capacidade.
- **Artefato:** navegação padrão + ajuste `busca-cliente/001` P3 (dependência reversa registrada).

### P1/P2 — Faixa de destaques em 3 colunas
- **Veredito:** **padrão (blueprint com layout customizado)**
- **Por que customizado não precisa de componente novo:** Highlights em 3 colunas + Record Detail condensados cobrem nome/selos/telefone/e-mail/endereço/agência + resumo do perfil/necessidades; selos e avatar são estilo no blueprint, não componente novo.
- **Artefato:** Highlights Panel (Compact Layout `Account_360_Header`) em 3 colunas; sem Apex.

### P3 — Mapa de relacionamentos em grupos
- **Veredito:** **padrão (ARC configurado)**
- **Por que customizado não precisa:** ARC Relationship Graph (agora em **grupos**: família + empresas vinculadas, com fios/stubs/recolher) + ARC Details Panel + modal expandido cobrem os dois modos; troca de raiz é navegação para outra Account.
- **Artefato:** ARC Graph em grupos + ARC Details Panel (limite 5/20 + paginação).

### P4 — Financial Accounts (cartões)
- **Veredito:** **customizado**
- **Por que padrão não cobre (1 linha):** Related List é tabela única sem cartões por família com faixa Resumo (totais) + grade número/valor/encerramento/última mov. + "Ver relatório" + seleção para detalhe.
- **Tecnologia (árvore):** Q1 FSC/OmniStudio assumido disponível (dependência da fundação); Q3 não (grade interativa com estado); Q4 lógica + performance → **FlexCard** (`portoAssetInventory`)
- **Artefato:** FlexCard `portoAssetInventory` (faixa Resumo em card branco + abas + cartões) — Data Source Apex Remote.

### P5 — Detalhe volátil do ativo
- **Veredito:** **customizado**
- **Por que padrão não cobre (1 linha):** Nenhum componente padrão busca REST sob demanda por tipo de ativo com cache TTL, retry e templates distintos por família (limites/fatura, saldo/PIX, assembleia, rentabilidade) + sub-abas paralelas.
- **Tecnologia:** Q4/Q5 orquestração + performance → **FlexCard** (`portoAssetRealtimeDetail`, escuta PubSub) + **Apex** (Remote Action síncrona + cache)
- **Artefato:** FlexCard `portoAssetRealtimeDetail` + `AssetOperationsService`.

### P6 — NBO estático (sidebar)
- **Veredito:** **customizado**
- **Por que padrão não cobre (1 linha):** Related List de Opportunity não renderiza safra estática com modelo/safra/geração, barra de score, confiança e motivos "por que" sem spinner, nem recusa 1-clique com motivo em background + estado único na sidebar.
- **Tecnologia:** Q4 stateful + Q5 orquestração → **FlexCard** (`portoNBOPanel`) + **Apex** (`NBOService` sync + Queueable upsert); estado no shell (sidebar global)
- **Artefato:** FlexCard `portoNBOPanel` (top 3 rico, selo "Melhor ação" na 1ª) — sem skeleton.

### P7 — Atividades + histórico em tabela
- **Veredito:** **misto (padrão + custom onde padrão não tem gráfico)**
- **Por que custom/misto:** Related List Single de Case cobre o histórico em tabela (9 colunas); **NBA** (recomendações com CTA) e **próximos passos** (baixa local) não têm padrão; **timeline rica** (filtros, expansão por cartão, paginação) exige display custom. FlexCard único para as três faixas + Related List.
- **Artefato:** FlexCard `portoActivities` (NBA + tarefas + timeline) + Related List `Case` (histórico).

### P8 — Resumo rico (KPIs, eventos, tags, wellness, planejamento)
- **Veredito:** **customizado (display analítico)**
- **Por que padrão não cobre:** KPIs patrimoniais, timeline de eventos com glifos, tags com busca/filtro/remoção local, wellness com barras + média e planejamento com régua/marcador não existem como padrão.
- **Artefato:** 4 FlexCards — `portoResumoKPIs`, `portoEventosTimeline`, `portoTags`, `portoWellness`, `portoPlanejamento` (ou LWCs analíticos, a decidir na fundação; protótipo em LWC).

### P9 — Financial Goals
- **Veredito:** **customizado (display analítico)**
- **Por que padrão não cobre:** Donut de progresso por objetivo com alvo/atual/data-alvo + chevron que recolhe o card não existe como padrão.
- **Artefato:** FlexCard `portoGoals` (ou LWC analítico) + donut SVG; dados vêm do mesmo modelo de objetivos.

### P10 — Inteligência analítica
- **Veredito:** **customizado (display analítico)**
- **Por que padrão não cobre:** Barras de fluxo (JUL–DEZ) e pizza de segmentação (cunhas SVG + legenda) + comportamento em acordeão (Site/App, tabela com expansão, ver tudo) + campanhas em acordeão não existem como padrão.
- **Artefato:** 3 FlexCards/LWCs analíticos — `portoFluxo`, `portoSegmentacao`, `portoBehavior` (protótipo em SVG próprio; build em chart nativo ou LWC).

### P11 — Sidebar fixa + navegação
- **Veredito:** **padrão (layout)**
- **Por que customizado não precisa:** Grid 2/3 + 1/3 com `vertical-stretch` para cartas com mesma altura e abas navegáveis à esquerda; estado único de NBO/Tags no shell (sidebar global), não em cada aba.
- **Artefato:** App Builder layout + shell state.

### P12 — Responsividade
- **Veredito:** **padrão (grid)**
- **Por que customizado não precisa:** `slds-grid` com quebras (`medium/large/x-large`) + `c-tabela-rolavel` já cobrem empilhamento e rolagem horizontal sem código novo.

### P13 — Estados transversais
- **Veredito:** **padrão nos padrões, customizado nos FlexCards**
- **Padrão não cobre nos FlexCards:** skeleton por área e Empty/Error State com retry declarativo existem como blocos nativos do FlexCard — usar os nativos, sem pattern custom. NBO é estático (sem skeleton).
- **Artefato:** blocos nativos (Spinner, Empty State, Error State + refresh Action).

### Multitarefa (Cenário 16)
- **Veredito:** **padrão**
- **Por que customizado não precisa:** Sub-abas do Console (Workspace API / navegação padrão) cobrem detalhes paralelos sem código custom.
- **Artefato:** Subtabs do Console.

### PT — Extensibilidade
- **Veredito:** **customizado (propriedade)**
- **Por que padrão não cobre:** Novo tipo sem rearranjo manual exige catálogo dirigido por metadado consumido pelo FlexCard.
- **Artefato:** `ProductCatalog__mdt` (o mesmo da busca) consumido pelos FlexCards.

---

## 3. Árvore de decisão Princípio V — síntese

| Passo | Q1 Lic.? | Q2 It. negócio? | Q3 Display leve? | Q4 Lógica/perf? | Q5 Orquestra? | Q6 Exp.Cloud? | Resultado |
|---|---|---|---|---|---|---|---|
| P0 | — | — | — | — | — | Não | **padrão** (navegação) |
| P1/P2 | Assumido | Não | Sim | Não | Não | Não | **padrão** Highlights 3 col |
| P3 | Assumido | Não | Sim (ARC grupos) | Não | Não | Não | **padrão** ARC grupos |
| P4 | Assumido | Não | Não (cartões) | Sim | — | Não | **FlexCard** inventory |
| P5 | Assumido | Não | Não | Sim | Sim | Não | **FlexCard** + Apex |
| P6 | Assumido | Não | Não | Sim | Sim | Não | **FlexCard** + Apex |
| P7 | Assumido | Não | Não | Sim | — | Não | **misto** (FlexCard + RL) |
| P8 | Assumido | Não | Não (analítico) | Sim | — | Não | **FlexCard/LWC** analítico |
| P9 | Assumido | Não | Não (donut) | Sim | — | Não | **FlexCard/LWC** analítico |
| P10 | Assumido | Não | Não (SVG) | Sim | — | Não | **FlexCard/LWC** analítico |
| P11/P12 | Assumido | Não | Sim | Não | Não | Não | **padrão** layout/grid |
| P13 | — | — | Parcial | Sim (FlexCards) | — | Não | **nativo FlexCard** |
| Multi | — | — | — | — | — | Não | **padrão** Subtabs |

---

## 4. Classificação final da capacidade

**Misto** — padrão onde cobre (P0, P1/P2 3 col, P3 ARC grupos, P11/P12 layout, multitarefa, P13-nativo), customizado onde não (P4/P5/P6 FlexCards + Apex, P7 misto, P8/P9/P10 analíticos, PT metadado).

- **Alternativa 100% customizada rejeitada:** LWCs próprios para destaques, árvore, inventário e NBO — rejeitada porque duplica o que Highlights/ARC/FlexCard/Related List já entregam, violando Princípios IV/VI e criando dívida de sustentação (foi exatamente o erro do legado monolítico).
- **Gate do orchestrator:** por ser `misto`, exige justificativa por passo customizado (acima) + confirmação explícita do usuário antes de `prototype/` e `tasks.md`. **Não é falha** — é o desenho de menor custo sustentável.

---

## 5. Premissas abertas — 1× [NEEDS CLARIFICATION]

| # | Premissa aberta | Impacto no desenho atual | Placeholder no protótipo |
|---|---|---|---|
| 05 | [NEEDS CLARIFICATION: fontes de KYC/score/alerta de fraude — quais campos e critérios disparam cada alerta do topo?] | Faixa com alerta quando houver | Sem banner por padrão (fixture `alerta: null`); score/KYC seguem placeholders |

Resolvidas em 2026-09-06 (RN-10–RN-15): motor fora (só banner), 5/20 nós, troca de raiz pela árvore, aceite com aviso, PIX mascaradas, sub-abas paralelas.

## 6. Reuso e acoplamento

- **Reuso dentro de `household-360`:** primeira capacidade — sem componente pré-existente. Os FlexCards (`portoAssetInventory`, `portoAssetRealtimeDetail`, `portoNBOPanel`) tornam-se o inventário do domínio.
- **Reuso a partir de `busca-cliente/001`:** somente **dado** (documento + contexto fixado). Dependência reversa registrada: o cartão da busca precisa tornar o nome clicável (ajuste P3 da busca, fora desta capacidade).
- **Acoplamento:** nenhum componente importado de outro domínio. LMS `PortoBank360Channel__c` é **interno** a `household-360/001` (seleção de ativo → detalhe). `CustomerInteractionChannel__c` (busca) não é assinado aqui.
- **Microfrontends desacoplados:** cada FlexCard/LWC tem Data Source/contrato próprio; nova família = entrada em `ProductCatalog__mdt` + ramo no FlexCard, sem tocar nos demais.

## 7. Gaps para `fsc-design-system-architect` (System Design não iniciado)

| Gap | Por que precisa de System Design | Default usado no protótipo |
|---|---|---|
| Tokens de selo por situação | Verde/âmbar/cinza funcionais nos cards de ativo | `slds-theme_success/warning/shade` + `lightning-badge` |
| Densidade com sidebar fixa | 2/3 (conteúdo + 6 subabas) + 1/3 (NBO + Tags) com `vertical-stretch` para mesma altura | `slds-grid slds-grid_vertical-stretch` + `c-grafico-col` |
| Gráficos Fluxo/Segmentação | Barras finas e pizza com legendas no tamanho dos recortes, mesma altura | SVG próprio @ 640×210 / cunhas `<path>`; wrapper `max-width:560px` |
| Skeleton por área em FlexCard | Cada painel carrega independente; NBO é estático (sem skeleton) | Blocos nativos + skeletons no protótipo LWC |
| Modal de árvore completa | ARC expandido em tela cheia com Details Panel | `lightning/modal` no protótipo |
| Acessibilidade baseline | WCAG AA, teclado, leitor de tela em grade/modal/timeline | `aria-live`, foco, rolagens — validar quando ratificar |

## 8. Rastreabilidade — cenários → passos → artefatos

| Cenário(s) | Passo | Artefato build → componente do protótipo | Verificação no protótipo |
|---|---|---|---|
| 1 | P0 | Navegação padrão → link no header do protótipo da busca (dependência reversa) | Abrir `/visao-360` direto com `?doc=12345678900` |
| 2, 3, 18 | P1, P2 | Highlights 3 colunas → `ui/visaoHeader` (tipo/nome/selos, autenticação, resumo, responsável) | Fixtures do João; responsivo; sem alerta por padrão |
| 4, 5, 27 | P3 | ARC Graph em grupos → `ui/visaoArc` (grupos + modal) | Família (4) à esquerda + Empresas (1) à direita; recolher por grupo; modal |
| 6, 7, 20 | P4 | FlexCard inventory → `ui/visaoAtivos` + `ui/visaoContasResumo` (Resumo em card branco + abas + cartões) | Cartões com número/valor/encerramento/última mov.; badge em texto |
| 8, 9, 16, 20 | P5 | FlexCard realtime + Apex → `ui/visaoAtivoDetalhe` (fixture + retry mock) | Selecionar ativo → detalhe; simular falha → retry; 2 ativos em sub-abas |
| 10–13, 25 | P6 | FlexCard NBO (sidebar) → `ui/visaoNbo` (safra estática, rico) | Sem spinner; modelo/safra/geração, confiança, motivos; "Melhor ação" |
| 14, 23, 24, 26 | P7 | FlexCards + Related List → `ui/visaoProximaAcao` + `ui/visaoTarefas` + `ui/visaoAtividades` + `ui/visaoHistorico` (tabela 9 col) | NBA + tarefas (mock local), timeline com filtros/paginação, histórico |
| 19 | P8 | FlexCards Resumo rico → `ui/visaoResumo` + `ui/visaoTags` + `ui/visaoWellness` + `ui/visaoPlanejamento` + `ui/visaoEventos` | KPIs 4 em linha, glifos SVG, com/sem dados |
| 21 | P9 | FlexCard Goals → `ui/visaoMetas` + `ui/visaoResumo` (KPIs) | Donut SVG com % central; chevron recolhe |
| 22 | P10 | FlexCards Inteligência → `ui/visaoFluxo` + `ui/visaoSegmentacao` + `ui/visaoInteligencia` (acordeões + tabelas) | Fluxo/segmentação lado a lado, mês rotulado |
| 17, 28 | P11, P12 | Layout + grid → `page/visaoCliente` (shell 2/3 + sidebar 1/3, stretch) | Sidebar fixa em todas; empilha no mobile |
| 15 + EL-03 | P13 (EL-03 com P6) | Blocos nativos → skeletons por área no shell (NBO estático sem skeleton) | Áreas independentes; EL-03 só banner + retry |

Princípio IX: cada cenário tem caminho navegável no `prototype/` (roteiro em `prototype/README.md`) e linha em `architecture.md`.

## 9. Anti-patterns checados

- [x] Padrão checado antes de customizar — cada passo customizado tem o porquê de insuficiência do padrão.
- [x] FlexCard escolhido por Q3/Q4 (display interativo + lógica), não "porque é padrão FSC".
- [x] Sem LWC onde FlexCard/standard cobre — LWC só no protótipo como mock fiel dos FlexCards/ARC.
- [x] Estado via contratos internos ao domínio (PubSub/LMS no build; props/eventos no protótipo), sem vazar entre domínios.
- [x] Nenhum objeto/campo decidido aqui como final — mapeamento é premissa sujeita à fundação (ver §§11–17 como insumo exploratório).

## 10. Próximos gates

1. **Este `plan.md`** → revisão do orchestrator + confirmação do usuário (gate rígido, `misto`) — pendente.
2. **`prototype/`** → validado 100%: **28 cenários** cobertos (shell + 20 UIs, 64 arquivos) — restore com coexistência de overlay, `npm run build` exit 0, preview `200` em `/visao-360` e `/busca-cliente`, gráficos SVG próprios, ícones verificados contra `icon-metadata.json`, clean com kit limpo — **aguardando confirmação do negócio (gate rígido VIII).**
3. **`fsc-journey-tech-planner`** → §§11–17 + `tasks.md` (27) + `architecture.md` (26+3) já elaborados (esta atualização).

---

*Fim de `plan.md` (UX) — `household-360/001`. Classificação: **misto**.*

---

# Parte Técnica — complemento `fsc-journey-tech-planner`

> **Status:** elaborado exploratoriamente (fundação pendente) sobre as decisões de negócio da spec. Protótipo valida UX; este complemento realiza tecnicamente.
> **Decisões herdadas de `visao360.md`:** página na Account raiz com sub-abas, 3 colunas, padrão FSC máximo, Apex só em orquestração/integração sem IPs, NBO com motor externo + idempotência `{doc}_{cod}_{periodo}`, voláteis sob demanda sem persistir, cache client-side curto, Named Credentials + gateway, top 3 NBO, recusa 1-clique com motivo, aceite → OmniScript futuro por produto.

---

## 11. Modelo de dados — origem → destino + Princípio VI

### 11.1 Princípio VI aplicado

| Objeto padrão checado | Cobriria? | Por que não adotado (ainda) nesta capacidade |
|---|---|---|
| `FinServ__FinancialAccount__c` / `FinServ__Card__c` / `FinServ__FinancialAccountRole__c` / Household FSC | Sim, semanticamente | Exigem pacote FSC + Person Account + Household — `constitution.md` em aberto, `_fundacao/001` não iniciado. Travaria esta capacidade. |
| Standard Data Model FSC nativo (`FinancialAccount`, `IssuedCard`, `Party*` — sem namespace) | Sim, se a org já estiver nele | A confirmar na fundação qual geração do modelo a org destino usa. |
| **Conclusão** | — | **Mesmo padrão da busca (RN-16):** `Account+Contact` + `Asset` + `Opportunity` + `Case` (leitura), sem objeto customizado de domínio. Reavaliação documentada quando a fundação ratificar. |

### 11.2 Tabela dado → campo

| # | Dado de negócio | Destino Salesforce | Tipo | Notas |
|---|---|---|---|---|
| D01 | Cliente raiz (documento do contexto) | `Account.Document__c` (External ID, o mesmo da busca) | Reuso | Sem duplicar cadastro; raiz de todas as leituras |
| D02 | Perfil/contato/score/KYC | `Account` + `Contact` espelho + `CustomerSegment__c` | Reuso | Alerta de fraude/score: campos a confirmar (premissa 05) |
| D03 | Ativos por família | `Asset` com `ProductType__c` + RecordTypes `CreditCard`/`DigitalAccount`/`Consortium`/`Investment` (premissa adotada) + `ExternalContractId__c`, `CardBrand__c`/`Last4__c`, `ConsorcioGrupo__c`/`ConsorcioCota__c`, `ValorContrato__c`, `ViaStatus__c` | Reuso + customs da busca | Hierarquia `ParentId` para vias/cotas filhas |
| D04 | Detalhe volátil | **Não persiste** — DTO em memória (`totalLimit`, `availableLimit`, `invoiceAmount`, `balance`, `pixKeys`, `debitBalance`, `nextMeetingDate`) | Transitório | Cache client-side 180s; retry com backoff |
| D05 | Ofertas NBO | `Opportunity`: `External_Offer_Id__c` (`{doc}_{cod}_{periodo}`, External ID), `Propensity_Score__c`, `OmniScript_Key__c`, `ExpirationDate__c`, Stage `Identified` → `Negotiation/Review` (aceite) / `Closed Lost` + `Loss_Reason__c` (recusa/expirada) | Reuso + customs | Upsert idempotente por safra; sem `NBO__c` customizado |
| D06 | Histórico | `Case` (leitura: data, motivo, situação) | Reuso | Sem criação de protocolo nesta capacidade |
| D07 | Relacionamentos | `AccountContactRelation` (papéis) + grupo/household (a ratificar na fundação) | Padrão | ARC lê o mesmo modelo |

### 11.3 Idempotência e ciclo de vida (RN-06)
- Upsert por `External_Offer_Id__c`; resposta sem oferta válida vencida → `Closed Lost` + motivo expiração; ausente-mas-válida → mantida; recusa → `Closed Lost` + motivo em Queueable (UI otimista remove na hora).

---

## 12. Automação — Apex só onde padrão não alcança

### 12.1 Vereditos
| Necessidade | Declarativo cobre? | Decisão |
|---|---|---|
| Highlights/Record Detail/ARC/Related List/Subtabs | Sim | Padrão, sem task de código |
| Tabs/filtro/badges do inventário | Parcial (layout sim, dados não) | FlexCard + Apex Remote |
| Detalhe volátil sob demanda + cache + retry | Não | FlexCard + Apex |
| NBO sync + top 3 + recusa/aceite | Não | FlexCard + Apex |
| Persistência NBO/auditoria | Não (assíncrona) | Queueable |

### 12.2 Arquitetura Apex
```
FlexCards (portoAssetInventory / portoAssetRealtimeDetail / portoNBOPanel)
  │  Apex Remote Action (sem IP)
  ├─► AssetOperationsController
  │     ├─► AssetInventoryService.getCustomerAssets(accountId)   // SOQL Asset + CMDT catálogo
  │     └─► AssetRealtimeService.fetchRealtime(contractNumber, family) // callout core + ApiFault
  ├─► NBOController
  │     ├─► NBOService.fetchEligibleOffers(accountId)           // callout motor → top 3
  │     ├─► NBOSyncQueueable(accountId, offers)                 // upsert Opportunity idempotente
  │     └─► NBORejectQueueable(offerExternalId, reason)         // Closed Lost + feedback motor
  └─► HttpCalloutService (Named Credentials, timeout por fonte)
```
- LMS `PortoBank360Channel__c` interno ao domínio (seleção de ativo → detalhe); nunca cross-domain.
- OmniScripts de venda (`osSale*`) são capacidades futuras — aqui só o direcionamento com `OpportunityId`+`AccountId`+`omniScriptKey`.

### 12.3 DTOs
- `AssetSummaryDTO { assetId, contractNumber, productFamily, label, maskedId, status }`
- `AssetRealtimeDTO { totalLimit, availableLimit, invoiceAmount, dueDate, balance, pixKeys, debitBalance, nextMeetingDate }`
- `NBOOfferDTO { offerId, productCode, productName, category, priority, propensityScore, headline, omniScriptKey, expirationDate }`
- Reuso: `ApiFaultDTO`, `ProductCatalog__mdt`, `InteractionContextDTO` (leitura do contexto da busca).

---

## 13. Segurança — Princípio VII

| Objeto | OWD proposto | Justificativa |
|---|---|---|
| `Account`/`Contact` | `Private` / `ControlledByParent` | Mesmo baseline da busca (re-derivado, não copiado) |
| `Asset` | `Private` | Vínculo financeiro sensível, inclui inativos |
| `Opportunity` (NBO) | `Private` | Propensão comercial sensível |
| `Case` | `Private` (leitura nesta capacidade) | Histórico visível, sem criação aqui |
| `ProductCatalog__mdt` | `Public Read Only` | Catálogo não sensível |

- `PS_Visao360_Operador`: Read em Account/Contact/Asset/Opportunity/Case + Apex executáveis + FlexCards visíveis. Sem Profile clonado.
- Premissas abertas: base legal LGPD de exibição (herdada da busca), perfis com menos dados, mascaramento PIX (RN-15).

---

## 14. Integração

| # | Sistema | Operação | Tecnologia | Sync/Async | Timeout |
|---|---|---|---|---|---|
| I01 | Motor de propensão NBO | `GET /nbo/elegibilidade/{doc}` → top 3 + sync | `NBOService` → `NC_NboMotor` | Sync exibe + Queueable persiste | 3.0s |
| I02 | Core bancário volátil | `GET /ativos/{contrato}/realtime` por família | `AssetRealtimeService` → `NC_CoreBancario` | Sync sob demanda + cache 180s client | 3.0s |
| I03 | Cadastro/inventário/casos | SOQL local (`Account/Asset/Opportunity/Case`) | Services, sem callout | Sync | — |
| I04 | Feedback de recusa ao motor | `POST /nbo/feedback {offerId, reason}` | `NBORejectQueueable` | Async | — |

- Retry só com backoff no detalhe volátil (botão explícito); callouts sem retry automático; `ApiFaultDTO` → banner + leitura reduzida (RN-07).
- `NC_*` com External Credential (OAuth2/mTLS) via gateway corporativo — sem segredo no código.

## 15. Migração

Sem bulk nesta capacidade (`_fundacao/002`). Migração = upsert progressivo de NBO + leitura do consolidado; mapeamento `Asset` legado → modelo final fica na fundação.

## 16. Estratégia de teste

| Cenário(s) | Apex test | Validação funcional (protótipo) |
|---|---|---|
| 1, 2, 3 (entrada/topo/perfil) | `AssetInventoryServiceTest` (mock SOQL) | Abrir `/visao-360?doc=...` → topo + perfil |
| 4, 5 (árvore) | — (declarativo; validar config ARC em sandbox) | 5 nós; modal + detalhe do nó |
| 6, 7, 16 (abas/selos/multitarefa) | `AssetInventoryServiceTest` (filtros, inativos) | Trocar abas; 2 ativos em paralelo |
| 8, 9 (volátil + falha) | `AssetRealtimeServiceTest` (HttpCalloutMock ok/timeout; cache TTL) | Detalhe por tipo; simular falha → retry |
| 10–13 (NBO) | `NBOServiceTest` (top 3, dedup safra, expiradas), `NBORejectQueueableTest` | 3 por score; recusar some; contratar marca |
| 14 (histórico) | — (Related List padrão) | Lista sem criar protocolo |
| 15 (progressivo) | Controller allSettled | Skeletons por área (NBO estático sem skeleton) |
| 17–19 (sidebar, padrões, rico) | `Customer360Service` | Fluxo/segmentação/behavior sem N+1 | Graphs/sidebars responsivos |
| 20–28 (evolução) | `AssetInventoryService` + `Customer360Service` | Cartões, donuts, timeline | Cards/tabelas em stretch |

Jest para os 20 UIs do protótipo (mock de dados: glifos SVG, donut, fluxo/segmentação, timeline rica); FlexCards/ARC validados por checklist funcional em sandbox (não há Jest para FlexCard) — inclui acordeões, grupos e mesma altura.

## 17. Riscos

| Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|
| R01 `_fundacao/001` indefinida (Person/Household/`FinServ__*`) | Alta | Alto — remodelagem | Modelo core reversível + External IDs; DTO estável |
| R02 Licenças FSC/OmniStudio não confirmadas | Média | Alto — FlexCard/ARC indisponíveis | Protótipo LWC aprova UX; entrega aguarda fundação |
| R03 Limites ARC (10 filhos/nó, 5 junctions) em household denso | Média | Médio | Filtros + paginação (RN-13); validar em piloto |
| R04 SLA core/motor desconhecido | Média | Alto (TMA) | Timeouts finos + cache + retry explícito; medir em piloto |
| R05 OmniScripts de venda inexistentes no aceite | Alta (já ocorre) | Baixo | RN-14 (aviso + mantém tela); jornadas futuras consomem o contexto |

---

*Fim de complemento técnico — `fsc-journey-tech-planner`. Próximos artefactos: `tasks.md` + `architecture.md` (revisado 2026-09-07 para 28 cenários).*
