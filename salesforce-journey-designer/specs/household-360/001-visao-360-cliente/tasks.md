# Tasks — `household-360/001` — Visão 360° do cliente Porto Bank

> **Ordem de build real:** dados + segurança → integração/automação Apex → UI (padrão primeiro, FlexCards depois) → testes → cutover.
> **Validação UX:** `prototype/` (LWC real sobre SLDS2 real, mock fiel dos FlexCards/ARC) validado 100% — **28 cenários** (build exit 0, preview 200, gráficos SVG próprios, timeline e NBO ricos) — **aguardando confirmação do negócio (gate VIII)** — não re-litigar UX sem motivo, apenas realizar tecnicamente. Ver `prototype/README.md`.
> **Premissas abertas:** 1× [NEEDS CLARIFICATION] (fontes KYC/fraude) + placeholders reversíveis — nenhuma regra inventada.
> **Princípios:** IV (padrão primeiro), VI (sem objeto customizado), VII (segurança re-derivada), IX (cada cenário tem task).

---

## Grupo A — Modelo de dados (reuso + customs onde padrão não tem)

- [ ] **T-A01 — Reusar campos da busca + RecordTypes Asset** — Confirmar `Account.Document__c`, `Asset.ExternalContractId__c`/`ProductType__c`/campos de via/cota/posição, `Opportunity.ExternalOfferId__c` (vindos de `busca-cliente/001`); criar RecordTypes `CreditCard`/`DigitalAccount`/`Consortium`/`Investment` em `Asset` — **Depende de:** `busca-cliente/001` A-foundation, `_fundacao/001` — **Cenários:** 6, 7, 20 — **Aceite:** 4 RTs ativos; inventário filtra por RT sem SOQL dinâmica insegura.
- [ ] **T-A02 — Campos NBO em Opportunity (expandido)** — `Propensity_Score__c`, `Confidence__c`, `OmniScript_Key__c`, `ExpirationDate__c`, `Loss_Reason__c`, `Offer_Safra__c` (texto `External_Offer_Id__c`), `Offer_Reasons__c` (long text) — **Depende de:** T-A01 — **Cenários:** 10–13, 25 — **Aceite:** upsert por `External_Offer_Id__c` não duplica safra; "por que" persiste para auditoria.
- [ ] **T-A03 — ACR/papéis + grupo para ARC em grupos** — Confirmar `AccountContactRelation` com papéis (titular, cônjuge, sócio, procurador) e associação conta↔grupo/household conforme `_fundacao/001` — **Depende de:** `_fundacao/001` — **Cenários:** 4, 5, 27 — **Aceite:** ARC lê 1º nível em grupos + modal multinível sem objeto customizado.
- [ ] **T-A04 — Modelo para Inteligência e Resumo rico** — `Account.CustomerSince__c`, `Account.FamilySize__c`/`MaritalStatus__c`/`CreditRating__c`/`ProfileCompleteness__c` + campos enriquecidos do header (telefone, e-mail, responsável, segmento, jornada) + MDTs/objetos para life events (`glifo`, `data`), tags (segmento/investimentos/estilo), wellness (`barras`, `media`), planejamento (`etapa`), fluxo (`maximo`, `meses[]`), segmentação (`itens[]`) — a ratificar se vêm de data lake ou campos calculados — **Depende de:** `_fundacao/001` — **Cenários:** 18, 19, 22 — **Aceite:** Resumo/Inteligência lêem do mesmo modelo que o protótipo espelha em `data/visao360`; EL-08/EL-09 cobrem vazios.

## Grupo B — Segurança (Princípio VII)

- [ ] **T-B01 — OWD + PS_Visao360_Operador** — `Account/Contact/Asset/Opportunity/Case=Private` (re-derivado, não copiado); `PS_Visao360_Operador` com Read + Apex executáveis + FlexCards visíveis; FLS mascara PIX e documento — **Depende de:** T-A01–T-A04 — **Cenários:** todos (acesso) — **Aceite:** sem PS falha `INSUFFICIENT_ACCESS`; PIX mascarada (RN-15).

## Grupo C — Integração e Automação Apex (sem IP)

- [ ] **T-C01 — Named Credentials** — `NC_NboMotor` (reuso busca) + `NC_CoreBancario` (`/ativos/{contrato}/realtime`, timeout 3.0s) via gateway, External Credential OAuth2/mTLS — **Depende de:** T-B01 — **Cenários:** I01, I02 — **Aceite:** sem hardcode; mock cobre ok/timeout/5xx.
- [ ] **T-C02 — HttpCalloutService (reuso + fault)** — Reusar padrão da busca (`call(nc,path,timeoutMs)` → `HttpResponse | ApiFaultDTO`) — **Depende de:** T-C01 — **Cenários:** 9, 15 — **Aceite:** timeout → `ApiFaultDTO`, sem exceção para a UI.
- [ ] **T-C03 — AssetOperationsService/Controller** — `getCustomerAssets(accountId)` (SOQL Asset + CMDT, ativos+inativos) + `fetchRealtimeData(contractNumber, family)` (callout core por tipo) — **Depende de:** T-C02, T-A01 — **Cenários:** 6, 7, 8, 16, 20 — **Aceite:** 4 famílias; retry só via botão (sem loop automático).
- [ ] **T-C04 — NBOService/Controller + Queueables (estático)** — `getOffersAndSync` (callout motor → top 3 imediato estático + `NBOSyncQueueable` upsert idempotente com confidence/reasons), `rejectOffer` → `NBORejectQueueable` (Closed Lost + motivo + feedback motor) — **Depende de:** T-C02, T-A02 — **Cenários:** 10–13, 25 — **Aceite:** mesma safra 2x não duplica; NBO sem skeleton.
- [ ] **T-C05 — LMS PortoBank360Channel__c** — `messageChannel-meta.xml` (`assetId`, `contractNumber`, `productFamily`, `status`), interno ao domínio — **Depende de:** nada (puro) — **Cenários:** 8, 16 — **Aceite:** seleção publica; detalhe assina; nada cross-domain.
- [ ] **T-C06 — Services para Inteligência/Rico** — `Customer360Service` (KPIs + `NBO_MOTOR`, eventos com glifos, tags com busca, wellness com barras/media, planejamento com régua, fluxo com maximo/meses, segmentação com cunhas, NBA/tarefas/timeline com 7 interações expandidas e paginação) lendo do modelo T-A04 + agregações; sem callout síncrono novo — **Depende de:** T-A04 — **Cenários:** 17, 19, 21, 22, 23, 24 — **Aceite:** cada subaba lê sem N+1; todos os 28 cenários têm fonte; EL-08/EL-09 cobrem vazios.

## Grupo D — UI (padrão primeiro, FlexCard/LWC onde precisa)

- [ ] **T-D01 — Header 3 colunas (padrão)** — Compact Layout `Account_360_Header` em 3 colunas (tipo+nome+selos ouro/verde, Autenticação, Resumo do perfil, Responsável com avatar + Necessidades) — D01 mapeado para `ui/visaoHeader` (c-cabecalho, 3 colunas SLDS) — **Depende de:** T-A01, T-A04 — **Cenários:** 2, 3, 18 — **Aceite:** 3 colunas responsivas; sem alerta por padrão (`alerta: null`).
- [ ] **T-D02 — ARC em grupos + Details (padrão, config)** — ARC em grupos lado a lado (família + empresas vinculadas) com fios/stubs/recolher + modal expandido (≤20 + paginação) + Details Panel; troca de raiz = navegação — **Depende de:** T-A03 — **Cenários:** 4, 5, 27 — **Aceite:** grupos visíveis; recolher por grupo funcional.
- [ ] **T-D03 — FlexCard portoAssetInventory + Resumo de totais** — Faixa Resumo em card branco + abas Todos/Cartões/Conta/Consórcio/Invest, cartões com número/valor/encerramento/última mov. + "Ver relatório", publica seleção no canal — **Depende de:** T-C03, T-C05 — **Cenários:** 6, 7, 20 — **Aceite:** ativos+inativos; vazio sem erro.
- [ ] **T-D04 — FlexCard portoAssetRealtimeDetail** — Escuta o canal; templates por família; cache 180s; retry explícito; sub-abas paralelas no Console; nunca persiste volátil — **Depende de:** T-C03, T-C05 — **Cenários:** 8, 9, 16, 20 — **Aceite:** detalhe por tipo; falha → banner + leitura reduzida.
- [ ] **T-D05 — FlexCard portoNBOPanel (sidebar, estático)** — Top 3 rico por score (modelo/safra/geração, barra, confiança, motivos "por que") com selo "Melhor ação" na 1ª; Recusar (motivo rápido, otimista) / Contratar (direciona OmniScript futuro); sidebar fixa em todas as abas — **Depende de:** T-C04, T-C05 — **Cenários:** 10–13, 25, 17 — **Aceite:** sem spinner; Carlos 1ª carga só banner.
- [ ] **T-D06 — Tags de interesse (sidebar)** — Busca funcional + filtro por categoria + remoção local em pills (`lightning-pill`) + "Explorar tags" futuro — **Depende de:** T-A04 — **Cenários:** 19, 17 — **Aceite:** busca/filtro/remoção em mock local, sem Apex.
- [ ] **T-D07 — Resumo rico (4 FlexCards/LWCs)** — KPIs (4 em linha), `portoEventosTimeline` (glifos SVG, recentes-primeiro + filtro ano), `portoWellness` (nota + barras + média), `portoPlanejamento` (régua + marcador + recomendação) — **Depende de:** T-A04, T-C06 — **Cenários:** 19 — **Aceite:** cada card com estados vazios discretos.
- [ ] **T-D08 — Financial Goals (donut)** — `portoGoals` (título sublinhado + badge + chevron que recolhe, valores em azul, donut SVG com %) + KPIs — **Depende de:** T-A04 — **Cenários:** 21 — **Aceite:** donut com traço proporcional ao % central.
- [ ] **T-D09 — Inteligência analítica (3 FlexCards/LWCs)** — `portoFluxo` (barras JUL–DEZ, 16u, max-width 560px), `portoSegmentacao` (cunhas `<path>` + legenda), `portoBehavior` (acordeão Site/App, tabela com expansão, ver tudo) + `portoCampaigns` (acordeão ✓/✗/?) — **Depende de:** T-A04, T-C06 — **Cenários:** 22 — **Aceite:** gráficos lado a lado com mesma altura (`vertical-stretch`).
- [ ] **T-D10 — Atividades (NBA + tarefas + timeline + histórico)** — `portoNBATasks` (NBA com CTA + selo Recomendada; tarefas com baixa local) + `portoTimeline` (filtros por tipo, expansão por cartão, paginação 4 + restantes, linha do tempo rica) + Related List `Case` (tabela 9 col) — **Depende de:** T-C06 — **Cenários:** 14, 23, 24, 26 — **Aceite:** cada faixa com vazio discreto; timeline com 7 interações no João; histórico em tabela (base + 9 col).
- [ ] **T-D11 — App Builder da página (montagem)** — Account record page com grid 2/3 (conteúdo + 6 subabas) + 1/3 (sidebar fixa NBO+Tags, stretch) + Arc/Console; sem wrapper custom — **Depende de:** T-D01–T-D10 — **Cenários:** 17, 28, 15 — **Aceite:** sidebar visível em todas; empilha no mobile; skeletons por área.

## Grupo E — Migração

- [ ] **T-E01 — Sem bulk; upsert NBO progressivo** — Só `NBOSyncQueueable` idempotente; mapeamento legado → fundação (`_fundacao/002`) — **Depende de:** T-C04 — **Cenários:** 11 — **Aceite:** re-sync da safra não duplica.

## Grupo F — Testes (Princípio IX)

- [ ] **T-F01 — Apex tests (75%+)** — `AssetOperationsServiceTest` (filtros, inativos, retry), `NBOServiceTest` (top 3 rico, dedup, expiradas, estático), `NBORejectQueueableTest`, `NBOSyncQueueableTest`, `Customer360ServiceTest` (KPIs, timeline, fluxo/segmentação), `HttpCalloutMock` ok/timeout/5xx — **Depende de:** T-C01–T-C06 — **Cenários:** 6–13, 19, 22 — **Aceite:** `RunLocalTests` ≥75% por classe.
- [ ] **T-F02 — Jest protótipo + checklist FlexCard/ARC** — Jest nos 20 UIs do `prototype/` (inclui visaoEventos com SVG, visaoMetas com donut, visaoFluxo/visaoSegmentacao); checklist em sandbox para FlexCards/ARC (abas, badges, retry, recusa/aceite, grupos, acordeões, mesma altura) — **Depende de:** T-D01–T-D11 — **Cenários:** todos (28) — **Aceite:** unit verde + checklist assinado.
- [ ] **T-F03 — Validação funcional 28 cenários** — Roteiro `prototype/README.md` via restore+preview (Cen 1–28 + ELs) — **Depende de:** T-D11 — **Cenários:** 1–28 + ELs — **Aceite:** cada cenário navegável; `evidence.md` opcional.

## Grupo G — Cutover

- [ ] **T-G01 — package.xml isolado + smoke + rollback** — Manifest (fields, CMDT, FlexCards/LWCs, LMS, Apex, PS; sem outro domínio) + dry-run + piloto (skeletons→detalhe→NBO estático→retry) + rollback (desativar PS) — **Depende de:** T-F03 — **Cenários:** — **Aceite:** deploy limpo; piloto completa sem travar em falha parcial.

---

**Total tasks:** 27 (A:4 + B:1 + C:6 + D:11 + E:1 + F:3 + G:1).
**Cobertura:** 28 cenários + 9 ELs + 1 premissa aberta como placeholder.
