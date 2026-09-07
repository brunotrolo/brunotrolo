# Protótipo — `busca-cliente/001` (fonte única da jornada)

Esta pasta é a **fonte única** de todos os arquivos da jornada. Nada da jornada
vive no kit vendorizado (`.claude/skills/salesforce-ux/design-system-2-starter-kit/`)
fora de um overlay temporário de validação — ver `scripts/restore-prototype.mjs`.

## Estrutura (espelha `src/modules/` do kit)

| Esta pasta | Destino temporário no kit (só p/ validar) |
|---|---|
| `page/buscaCliente/` (shell orquestrador) | `src/modules/page/buscaCliente/` |
| `data/buscaCliente/` (fixtures + máscara/validação) | `src/modules/data/buscaCliente/` |
| `ui/buscaClienteSearchBar/` (P1) | `src/modules/ui/buscaClienteSearchBar/` |
| `ui/buscaClienteNboBanner/` (P6) | `src/modules/ui/buscaClienteNboBanner/` |
| `ui/buscaClienteHeaderSummary/` (P3) | `src/modules/ui/buscaClienteHeaderSummary/` |
| `ui/buscaClienteProductHub/` (P4/P7) | `src/modules/ui/buscaClienteProductHub/` |
| `ui/buscaClienteHoldingStrip/` (P5) | `src/modules/ui/buscaClienteHoldingStrip/` |
| `ui/cardDrawerModal/` (vias de cartão) | `src/modules/ui/cardDrawerModal/` |
| `ui/consorcioDrawerModal/` (cotas) | `src/modules/ui/consorcioDrawerModal/` |
| `ui/investimentoDrawerModal/` (posições) | `src/modules/ui/investimentoDrawerModal/` |

## Fiação temporária (aplicada pelo restore, revertida pelo clean)

Blocos legíveis por `scripts/restore-prototype.mjs` — não mude o formato
`// SECTION:` sem atualizar o script.

`src/routes.config.js` — acrescentar ao array `routes`:
```js
// SECTION: routes
  {
    path: '/',
    component: 'page-busca-cliente',
    title: 'Busca de Cliente',
    navPage: 'busca-cliente',
    navLabel: 'Busca de Cliente',
    app: 'busca-cliente',
  },
```

`src/apps.config.js` — acrescentar ao array `apps`:
```js
// SECTION: apps
  {
    id: 'busca-cliente',
    label: 'Busca de Cliente',
    variant: 'console',
    icon: 'standard:search',
    pathPrefix: '/busca-cliente',
    defaultPath: '/busca-cliente',
    pages: ['busca-cliente'],
  },
```

`src/modules/shell/app/app.js` — acrescentar após o import do NotFound:
```js
// SECTION: appjs-import
import BuscaCliente from 'page/buscaCliente';
```

E em `ROUTE_COMPONENTS`, após a linha do Builder:
```js
// SECTION: appjs-route
    'page-busca-cliente': BuscaCliente,
```

## Validar (overlay temporário, depois limpa)

```bash
cd .claude/skills/salesforce-ux/design-system-2-starter-kit
node scripts/restore-prototype.mjs busca-cliente/001-busca-identificacao-cliente-nbo-selecao-produto
npm run build
npm run open -- /busca-cliente   # ou abrir-prototipos.bat na raiz
node scripts/restore-prototype.mjs --clean busca-cliente/001-busca-identificacao-cliente-nbo-selecao-produto
```

Após o `--clean`, `git status` no kit deve voltar a ficar limpo de arquivos
da jornada — a prova de que o kit ficou intocado.

## Roteiro de navegação → cenários do spec (T-F03)

Documentos de teste: `123.456.789-00` (João, PF completo + NBO Black),
`12.ABC.345/0001-90` modo PJ (sem oferta), `111.111.111-11` (só Holding),
`000.000.000-00` (não encontrado), `999.999.999-99` (NBO indisponível),
`888.888.888-88` (erro total).

| Ação no protótipo | Cenário(s) |
|---|---|
| Topo: 4 modos centralizados; campo abaixo; botão "Localizar" abaixo do campo; valor inválido mantém desabilitado | 4 |
| Foco automático; Enter busca; F2 retorna o foco | 5 |
| Buscar João: skeletons por área → cartão enriquecido + NBO Black + aviso de gate (hub bloqueado) | 1, 6, 11, 21 |
| Clicar Abordar venda → faixa "Em abordagem" + hub liberado | 14 |
| Clicar Dispensar → confirmação + hub liberado (sem pular a decisão) | 15 |
| PJ sem oferta: hub libera direto, sem banner | 2, 3, 12 |
| Conta digital: seleção fixa contexto e encerra | 16 |
| Cartão: modal com 4 vias (titular Maria adicional, ativo/cancelado/bloqueado); Cancelar desfaz | 17–20 |
| Consórcio: modal com 6 cotas (2 no grupo Rural 9012) | 17–20 |
| Investimentos: modal com 5 posições (fixa, variável, CDB, fundos) | 17–20 |
| Hub vazio sem erro (Maria); holding com ícones, só leitura | 7, 9, 8, EL-12 |
| Não encontrado com doc preservado; parcial NBO sem bloquear; total com retry | 10, 22, EL-08/09 |

Limitações conhecidas do mock (não são regra de negócio): EL-03 sem volume de
10+ vias (fixture tem 4–6 itens por modal); Cenário 13 com 1 oferta (regra de
priorização em aberto); dispensa reseta em nova busca (janela de supressão em
aberto); modos Protocolo/Não cliente sem fontes específicas (retornam "não
localizado" fora dos fixtures).
