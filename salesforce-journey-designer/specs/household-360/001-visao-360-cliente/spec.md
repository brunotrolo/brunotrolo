# Spec — `household-360/001` — Visão 360° do cliente Porto Bank

| Campo | Valor |
|---|---|
| **Domínio** | `household-360` — Visão 360 do Household (ver `docs/sdd/DOMAINS.md`) |
| **Capacidade** | 001 — Painel consolidado de contas financeiras e holdings (visão 360° do cliente) |
| **Slug** | `001-visao-360-cliente` |
| **Status** | spec — especificada a partir de `visao360.md` (conversa de origem local, gitignored) |
| **BACKLOG** | Corresponde a `BACKLOG.md#household-360/001` ("Painel consolidado de contas financeiras e holdings do household") |
| **Conversa de origem** | `visao360.md` (raiz do projeto, local) — jornada desenhada com o negócio: layout 3 colunas, catálogo de 4 famílias, NBO com motor externo, ARC resumido + detalhe sob demanda, sem transacionais nesta entrega |

> **Caveats de fundação (gates):**
> - `_fundacao/001` (modelo de conta e segurança base) em **não iniciado** (gate rígido, Princípio I). A modelagem padrão FSC desta tela (conta individual vs. household/grupo, vínculos de titularidade e papéis) depende dela; o complemento técnico em `plan.md` §§11–17 foi elaborado exploratoriamente e só fecha após a fundação. Prosseguimento exploratório somente com autorização.
> - `_fundacao/002` (migração de dados) é dependência declarada no BACKLOG para esta capacidade.
> - `docs/design-system/SYSTEM-DESIGN.md` em **não iniciado** (gate leve, Princípio II).
> - Diretriz inegociável desta jornada (pedido explícito do negócio): **nada 100% customizado** — usar o máximo de recursos padrão do FSC (Princípios IV e VI). Customização só onde o padrão comprovadamente não alcança, com justificativa em `plan.md`.

---

## 1. Contexto

Na jornada de `busca-cliente/001`, o operador identifica o cliente (CPF/CNPJ), vê ofertas e fixa o contexto de interação (cliente + produto + via/cota/posição). A etapa seguinte é o atendimento propriamente dito — e para atender bem, o operador precisa enxergar o cliente inteiro numa única tela: quem ele é, o que possui no banco, o que lhe foi ofertado e o histórico de contatos anteriores.

O sistema legado não oferece essa visão consolidada: cada produto vive numa tela própria, sem contexto compartilhado, e o operador alterna entre sistemas para montar mentalmente o quadro do cliente — custo direto em tempo médio de atendimento (TMA).

Esta capacidade cria a **tela de Visão 360° do cliente**: página nova e 100% independente, aberta pelo clique no nome do cliente no cartão de identificação da busca, montada sobre o modelo de dados padrão (conta do cliente como raiz) e, por diretriz do negócio, composta ao máximo com recursos padrão da plataforma — destaques em 3 colunas, 6 subabas (Resumo, Inteligência, Financial Accounts, Financial Goals, Relacionamentos, Atividades), sidebar fixa de ofertas e tags, árvore em grupos, cartões de produto, gráficos analíticos e histórico em tabela — com todos os grafismos validados em protótipo responsivo.

## 2. Objetivo

Permitir que o operador, a partir do cliente já identificado, abra uma página independente com a visão consolidada do cliente Porto Bank — destaques cadastrais no topo em 3 colunas, seis subabas navegáveis à esquerda (Resumo, Inteligência, Financial Accounts, Financial Goals, Relacionamentos, Atividades) e sidebar fixa à direita (ofertas + tags) visível em todas as abas — carregando progressivamente sem travar a navegação, com dados voláteis (saldos, limites, faturas) consultados somente quando o ativo é selecionado e nunca gravados como se fossem cadastro.

**Sucesso =** operador entende quem é o cliente, o que ele tem, o que pode ofertar e o que já aconteceu — sem sair da tela, sem espera bloqueante e sem precisar decorar nada de outro sistema.

## 3. Escopo

### Dentro

- **Entrada:** clique no nome do cliente no cartão de identificação da busca abre a página 360° tendo como raiz a conta do cliente (o documento/contexto fixado na busca é a ponte entre as jornadas — via dado, nunca via componente compartilhado).
- **Topo (destaques 3 colunas):** tipo + nome + selos de segmento (ouro) e situação (verde); autenticação (telefone, e-mail, endereço, agência/conta); resumo do perfil (cliente desde, segmento, estado civil, rating, filhos, completude); responsável com avatar de iniciais + necessidades (segmento, etapa da jornada, canais preferidos). Alertas críticos (risco/fraude) aparecem quando houver.
- **Subabas navegáveis (6):** Resumo, Inteligência, Financial Accounts, Financial Goals, Relacionamentos e Atividades, em padrão de abas; a troca de raiz volta ao Resumo.
- **Sidebar fixa (todas as abas):** painel NBO + Tags de interesse sempre visíveis à direita, com estado único entre abas.
- **Aba Relacionamentos:** mapa em grupos lado a lado (família como grupo principal com membro principal + papéis; empresas/pessoas vinculadas), raiz no topo com fios, recolher/expandir por grupo, e ação para abrir a **árvore completa em modal** com painel de detalhes do nó selecionado.
- **Aba Financial Accounts:** faixa de totais + cartões de produto por família (abas Todos, Cartões, Conta, Consórcio, Investimentos), cada cartão com número, valor, encerramento, última movimentação e "Ver relatório"; ao selecionar, painel de detalhe com os dados voláteis daquele tipo (cartão: limites, fatura, vencimento, dia de compra; conta: saldo, chaves PIX; consórcio: saldo devedor, próxima assembleia; investimentos: valor aplicado, rentabilidade).
- **Aba Resumo:** KPIs (patrimônio household, AUM, wallet share, score/cadastro), eventos da vida em timeline, tags de interesse (busca/filtro/remoção local), saúde financeira (nota + evolução) e planejamento (régua de maturidade + recomendação).
- **Aba Financial Goals:** resumo financeiro + cartões de objetivo com donut de progresso, alvo/atual/data-alvo.
- **Aba Inteligência:** fluxo de entrada e saída (barras mensais), gastos por segmentação (pizza + legenda), comportamento digital (acordeão com sub-abas Site/Aplicativo, tabela com expansão por linha) e reação a campanhas (acordeão com ✓/✗/pendente por objetivo).
- **Aba Atividades:** próxima melhor ação (recomendações com CTA), próximos passos (baixa local), linha do tempo rica (filtros por tipo, expansão por cartão, paginação) e histórico de atendimentos em tabela (protocolo, categoria, canal, responsável, situação, satisfação, resolução).
- **Dados voláteis sob demanda com cache curto:** saldos, limites e faturas são consultados no core bancário somente quando o cartão é selecionado na aba Financial Accounts, com cache client-side curto (referência: 180 segundos) para não repetir chamadas pesadas no mesmo atendimento, botão de recarregar, e **nunca persistidos** como cadastro.
- **Fallback resiliente:** se a consulta ao core/motor falhar (timeout ou erro), a tela exibe banner amigável com botão "Tentar Novamente" e mantém os dados cadastrais básicos em modo de leitura reduzida — o operador nunca fica bloqueado em tela branca ou vazia.
- **Sidebar — NBO estático rico:** painel de ofertas **ordenado por prioridade, limitado às top 3**, sem spinner; cada card exibe produto, condição, barra de score, confiança, motivos "por que esta oferta" + modelo/safra/geração; **recusa em 1 clique** com motivo rápido (sem interesse / achou caro / já possui); **aceite direciona para a jornada de venda** (capacidades futuras).
- **Sincronização NBO com o motor externo:** as ofertas da safra vigente entram com a carga da raiz (sem spinner) e são gravadas como oportunidades em segundo plano, sem duplicar a mesma safra comercial (chave: `{CPF}_{COD}_{ANO_MES}`); vencidas → encerradas com motivo; ausentes mas válidas → mantidas.
- **Aba Atividades — histórico em tabela:** casos recentes em tabela de 9 colunas (protocolo, categoria, canal, responsável, situação, satisfação, resolução), somente leitura.
- **Extensibilidade:** nova família de produto ou novo item aparecem no inventário sem refatorar as demais áreas.

### Fora

- **Jornadas transacionais guiadas** (contestação, bloqueio/desbloqueio, alteração de limite, 2ª via, lance de consórcio etc.) — ficam para capacidades futuras; nesta entrega só a visão 360° + aceitar/recusar NBO (o aceite aponta para a futura jornada de venda do produto).
- **Abertura automática de protocolo/caso** nesta tela — deferrado pelo negócio: por enquanto, apenas a lista de casos relacionados à conta, sem aprofundar gestão de protocolo aqui.
- Cadastro ou edição manual de dados cadastrais, limites ou contratos nesta tela.
- Regras do motor de propensão (como a elegibilidade/score é calculado) — esta capacidade apenas **consulta, ordena, exibe e sincroniza** o resultado.
- Autenticação adicional (2FA/token/biometria) — viaja junto com as futuras jornadas transacionais, não com esta tela.

---

## 4. Cenários de aceite (Given/When/Then)

### 4.1 Entrada e topo

**Cenário 1 — Abertura pelo nome do cliente**
- **Dado** um operador com o contexto de interação fixado na busca (cliente identificado)
- **Quando** clica no nome do cliente no cartão de identificação
- **Então** o sistema abre a página 360° tendo aquele cliente como raiz, sem exigir nova digitação e sem perder o contexto já fixado

**Cenário 2 — Destaques em 3 colunas**
- **Dado** a página 360° aberta para um cliente
- **Quando** ela carrega
- **Então** o topo exibe tipo + nome + selos ouro/verde, autenticação (telefone, e-mail, endereço, agência/conta), resumo do perfil (cliente desde, segmento, estado civil, rating, filhos, completude) e responsável/necessidades com avatar e canais; alertas críticos quando houver, caso contrário sem banner

### 4.2 Perfil e relacionamentos (topo + aba Relacionamentos)

**Cenário 3 — Cabeçalho cadastral completo**
- **Dado** a página aberta
- **Quando** ela carrega
- **Então** as 3 colunas mostram todos os dados cadastrais distribuídos sem card separado, de forma responsiva

**Cenário 4 — Mapa em grupos sempre visível**
- **Dado** a aba Relacionamentos aberta
- **Quando** ela carrega
- **Então** exibe os vínculos em grupos lado a lado (família como grupo principal + empresas vinculadas) com fios e stubs, sem ocupar a tela toda

**Cenário 5 — Árvore completa sob demanda**
- **Dado** o mapa em grupos visível
- **Quando** o operador aciona "Ver árvore completa"
- **Então** o sistema abre um modal em tela cheia com a árvore multinível (empresas coligadas, sócios, cônjuge, dependentes) e painel lateral de detalhes do nó selecionado, sem sair do atendimento

### 4.3 Financial Accounts — inventário e detalhe

**Cenário 6 — Abas por família de produto**
- **Dado** a aba Financial Accounts aberta
- **Quando** o operador alterna entre Todos, Cartões, Conta, Consórcio e Investimentos
- **Então** a faixa Resumo (totais) permanece e os cartões filtram pelos ativos daquela família, mantendo a seleção atual quando o item pertence ao filtro

**Cenário 7 — Cartões com selo funcional**
- **Dado** um cliente com vínculos ativos e encerrados
- **Quando** o inventário é exibido
- **Então** cada cartão mostra identificador mascarado (ex.: final do cartão, grupo/cota, agência/conta) e selo de situação em texto (badge), com número/valor/encerramento/última movimentação e "Ver relatório" para abrir o detalhe

**Cenário 8 — Detalhe volátil sob demanda com cache curto**
- **Dado** o inventário carregado
- **Quando** o operador seleciona um ativo
- **Então** o painel de detalhe busca os dados voláteis daquele tipo (limites/fatura, saldo/PIX, saldo devedor/assembleia, valor/rentabilidade) e os exibe sem recarregar a página; ao reselecionar o mesmo ativo em curto intervalo, o retorno é imediato (cache), com botão de recarregar para forçar nova consulta

**Cenário 9 — Falha no core não bloqueia o operador**
- **Dado** o operador selecionando um ativo
- **Quando** a consulta ao core bancário falha (timeout ou erro)
- **Então** o painel exibe banner amigável com botão "Tentar Novamente" e mantém os dados cadastrais do ativo em leitura reduzida; o restante da tela continua navegável

### 4.4 Sidebar — NBO e Atividades

**Cenário 10 — Top 3 ofertas por prioridade (sidebar estática)**
- **Dado** um cliente com ofertas elegíveis retornadas pelo motor
- **Quando** a sidebar em qualquer aba carrega
- **Então** exibe até 3 ofertas ordenadas por prioridade, cada card com produto, condição, barra de score, confiança e motivos "por que esta oferta" + faixa modelo/safra/geração; sem ofertas, informa discretamente sem erro

**Cenário 11 — Sincronização sem duplicar safra**
- **Dado** o motor retornando ofertas na abertura da tela
- **Quando** a sincronização em segundo plano executa
- **Então** cada oferta vira/atualiza uma única oportunidade pela chave de idempotência (documento + código + período); a mesma safra nunca duplica; ofertas vencidas passam a encerradas com motivo de expiração; ofertas ausentes na resposta mas ainda válidas são mantidas

**Cenário 12 — Recusa em 1 clique com motivo**
- **Dado** um card de oferta exibido
- **Quando** o operador recusa escolhendo um motivo rápido (ex.: sem interesse, achou caro, já possui)
- **Então** o card some imediatamente da tela e a recusa é registrada em segundo plano sem travar a navegação

**Cenário 13 — Aceite direciona à jornada de venda**
- **Dado** um card de oferta exibido
- **Quando** o operador aceita (Contratar)
- **Então** a oferta é marcada em negociação e o fluxo segue para a jornada de venda guiada específica daquele produto (capacidade futura), levando o contexto da oferta; esta tela não efetiva a contratação

**Cenário 14 — Histórico em tabela (base)**
- **Dado** a aba Atividades aberta
- **Quando** o histórico carrega
- **Então** lista os casos recentes da conta em tabela (protocolo, categoria, canal, responsável, situação, satisfação, resolução), somente leitura, sem abrir protocolo novo — a versão completa tem 9 colunas (cenário 26)

### 4.5 Performance e resiliência

**Cenário 15 — Carregamento progressivo por área**
- **Dado** a página sendo aberta
- **Quando** as fontes respondem em tempos distintos
- **Então** cada área (perfil, inventário, detalhe, NBO, histórico) carrega de forma independente com indicação sutil, sem travar as demais

### 4.6 Multitarefa

**Cenário 16 — Detalhes de ativos em paralelo**
- **Dado** o operador com um ativo em detalhe
- **Quando** seleciona outro ativo sem fechar o atual
- **Então** o sistema mantém ambos os detalhes abertos em paralelo (sub-abas), permitindo alternar entre eles sem recarregar nem perder o contexto de cada um

### 4.7 Navegação e sidebar (evolução validada no protótipo)

**Cenário 17 — Subabas e sidebar fixa**
- **Dado** a página 360° aberta
- **Quando** o operador navega entre Resumo, Inteligência, Financial Accounts, Financial Goals, Relacionamentos e Atividades
- **Então** cada aba mostra seu conteúdo à esquerda enquanto NBO e Tags seguem fixos à direita com o mesmo estado; trocar a raiz pela árvore volta ao Resumo

**Cenário 18 — Cabeçalho cadastral em 3 colunas**
- **Dado** a página aberta para um cliente
- **Quando** ela carrega
- **Então** o topo exibe tipo + nome + selos de segmento e situação, autenticação, resumo do perfil e responsável/necessidades, sem alerta quando não houver pendência

**Cenário 19 — Resumo rico**
- **Dado** a aba Resumo
- **Quando** ela carrega
- **Então** exibe KPIs, eventos da vida (com ordem e filtro de ano), tags (com busca/filtro/remoção local), saúde financeira e planejamento

**Cenário 20 — Financial Accounts em cartões**
- **Dado** a aba Financial Accounts
- **Quando** o operador alterna as abas por família
- **Então** cada produto aparece em cartão com número, valor, encerramento e última movimentação; "Ver relatório" abre o detalhe volátil abaixo

**Cenário 21 — Financial Goals com donut**
- **Dado** a aba Financial Goals
- **Quando** ela carrega
- **Então** cada objetivo mostra alvo/atual/data-alvo e donut de progresso, com chevron que recolhe o cartão

**Cenário 22 — Inteligência analítica**
- **Dado** a aba Inteligência
- **Quando** ela carrega
- **Então** exibe fluxo de entrada e saída lado a lado com gastos por segmentação, comportamento digital em acordeão (Site/Aplicativo, expansão por linha, ver tudo) e campanhas em acordeão

**Cenário 23 — NBA e próximos passos**
- **Dado** a aba Atividades
- **Quando** ela carrega
- **Então** a próxima melhor ação traz recomendações com CTA (marca iniciada, sem persistir) e os próximos passos permitem baixa local

**Cenário 24 — Timeline rica**
- **Dado** a aba Atividades
- **Quando** o operador filtra por tipo, expande um cartão ou aciona ver mais
- **Então** a linha do tempo mostra hora, duração, canal e protocolo por interação, paginando o restante

**Cenário 25 — NBO estático com detalhes do motor**
- **Dado** a sidebar em qualquer aba
- **Quando** a página abre (ou a raiz troca)
- **Então** as ofertas entram junto, sem spinner, com modelo/safra/geração, barra de score, confiança e motivos ("por que esta oferta"); no Carlos, a 1ª carga mostra só banner + retry

**Cenário 26 — Histórico em tabela**
- **Dado** a aba Atividades
- **Quando** o histórico carrega
- **Então** os atendimentos aparecem em tabela com protocolo, categoria, canal, responsável, situação, satisfação e resolução

**Cenário 27 — Mapa em grupos**
- **Dado** a aba Relacionamentos
- **Quando** ela carrega
- **Então** a família surge como grupo principal (membro principal + papéis) ao lado de empresas vinculadas, com fios, recolher/expandir por grupo e criação de grupo/vínculo desabilitada (futura)

**Cenário 28 — Responsividade com sidebar**
- **Dado** viewport estreito (mobile)
- **Quando** a página renderiza
- **Então** conteúdo e sidebar empilham; KPIs, grupos, grades e tabelas (com rolagem própria) se adaptam sem corte

---

## 5. Regras de negócio

| # | Regra | Descrição em linguagem de negócio |
|---|---|---|
| RN-01 | Padrão FSC primeiro, custom só com justificativa | Cada bloco da tela usa o recurso padrão que o cobre (painel de destaques, árvore de relacionamentos, listas, abas); código custom existe só onde o padrão comprovadamente não alcança. Vale para esta capacidade e para as futuras que nascerem dela. |
| RN-02 | Entrada pelo contexto da busca | A página abre a partir do cliente já identificado (documento + contexto fixado); nunca pede redigitação. A única ponte entre as jornadas é dado, nunca componente compartilhado. |
| RN-03 | Catálogo de 4 famílias, ativos e inativos | Cartão de Crédito, Conta Digital, Consórcio e Investimentos; itens ativos e encerrados/bloqueados aparecem listados, distinguíveis pelo selo. Nova família entra sem refatorar as demais. |
| RN-04 | Mestres persistem, voláteis não | Cadastro, inventário, casos e oportunidades persistem e sincronizam em segundo plano; saldos, limites, faturas e extratos vivem só em memória/caches curtos e nunca são gravados como cadastro. |
| RN-05 | NBO top 3 com recusa rápida e aceite guiado | Ofertas ordenadas por prioridade, no máximo 3 visíveis; recusa é 1 clique com motivo e some na hora; aceite marca negociação e direciona à jornada de venda do produto (futura). |
| RN-06 | Idempotência e ciclo de vida da safra | Mesma safra comercial nunca duplica oportunidade (chave documento + código + período); vencida vira encerrada com motivo de expiração; ausente na resposta mas válida é mantida. |
| RN-07 | Falha parcial nunca bloqueia | Qualquer fonte indisponível vira banner com retry + leitura reduzida; o resto da tela segue navegável. |
| RN-08 | Relacionamentos resumidos sempre, detalhe sob demanda | 1º nível visível na lateral; árvore completa só em modal com painel de detalhes do nó. |
| RN-09 | Protocolo/caso deferrado | Nesta entrega a tela só lista casos da conta; abertura e gestão de protocolo ficam para capacidade futura. |
| RN-10 | Sub-abas paralelas na v1 | O operador pode manter detalhes de mais de um ativo abertos em paralelo e alternar entre eles sem recarregar. |
| RN-11 | Troca de raiz pela árvore | Com PF+PJ vinculadas, clicar no nó da empresa/pessoa na árvore troca a raiz da 360° sem voltar à busca. |
| RN-12 | Sem último estado com motor fora | Motor NBO indisponível mostra somente banner com retry; nunca exibe ofertas gravadas como se fossem atuais. |
| RN-13 | Limites da árvore | Resumida: até 5 nós; completa: até 20 nós com paginação além disso. |
| RN-14 | Aceite sem jornada pronta | Marca negociação e exibe "Oferta reservada, contratação em breve", mantendo o operador na tela. |
| RN-15 | Chaves PIX mascaradas | Todas as chaves vinculadas são exibidas com mascaramento parcial. |
| RN-16 | Sidebar global com estado único | NBO e Tags aparecem em todas as subabas; recusar/contratar ou remover tag em qualquer aba reflete nas demais. |
| RN-17 | NBO estático de safra | Ofertas entram com a raiz, sem spinner; erro só na 1ª carga do dia (Carlos) com retry que carrega na hora; nunca exibe último estado como atual. |
| RN-18 | Mock rico não é regra de cálculo | Gráficos, scores de wellness, motivos de propensão e fixtures ilustram o desenho; fórmulas e fontes reais ficam para fundação/integrações. |
| RN-19 | Criação desabilitada é futuro explícito | Adicionar grupo/vínculo, novo evento, explorar tags, editar mapa e ver relatório completo aparecem desabilitados com aviso — sem prometer transação. |

---

## 6. Casos limite e edge cases

| # | Situação | Comportamento esperado |
|---|---|---|
| EL-01 | Cliente sem nenhum ativo em alguma família | Aba da família informa ausência sem erro; demais abas normais. |
| EL-02 | Cliente sem ofertas elegíveis | Painel NBO informa discretamente; restante da tela normal. |
| EL-03 | Motor NBO fora do ar na abertura | Somente banner com retry — sem exibir último estado conhecido (decisão do negócio). |
| EL-04 | Household/grupo muito denso (dezenas de membros) | Árvore resumida limitada a 5 nós; completa limitada a 20 nós, com paginação além disso. |
| EL-05 | Múltiplas contas do mesmo titular (PF + PJ vinculadas) | A página abre no contexto do documento buscado; clicar num nó PJ/empresa na árvore troca a raiz sem voltar à busca, sem misturar inventários. |
| EL-06 | Oferta aceita mas jornada de venda do produto ainda não existe | Aceite marca negociação e exibe aviso "Oferta reservada, contratação em breve", mantendo o operador na 360°. |
| EL-07 | Dados voláteis divergem do último consolidado | Vale o dado em tempo real com indicação de horário da consulta; sem sobrescrever cadastro silenciosamente. |
| EL-08 | Raiz sem dados ricos | Abas novas (Resumo rico, Inteligência analítica, Metas, Atividades) mostram estados vazios discretos, sem erro; NBO e casos seguem as regras EL-02/EL-03. |
| EL-09 | Busca/filtro sem resultado | Tags, anos e tipos sem item mostram mensagem discreta e mantêm o restante navegável. |

---

## 7. Dados envolvidos (em termos de negócio, não técnicos)

| Dado | Descrição | Origem | Uso nesta jornada |
|---|---|---|---|
| Cliente raiz | Pessoa ou empresa identificada na busca (documento + contexto) | `busca-cliente/001` (entrada) | Raiz da página e de todas as consultas |
| Destaques e alertas | Nome, documento mascarado, segmento, saldo consolidado, alertas de risco/fraude, situação cadastral/score | Cadastro corporativo + motores de risco | Topo da página |
| Perfil e contatos | Contatos, telefones, e-mail, endereço, vínculos de 1º nível com papéis | Cadastro corporativo | Coluna esquerda + árvore |
| Carteira por família | Lista de vínculos ativos e inativos por Cartão/Conta/Consórcio/Investimentos, com situação | Base de produtos | Inventário central com abas |
| Detalhe volátil por ativo | Limites, fatura, saldo, PIX, assembleia, rentabilidade — conforme o tipo | Core bancário sob demanda | Painel de detalhe; nunca persistido |
| Ofertas elegíveis | Produto, condição, score/prioridade, validade, motivo de elegibilidade | Motor de propensão + oportunidades gravadas | Painel NBO top 3; recusa/aceite |
| Detalhe do motor | Modelo, safra, geração, confiança e motivos por oferta | Motor de propensão (safra vigente) | Faixa do motor + "por que esta oferta" |
| Resumo do cliente | KPIs, eventos da vida, tags, wellness, planejamento | Cadastro + comportamento + motores | Aba Resumo |
| Inteligência analítica | Fluxo mensal, segmentação de gastos, acessos site/app, campanhas | Core transacional + marketing digital | Aba Inteligência |
| Metas e atividades | Objetivos com progresso; tarefas, interações e NBA | Planejamento + atendimento | Abas Financial Goals e Atividades |
| Histórico de atendimentos | Casos recentes da conta (protocolo, categoria, canal, responsável, situação, satisfação, resolução) | Base de atendimento | Tabela somente leitura |
| Contexto de saída (aceite) | Oferta marcada em negociação + dados para a jornada de venda | Gerado nesta jornada | Entrada das futuras jornadas de venda por produto |

> Nenhum nome de objeto, campo ou componente técnico é mencionado aqui. O mapeamento para cadastros, ativos, ofertas e protocolos específicos ocorre em `plan.md` e na fundação.

---

## 8. Dependências

| Dependência | Tipo | Situação | Impacto nesta spec |
|---|---|---|---|
| `_fundacao/001` — Modelo de conta e segurança base | Fundação (gate rígido) | **Não iniciado** | Decide conta individual vs. household/grupo, titularidades e papéis — pré-requisito do `plan.md` técnico. Exploração de UX permitida; técnico só após a fundação. |
| `_fundacao/002` — Migração de dados | Fundação | **Não iniciado** | Base consolidada que esta tela lê (dependência declarada no BACKLOG). |
| `busca-cliente/001` — contexto fixado (local, gitignored) | Domínio produtor | Protótipo validado | Entrada: documento + produto/via/cota/posição; gatilho: clique no nome. Via dado, nunca via componente. **Dependência reversa a registrar:** o cartão da busca precisará tornar o nome clicável navegando para cá. |
| `docs/design-system/SYSTEM-DESIGN.md` | Fundação visual (gate leve) | **Não iniciado** | Defaults SLDS2 verificados até ratificação. |
| Motor de propensão (NBO) + core bancário | Integração | Mapeadas em `plan.md` §14 (I01–I04, exploratório) | Contratos de sincronização de ofertas e consulta volátil em `plan.md`. |
| Futuras jornadas de venda por produto | Domínios consumidores | Não iniciadas | Recebem o aceite com contexto; não são pré-requisito. |

---

## 9. Perguntas em aberto — [NEEDS CLARIFICATION]

Respondidas pelo negócio em 2026-09-06 (registradas em RN-10–RN-15, EL-03–EL-06 e Cenário 16):

1. [RESOLVIDO: só banner + retry — sem último estado conhecido.]
2. [RESOLVIDO: 5 nós na resumida, 20 na completa com paginação.]
3. [RESOLVIDO: sim, clicando no nó PJ/empresa na árvore, sem voltar à busca.]
4. [RESOLVIDO: aviso "Oferta reservada, contratação em breve", mantém na tela.]
5. [NEEDS CLARIFICATION: fontes de KYC/score/alerta de fraude — quais campos e critérios disparam cada alerta do topo? Fica para a fundação/compliance, com placeholder genérico no desenho.]
6. [RESOLVIDO: todas vinculadas, com mascaramento parcial.]
7. [RESOLVIDO: sub-abas paralelas já na v1.]

---

## 10. Notas para as próximas fases (não são requisitos, apenas rastreabilidade)

- Insumos técnicos vindos da conversa (registrar e justificar em `plan.md` sob Princípios IV/V/VI — a conversa é insumo, não decisão de spec): preferência por componentes padrão (destaques, árvore de relacionamentos, listas com abas, lista de casos); Apex somente na orquestração/integração (sem procedimentos empacotados); sincronização NBO com upsert idempotente + Queueable; cache client-side curto para voláteis; Named Credentials + gateway corporativo como referência de segurança; chave de idempotência `{documento}_{código}_{período}`; expiração com motivo; recusa com motivo rápido.
- Quando as respostas do §9 chegarem: `fsc-journey-spec-writer` fecha cenários/regras → `fsc-journey-ux-designer` desenha telas (padrão primeiro) → `fsc-html-prototyper` constrói `prototype/` → `fsc-journey-tech-planner` detalha `plan.md` técnico/`tasks.md`/`architecture.md` (após `_fundacao/001`).
- Dependência reversa a não esquecer: tornar o nome do cliente clicável no cartão da `busca-cliente/001` (P3) apontando para esta página.

---

*Fim de `spec.md` — `household-360/001` (especificada a partir de `visao360.md`, 2026-09-06; revisada 2026-09-07 — 28 cenários, 19 RNs, 9 ELs validados em protótipo)*
