# Architecture — `household-360/001` — Visão 360° do cliente Porto Bank

> **Mapa de artefactos e conexões** (Princípio IX). Protótipo validado 100% — 28 cenários (sidebar fixa, NBO estático rico, grupos, gráficos) — aguardando confirmação do negócio (gate VIII) — ver `prototype/README.md`.

## 1. Artefactos e conexões

| # | Artefato | Tipo | Depende de | Chama / é chamado por | Lê | Escreve | Consumido por |
|---|---|---|---|---|---|---|---|
| A01 | `Account` + `Contact` + `Document__c` (reuso busca) + campos enriquecidos do header (responsável, cliente desde, estado civil, rating) | Standard | `busca-cliente/001` | Lido por A04, A06, A09, A18 | `Account` | — | P1/P2, P8 (header) |
| A02 | `Asset` + RTs + customs (reuso + `Consorcio*/Invest*`) | Standard+ | A01, T-A01 | Lido por A04 | `Asset` | — (somente leitura nesta capacidade) | P4 (Financial Accounts) |
| A03 | `Opportunity` + `External_Offer_Id__c`, `Propensity_Score__c`, `Confidence__c`, `Offer_Reasons__c`, `OmniScript_Key__c`, `ExpirationDate__c`, `Loss_Reason__c` | Standard+ | A01 | Escrito por A07/A08; lido por A06 | `Opportunity` | `Opportunity` | P6 (NBO) |
| A04 | `AssetOperationsService` + Controller (`getCustomerAssets`, `fetchRealtimeData`) | Apex | A02, A10 | Chamado por FlexCards P4/P5 | `Asset`, core via A10 | — (volátil não persiste) | P4, P5 |
| A05 | `ProductCatalog__mdt` (reuso busca) | CMDT | — | Lido por A04 | CMDT | — | PT |
| A06 | `NBOService` + Controller (`getOffersAndSync`, `rejectOffer`) — estático | Apex | A03, A10 | Chamado pelo FlexCard NBO | motor via A10; `Opportunity` | `Opportunity` (via A07/A08) | P6 |
| A07 | `NBOSyncQueueable` (upsert idempotente por safra, com confidence/reasons) | Apex | A03 | Chamado por A06 | ofertas | `Opportunity` | P6 (RN-06/RN-17) |
| A08 | `NBORejectQueueable` (Closed Lost + motivo + feedback) | Apex | A03 | Chamado por A06 | oferta | `Opportunity` | P6 (Cen 12) |
| A09 | `Case` (Related List, 9 colunas) | Standard | A01 | Lido pela página | `Case` | — | P7 (tabela) |
| A10 | `HttpCalloutService` + `NC_NboMotor` + `NC_CoreBancario` | Apex/NC | `PS` | Chamado por A04, A06 | externos | `ApiFaultDTO` | P5, P6, P9 |
| A11 | `PortoBank360Channel__c` (`assetId`, `contractNumber`, `productFamily`, `status`) | LMS | — | Publicado pelo inventory (P4); assinado pelo realtime (P5) | — | — | P4→P5 (interno ao domínio) |
| A12 | Highlights 3 colunas + Related List + Subtabs (padrão) | Declarativo | A01 | — | `Account/Contact/Case` | — | P1/P2, P7, multi |
| A13 | ARC Graph em grupos + Details Panel (config) | Declarativo/FSC | A01 | — | relacionamentos | — | P3 |
| A14 | FlexCards `portoAssetInventory` + `portoAssetRealtimeDetail` + `portoNBOPanel` (NBO estático rico) | FlexCard | A04, A06, A11 | Chamam A04/A06; publicam/assinam A11 | DTOs | — | P4, P5, P6 |
| A15 | `PS_Visao360_Operador` + OWD Private re-derivado | PS | A01–A03 | Permite A04, A06, A10, A14, A18–A26 | — | — | Todas |
| A16 | Testes (Apex 75%+ + Jest protótipo + checklist FlexCard/ARC) | Test | A04–A15, A18–A24 | Cobrem A04, A06–A08, A14, A18–A24 | — | — | §16 |
| A17 | `manifest/package-household-360-001.xml` (isolado) | Manifest | A01–A16, A18–A24 | `sf deploy` | — | — | G01 |
| A18 | `Customer360Service` (KPIs + `NBO_MOTOR`, eventos com glifos, tags com busca, wellness com barras/média, planejamento com régua, fluxo com `maximo`, segmentação com cunhas `<path>`, NBA/tarefas/timeline com paginação) | Apex | A01, T-A04 | Chamado pelos FlexCards P6–P10 | `Account` + agregações | — | P6, P8, P9, P10 |
| A19 | `portoResumoKPIs` + `portoEventosTimeline` (glifos SVG, filtro ano) | FlexCard/LWC | A18 | Chamam A18 | KPIs + eventos | — | P8 (Resumo) |
| A20 | `portoTags` (busca/filtro/remoção local via `lightning-pill`) | FlexCard/LWC | A18 | Chamam A18 | tags | — | P8 + sidebar global |
| A21 | `portoWellness` (nota + barras + média roxa) | LWC | A18 | Chamam A18 | wellness | — | P8 |
| A22 | `portoPlanejamento` (régua 5 níveis + marcador + recomendação) | LWC | A18 | Chamam A18 | planejamento | — | P8 |
| A23 | `portoFluxo` (barras JUL–DEZ, 16u, max-width 560px) + `portoSegmentacao` (cunhas `<path>` + legenda) | LWC | A18 | Chamam A18 | fluxo + segmentação | — | P10 (Inteligência) |
| A24 | `portoBehavior` + `portoCampaigns` (acordeões Site/App, tabela com expansão, ✓/✗/?) | FlexCard | A18 | Chamam A18 | acessos site/app, campanhas | — | P10 |
| A25 | `portoNBATasks` (NBA c/ selo Recomendada + tarefas c/ baixa local) | FlexCard | A18 | Chamam A18 | NBA + tarefas | — | P7 (Atividades) |
| A26 | `portoTimeline` (filtros por tipo, expansão por cartão, paginação 4 + restantes) | FlexCard | A18 | Chamam A18 | interações | — | P7 |

## 2. Contratos cross-domain (só dado/evento)

| Consumidor/produtor | Lê/expõe | Como |
|---|---|---|
| `busca-cliente/001` → esta | documento + contexto fixado | Navegação com parâmetro (dependência reversa: nome clicável) |
| Futuras vendas por produto | oferta em negociação + `OpportunityId`/`AccountId`/`omniScriptKey` | Direcionamento (fora desta capacidade) |
| `household-360/*` futuras | `Account/Asset/Opportunity` consolidados | SOQL/API, nunca componente |

## 3. Constraints de ordem de build

1. **A01 → A02/A03 → A10 → A04/A06 → A11 → A14 → A18 → A19–A26 → A16 → A17**; fundação (`_fundacao/001`) antes de A01 finalizar; PS (A15) antes de testes com `runAs`.
2. **Volátil nunca vira campo persistido** — `AssetRealtimeDTO` não mapeia para `Asset.*`; violar isso quebra RN-04.
3. **Recusa é otimista + assíncrona** — UI remove na hora; Apex confirma depois (RN-05).
4. **`PortoBank360Channel__c` ≠ `CustomerInteractionChannel__c`** — canais distintos por domínio, sem subscribe cruzado.
5. **SVG analítico é display puro** — `portoFluxo`/`portoSegmentacao` não chamam `Apex` com DML; são leitura.

## 4. Mapeamento build ↔ protótipo

| Build | Protótipo (`prototype/`) |
|---|---|
| Highlights 3 colunas + Related List + Subtabs | `ui/visaoHeader` (3 colunas, avatar, selos, canais) |
| ARC Graph em grupos + Details | `ui/visaoArc` (família + empresas, fios, recolher, modal) |
| `portoAssetInventory` + Resumo | `ui/visaoAtivos` (cartões) + `ui/visaoContasResumo` (2/4 totais) |
| `portoAssetRealtimeDetail` + Apex | `ui/visaoAtivoDetalhe` (fixture + retry mock + cache) |
| `portoNBOPanel` (sidebar estático rico) + Apex | `ui/visaoNbo` (top 3 rico, modelo/safra, confiança, motivos) + sidebar global |
| `portoTags` (sidebar) | `ui/visaoTags` (busca/filtro/pills) |
| `portoResumoKPIs` + `portoEventosTimeline` + `portoWellness` + `portoPlanejamento` | `ui/visaoResumo` + `ui/visaoEventos` + `ui/visaoWellness` + `ui/visaoPlanejamento` |
| `portoGoals` (donut) | `ui/visaoMetas` (donut SVG + chevron) |
| `portoFluxo` + `portoSegmentacao` | `ui/visaoFluxo` + `ui/visaoSegmentacao` (SVG próprio, mesma altura) |
| `portoBehavior` + `portoCampaigns` | `ui/visaoInteligencia` (acordeões em `lightning-accordion` + tabelas) |
| `portoNBATasks` + `portoTimeline` + `Case` | `ui/visaoProximaAcao` + `ui/visaoTarefas` + `ui/visaoAtividades` + `ui/visaoHistorico` |
| Shell/orquestração (sidebar fixa + grid 2/3 + 1/3) | `page/visaoCliente` |

**Total:** 26 artefactos + 3 contratos = **29 linhas**; 100% das 27 tasks cobertas.
**Rastreabilidade Princípio IX:** 28 cenários com linha `Consumido por` + task + caminho no protótipo.
