# Protótipo — `household-360/001` (fonte única da jornada)

Esta pasta é a **fonte única** de todos os arquivos da jornada. Nada da jornada
vive no kit vendorizado (`.claude/skills/salesforce-ux/design-system-2-starter-kit/`)
fora de um overlay temporário de validação — ver `scripts/restore-prototype.mjs`.

## Estrutura (espelha `src/modules/` do kit)

| Esta pasta | Destino temporário no kit (só p/ validar) |
|---|---|
| `page/visaoCliente/` (shell: estado, `?doc=`, 6 subabas, sidebar fixa NBO+Tags, sub-abas paralelas) | `src/modules/page/visaoCliente/` |
| `ui/visaoTags/` (Resumo — tags com busca/filtro/remoção local) | `src/modules/ui/visaoTags/` |
| `ui/visaoWellness/` (Resumo — nota + evolução em barras) | `src/modules/ui/visaoWellness/` |
| `ui/visaoPlanejamento/` (Resumo — régua de maturidade + recomendação) | `src/modules/ui/visaoPlanejamento/` |
| `ui/visaoEventos/` (Resumo — timeline com ordem/filtro de ano) | `src/modules/ui/visaoEventos/` |
| `ui/visaoContasResumo/` (Financial Accounts — faixa de totais) | `src/modules/ui/visaoContasResumo/` |
| `data/visao360/` (fixtures João + simulação core/NBO + cache 180s) | `src/modules/data/visao360/` |
| `ui/visaoHeader/` (P1/P2 — 3 colunas: nome/selos/autenticação, resumo do perfil, responsável/necessidades) | `src/modules/ui/visaoHeader/` |
| `ui/visaoResumo/` (Resumo/Goals — faixa de KPIs) | `src/modules/ui/visaoResumo/` |
| `ui/visaoInteligencia/` (aba Inteligência — fluxo, segmentação, comportamento, campanhas) | `src/modules/ui/visaoInteligencia/` |
| `ui/visaoFluxo/` (Inteligência — barras de entrada e saída) | `src/modules/ui/visaoFluxo/` |
| `ui/visaoSegmentacao/` (Inteligência — pizza de gastos) | `src/modules/ui/visaoSegmentacao/` |
| `ui/visaoArc/` (P3 — resumida 5 nós + abre modal) | `src/modules/ui/visaoArc/` |
| `ui/visaoArcModal/` (P3 — árvore completa tela-cheia + detalhe do nó) | `src/modules/ui/visaoArcModal/` |
| `ui/visaoAtivos/` (P4 — abas + cartões de produto) | `src/modules/ui/visaoAtivos/` |
| `ui/visaoAtivoDetalhe/` (P5 — detalhe por tipo + skeleton + retry) | `src/modules/ui/visaoAtivoDetalhe/` |
| `ui/visaoMetas/` (aba Metas — objetivos com progresso) | `src/modules/ui/visaoMetas/` |
| `ui/visaoNbo/` (P6 — estático: motor/safra, score, confiança, motivos, recusar/contratar) | `src/modules/ui/visaoNbo/` |
| `ui/visaoHistorico/` (P7 — tabela de atendimentos, somente leitura) | `src/modules/ui/visaoHistorico/` |
| `ui/visaoProximaAcao/` (aba Atividades — NBA com CTA, estado local) | `src/modules/ui/visaoProximaAcao/` |
| `ui/visaoAtividades/` (aba Atividades — linha do tempo) | `src/modules/ui/visaoAtividades/` |
| `ui/visaoTarefas/` (aba Atividades — próximos passos, estado local) | `src/modules/ui/visaoTarefas/` |

## Fiação temporária (aplicada pelo restore, revertida pelo clean)

Blocos legíveis por `scripts/restore-prototype.mjs` — não mude o formato
`// SECTION:` sem atualizar o script.

`src/routes.config.js` — acrescentar ao array `routes`:
```js
// SECTION: routes
  {
    path: '/',
    component: 'page-visao-cliente',
    title: 'Visão 360° do Cliente',
    navPage: 'visao-cliente',
    navLabel: 'Visão 360°',
    app: 'visao-cliente',
  },
```

`src/apps.config.js` — acrescentar ao array `apps`:
```js
// SECTION: apps
  {
    id: 'visao-cliente',
    label: 'Visão 360°',
    variant: 'console',
    icon: 'standard:person_account',
    pathPrefix: '/visao-cliente',
    defaultPath: '/visao-cliente',
    pages: ['visao-cliente'],
  },
```

`src/modules/shell/app/app.js` — acrescentar após o import do NotFound:
```js
// SECTION: appjs-import
import VisaoCliente from 'page/visaoCliente';
```

E em `ROUTE_COMPONENTS`, após a linha do Builder:
```js
// SECTION: appjs-route
    'page-visao-cliente': VisaoCliente,
```

## Validar (overlay temporário, depois limpa)

```bash
cd .claude/skills/salesforce-ux/design-system-2-starter-kit
node scripts/restore-prototype.mjs household-360/001-visao-360-cliente
npm run build
npm run open -- /visao-cliente   # ou abrir-prototipos.bat na raiz
node scripts/restore-prototype.mjs --clean household-360/001-visao-360-cliente
```

Após o `--clean`, `git status` no kit deve voltar a ficar limpo de arquivos
da jornada — a prova de que o kit ficou intocado.

## Roteiro de navegação → cenários do spec

Documentos de teste (`?doc=`; default João): `12345678900` (João, PF completo +
NBO top 3), `12ABC345000190` (Indústria Exemplo, PJ sem ofertas, abas vazias),
`11111111111` (Maria, só conta, sem ofertas), `99999999999` (Carlos, motor NBO
fora na 1ª carga → retry com sucesso).

| Ação no protótipo | Cenário(s) |
|---|---|
| Abrir `/visao-cliente` (default João) ou `/visao-cliente?doc=12345678900` — página abre com o cliente como raiz, sem redigitação | 1 |
| Topo: nome, CPF mascarado, selos Exclusivo + Ativo, canais preferidos, saldo consolidado (sem alerta — KYC segue placeholder de spec) | 2 |
| Perfil: contato, endereço, renda/score, agência/conta | 3 |
| Subabas (padrão SLDS): Resumo, Inteligência, Financial Accounts, Financial Goals, Relacionamentos, Atividades; troca de raiz volta ao Resumo. Sidebar fixa à direita (NBO + Tags) visível em todas; conteúdo navega à esquerda | — (telas de referência) |
| Resumo: KPIs no topo + NBO (selo "Melhor ação") com Tags de interesse abaixo do NBO (busca, filtro, remoção local); Eventos da vida; Saúde financeira 4,8 com evolução em barras; Planejamento Intermediário com régua + recomendação | — (telas de referência) |
| Financial Accounts: faixa Resumo (4 totais) + Produtos em cartões (número, valor, encerramento, última movimentação, "Ver relatório" abre o detalhe) | — (telas de referência) |
| Financial Goals: cartões com título sublinhado + estado + chevron (recolhe de verdade), alvo/atual/data-alvo e donut SVG de progresso (58% e 35%) — resumo financeiro vem do mesmo card de KPIs | — (telas de referência) |
| Inteligência: Fluxo de entrada e saída (barras JUL–DEZ) + Gastos por segmentação (pizza com legenda); Comportamento digital em acordeão com sub-abas Site/Aplicativo, tabela com expansão por linha e "+ Ver tudo"; Reação a campanhas em acordeão (✓/✗/pendente por objetivo). Atendimento saiu da aba (dados seguem no Histórico) | — (telas de referência) |
| Atividades: esquerda empilha Próxima melhor ação + Próximos passos (componentes independentes), direita a Melhor oferta (NBO); abaixo, linha do tempo em grade responsiva (1 col mobile, 2 col desktop) com filtro por tipo, "Ver mais" por cartão (duração, canal, protocolo) e paginação no rodapé — 7 interações no João | 14 (estendido) |
| Histórico: tabela com 9 colunas (protocolo, data, assunto, categoria, canal, responsável, situação, satisfação ★, resolução) — 5 casos no João | 14 (estendido) |
| Aba Relacionamentos: mapa estilo ARC — raiz no topo, grupo "Família Silva (4)" como grupo principal (titular como membro principal + cônjuge + 2 dependentes) e grupo "Empresas vinculadas (1)"; clique em nó com doc troca a raiz | 4 |
| "Ver árvore completa" → modal tela-cheia multinível + detalhe do nó; "Abrir Visão 360° deste vínculo" troca a raiz sem voltar à busca | 5, RN-11, EL-05 |
| Financial Accounts — abas Todos/Cartões/Conta/Consórcio/Invest filtram os cartões; seleção sobrevive à troca de aba | 6 |
| Cartões com ativos e inativos: identificador + selo de situação em texto (badge); semáforo por cor removido — cor nunca sozinha | 7 |
| Financial Accounts: selecionar ativo → detalhe por tipo (limites/fatura, saldo/PIX mascaradas, saldo/assembleia, valor/rentabilidade) com horário da consulta; reselecionar mostra "(cache de 180s)"; Recarregar força nova consulta | 8, RN-15, EL-07 |
| Selecionar "Consórcio Imóvel" (1ª vez falha) → banner + "Tentar Novamente" + leitura reduzida, resto navegável; retry exibe o detalhe | 9 |
| Resumo: NBO estático (sem spinner) — motor/safra/geração, 3 ofertas ordenadas por score (Black 92, Consórcio 81, CDB 74) com selo "Melhor ação", barra de score, confiança, "Por que esta oferta" (3 motivos), condição, validade, safra `{doc}_{cod}_{periodo}` e elegibilidade | 10, 11 |
| Recusar → motivo rápido (Sem Interesse/Achou Caro/Já Possui) → card some na hora; selo passa à próxima | 12 |
| Contratar → marca negociação + "Oferta reservada, contratação em breve", sem sair da tela | 13, RN-14 |
| Atividades: próximos passos, linha do tempo e 3 casos mock (data, motivo, situação), sem abrir protocolo | 14 |
| Recarregar a página: cada área mostra skeleton independente (header, árvore, ativos, atividades); NBO entra junto com a raiz, sem skeleton | 15 |
| Financial Accounts: selecionar 2º ativo sem fechar o 1º → 2 detalhes lado a lado em sub-abas; alternar foco; fechar por aba; 3º substitui o mais antigo | 16, RN-10 |
| PJ (`?doc=12ABC345000190`): Resumo/Inteligência/Metas/Atividades com estados vazios, sem erro; NBO discreto sem ofertas; clicar no nó João troca a raiz de volta | EL-01, EL-02 |
| Carlos (`?doc=99999999999`): NBO só banner + retry na 1ª carga do dia, sem exibir ofertas antigas; retry carrega 2 ofertas na hora | EL-03, RN-12 |
| Árvore completa indica "N de M vínculos" (limite 5/20 + paginação além disso) | EL-04, RN-13 |

Limitações conhecidas do mock (não são regra de negócio): upsert idempotente +
expiração de safra simulados em memória (sem Opportunity real); falha do core
só no consórcio do João na 1ª consulta (determinístico p/ demo); NBO fora do ar
só no Carlos na 1ª carga; árvore completa com 9/7 nós + contador de paginação
(sem dataset de 20+); troca de raiz limitada aos docs vinculados (João ↔
Indústria); fontes KYC/score/alerta seguem placeholder ([NEEDS CLARIFICATION]
nº 5 da spec).
