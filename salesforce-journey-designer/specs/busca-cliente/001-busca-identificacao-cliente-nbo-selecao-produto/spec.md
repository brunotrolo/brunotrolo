# Spec — `busca-cliente/001` — Busca e identificação de cliente com consulta de ofertas (NBO) e seleção de contexto de atendimento

| Campo | Valor |
|---|---|
| **Domínio** | `busca-cliente` — Busca de Cliente (ver `docs/sdd/DOMAINS.md`) |
| **Capacidade** | 001 — Busca e identificação de cliente com NBO e seleção de produto |
| **Slug** | `001-busca-identificacao-cliente-nbo-selecao-produto` |
| **Status** | spec — revisada integralmente a partir da conversa de origem (revisão 2026-09-06) |
| **Supersede** | Sobrescreve e amplia `BACKLOG.md#busca-cliente/001` ("Busca rápida por CPF/conta/telefone") — o escopo original era apenas a busca; esta capacidade única cobre a jornada completa narrada pelo solicitante: entrada por documento, consulta de elegibilidade a ofertas, consulta cadastral corporativa e seleção (primária + sub-seleção condicional) do contexto de atendimento. Busca por conta, telefone ou nome **não** faz parte desta capacidade (ver Fora). |
| **Conversa de origem** | `ConversaGoogleGemini.md` (linhas 1–1091, conversa integral) — considerada pelo solicitante como referência completa para esta jornada. Decisões tomadas ao longo da conversa estão consolidadas na §5 (regras) e na §10 (insumos de arquitetura para as próximas fases); o que foi perguntado e **não** respondido está na §9 como [NEEDS CLARIFICATION]. |

> **Caveats de fundação (gates) — situação real em 2026-09-06:**
> - `docs/design-system/SYSTEM-DESIGN.md` está em **não iniciado** (gate leve, constituição Princípio II). O desenho visual desta capacidade ainda não pode ser validado contra tokens/componentes ratificados — inconsistência sinalizada, não bloqueante. O futuro `prototype/` usará defaults SLDS2 verificados e sinalizará a divergência em `plan.md`.
> - A fundação de dados e segurança (`BACKLOG.md#_fundacao/001` — modelo de conta e segurança base) está em **não iniciado** (gate rígido, constituição Princípio I). O solicitante autorizou prosseguir **exploratoriamente** nesta spec; `plan.md` técnico não deve ser fechado antes da fundação ser resolvida. As decisões de negócio sobre dados já tomadas na conversa (mesmo padrão de cadastro conta+contato para PF e PJ, ofertas como oportunidades, contratos/cartões como ativos, sem estruturas customizadas — ver RN-16 e §10) são insumo registrado, não especificação técnica.
> - `docs/sdd/constitution.md` contém `[NEEDS CLARIFICATION]` sobre modelo de conta, licenciamento e compliance. Para esta capacidade, a conversa **resolve** em linguagem de negócio: cadastro de cliente PF/PJ unificado, ofertas como "oportunidades de venda", contratos/cartões como "vínculos de produto" — detalhes técnicos (objetos/campos) ficam para `plan.md` e para a fundação.

---

## 1. Contexto

Operadores do Porto Bank atendem produtos financeiros (cartão de crédito, conta digital, consórcio, investimentos) a partir de um console de atendimento. O sistema legado foi construído há cerca de cinco ou seis anos sob a ótica da área de negócio, sem a condução de consultoria ou especialista em atendimento: existem débitos técnicos e problemas de arquitetura da solução, da arquitetura funcional à técnica. Qualquer ajuste pequeno exige mexer em partes de grande impacto, porque as soluções foram criadas como **monolitos** — um único código orquestra todas as informações da jornada.

Na jornada de busca, o legado já funciona como uma cadeia de requisições, mas com dois vícios estruturais: (a) **gatilhos e processos síncronos** disparam atualizações em cadeia a cada busca, travando a interface antes mesmo de o operador iniciar o atendimento real; (b) a chamada de ofertas e as consultas cadastrais concorrem de forma bloqueante, prendendo a tela.

O projeto **reconstrói** o atendimento em novo ambiente Salesforce (saída do modelo Service Cloud legado para o modelo Financial Services Cloud), aproveitando o que funcionou e respeitando a arquitetura do sistema atual onde aplicável, mas redesenhado: **mantidas as mesmas fontes corporativas de dados (mesmas interfaces de integração)**, com **fluxos de integração totalmente redesenhados** para otimização, performance e melhor sustentação. Os direcionadores inegociáveis são **desacoplamento por etapa** (ajustar a etapa de ofertas ou adicionar um produto novo não pode exigir retrabalho nas etapas sem conexão com a mudança), **uso máximo de artefatos padrão** e **performance percebida mínima** — cada segundo de espera e cada clique adicional têm custo operacional direto no tempo médio de atendimento.

Esta spec descreve **uma única jornada contínua** — confirmada pelo solicitante como unidade indivisível — composta por: informar documento do cliente → verificar elegibilidade a ofertas de venda consultiva (NBO) → exibir cadastro e carteira completa → escolher o produto motivador do contato → quando aplicável, escolher a via específica do produto.

---

## 2. Objetivo

Permitir que o operador, a partir de uma chave de busca (documento CPF/CNPJ — incluindo CNPJ alfanumérico no padrão BACEN —, número de protocolo ou documento de não cliente, conforme o modo selecionado), identifique o cliente, visualize imediatamente se há oferta elegível para abordagem comercial **antes** de tratar a demanda original, conheça o cadastro e todos os vínculos de produto do cliente na empresa (com foco transacional no Porto Bank e visibilidade informativa da Holding Porto Seguro), e selecione com precisão o contexto (produto e, quando aplicável, o item específico — via de cartão, cota de consórcio ou posição de investimento) que motivou o contato — de forma progressiva, sem bloquear a navegação, e com tempo de resposta compatível com operação bancária de alto volume.

**Sucesso =** operador identifica o cliente correto, enxerga oferta quando houver sem ter que buscá-la, aborda a venda antes da demanda original quando houver oferta (diretriz operacional), e fixa o contexto de atendimento em no máximo dois gestos de seleção, com cada etapa carregando de forma independente e sem travar as demais.

---

## 3. Escopo

### Dentro

- Entrada por modo de busca selecionado no topo da tela: **PF** (CPF, 11 dígitos), **PJ** (CNPJ numérico de 14 dígitos ou alfanumérico no padrão BACEN), **Protocolo** (número de atendimento existente, mínimo 5 caracteres) ou **Não cliente** (documento para iniciar atendimento sem cadastro, sem validação de formato). A máscara dinâmica durante a digitação aplica-se somente aos modos PF/PJ; protocolo e não-cliente usam o valor digitado sem formatação.
- Validação local de formato/máscara nos modos PF/PJ (incluindo dígito verificador quando aplicável) antes de acionar as buscas corporativas — valor em formato inválido não dispara nenhuma consulta externa.
- Consulta de elegibilidade a ofertas de venda consultiva (NBO / "próxima melhor oferta") — verificação se o cliente é elegível a produtos que ainda não possui (ex.: sem cartão elegível a cartão, sem consórcio, sem conta digital).
- Consulta cadastral corporativa: dados demográficos (nome completo/razão social, endereço, data de nascimento/fundação e equivalentes) + carteira completa de vínculos do cliente em **toda a empresa** (Porto Bank + Holding/Porto Seguro: seguro residencial, seguro automóvel, plano de saúde, plano odontológico, entre outros serviços do ecossistema).
- Apresentação do resultado em camadas:
  - Faixa de identificação rápida do cliente.
  - Banner/área destacada de oferta (quando houver), com ações de abordagem comercial ou dispensa.
  - Grade/Hub de produtos **Porto Bank** com contratos ativos (cartão de crédito, conta digital, consórcio, investimentos) para seleção primária.
  - Visibilidade informativa dos vínculos da Holding, sem ação transacional.
- Seleção primária do produto Porto Bank motivador do contato.
- Sub-seleção condicional em painel complementar (modal): para **cartão de crédito**, o histórico de vias/plásticos (ativos, cancelados, bloqueados, titular e adicionais) para escolha da via específica; para **consórcio**, as cotas do cliente (Imóvel, Veículo e Rural — podendo haver mais de uma cota no mesmo grupo) para escolha da cota específica, com valor, contemplação, parcela e situação; para **investimentos**, as posições da carteira (renda fixa, renda variável, CDB e fundos) para escolha da posição específica, com valor, rentabilidade, vencimento/liquidez e risco. Apenas **conta digital** encerra a identificação já na seleção primária.
- Gate da oferta sobre o hub: quando há oferta elegível exibida, a grade de produtos só é liberada após o operador decidir a oferta (**Abordar venda** ou **Dispensar**) — a decisão é o segundo gesto da jornada e não pode ser pulada. Sem oferta elegível (ou com ofertas indisponíveis), o hub libera direto.
- Ciclo de vida da oferta nesta jornada: oferta nasce **identificada**, ao ser abordada passa a **em abordagem** (e o fluxo segue para a jornada de venda/prospecção correspondente, preservando o contexto), ao ser dispensada passa a **dispensada/encerrada** para aquela interação, sem reexibição insistente e sem bloquear o atendimento.
- Definição do "contexto de interação" (cliente + produto selecionado + item específico — via, cota ou posição — quando aplicável) como saída desta jornada para as etapas seguintes de atendimento.
- Atualização progressiva do cadastro e dos vínculos exibidos sem travar a interface: o que o operador vê em tela reflete imediatamente o retorno das fontes corporativas, a consolidação para a visão 360° ocorre em segundo plano sem reter a navegação, e **apenas o contrato/via efetivamente selecionado** é consolidado no momento da seleção (não a carteira inteira de uma vez). Buscas simultâneas do mesmo documento por operadores distintos não podem duplicar registros (idempotência pela chave unívoca do documento).
- Requisitos de extensibilidade e independência: adicionar um novo produto ao hub (ex.: financiamento de veículos) ou alterar a regra de ofertas não deve exigir retrabalho nas etapas não relacionadas.
- Tratamento de estados de carregamento progressivo (cada área com indicação própria, sem spinner de tela cheia), ausência de resultado e falhas parciais de fontes externas.

### Fora

- Validação de identidade / perguntas de segurança / autenticação forte antes de exibir dados sensíveis. Foi perguntado na conversa e **não respondido** — ver [NEEDS CLARIFICATION 17]. Não narrado como parte desta etapa.
- O que acontece imediatamente após a fixação do contexto (abrir tela 360° do produto, abrir formulário de protocolo, iniciar jornada guiada). Foi perguntado na conversa e **não respondido** — ver [NEEDS CLARIFICATION 18]. A abertura formal do protocolo/caso, triagem, roteamento ou resolução consome o contexto fixado aqui, mas pertence a domínio subsequente (`atendimento`).
- Elementos de chrome do console (status de disponibilidade de voz/chat, tempo de sessão, abas de espaço de trabalho, indicador de protocolo aguardando identificação): são moldura padrão do console, não comportamento desta capacidade.
- Jornadas transacionais guiadas após a seleção (contestação, cancelamento, alteração de limite, contratação) — pertencerão a capacidades seguintes (tecnologia a decidir em `plan.md`, fora do escopo desta spec).
- Regras de motor de recomendação de ofertas (como a elegibilidade é calculada) — esta capacidade apenas **consulta e apresenta** o resultado.
- Gestão de ofertas após a abordagem (negociação, contratação, perda) — além do registro do aceite/dispensa imediato com o ciclo de vida descrito em Dentro.
- Cadastro ou edição manual de dados cadastrais pelo operador nesta tela.
- Busca por outros critérios (conta, telefone, nome) — os modos desta capacidade são PF, PJ, Protocolo e Não cliente. Conta/telefone/nome permanecem como capacidades futuras se confirmados pelo negócio (ex.: `busca-cliente/002`). O retorno das fontes para os modos Protocolo e Não cliente ainda não está especificado além do comportamento observável no protótipo (busca executada; sem cadastro correspondente, informa "não localizado").
- Definição de modelo de dados, objetos, campos ou tecnologia de front/back-end — pertence a `plan.md` e à fundação (ver RN-16 e §10 como insumos já decididos na conversa).

---

## 4. Cenários de aceite (Given/When/Then)

Cada cenário é independentemente testável. Termos de negócio são usados propositalmente (cadastro, contrato, oferta, via, cota, posição, etc.).

### 4.1 Entrada e validação do documento

**Cenário 1 — Busca por CPF de pessoa física**
- **Dado** um operador na tela inicial de identificação, sem cliente carregado
- **Quando** informa um CPF válido com 11 dígitos (com ou sem máscara `000.000.000-00`) e confirma a busca (botão ou tecla Enter)
- **Então** o sistema aciona as consultas corporativas para aquele CPF e apresenta o resultado em até poucos segundos, sem exigir novo preenchimento

**Cenário 2 — Busca por CNPJ numérico de pessoa jurídica**
- **Dado** um operador na tela inicial
- **Quando** informa um CNPJ numérico válido com 14 dígitos (com ou sem máscara) e confirma
- **Então** o sistema identifica a empresa correspondente e exibe seus dados e carteira como no Cenário 1, indicando tratar-se de pessoa jurídica

**Cenário 3 — Busca por CNPJ alfanumérico (padrão BACEN)**
- **Dado** um operador na tela inicial
- **Quando** informa um CNPJ alfanumérico válido no padrão BACEN (letras e dígitos, 14 posições) e confirma
- **Então** o sistema o reconhece como documento válido de pessoa jurídica e retorna o mesmo conjunto de informações do Cenário 2

**Cenário 4 — Seletor de modo e validação local impedem busca inválida**
- **Dado** um operador na tela inicial, com as opções PF, PJ, Protocolo e Não cliente centralizadas no topo
- **Quando** seleciona o modo e digita o valor abaixo
- **Então** nos modos PF/PJ a máscara é aplicada dinamicamente durante a digitação (CPF `000.000.000-00`, CNPJ `00.000.000/0000-00` ou equivalente alfanumérico), sem alterar o valor lógico buscado; nos modos Protocolo e Não cliente o valor é usado sem formatação
- **E** enquanto o conteúdo não atinge o formato válido de cada modo (ex.: CPF com 10 dígitos, CNPJ com 13, alfanumérico fora do padrão, dígito verificador inválido, protocolo com menos de 5 caracteres, não-cliente vazio), o sistema mantém a ação "Localizar" desabilitada, não aciona nenhuma consulta externa e orienta que o formato é inválido

**Cenário 5 — Foco e atalhos de eficiência**
- **Dado** a tela inicial carregada
- **Quando** ela se apresenta ao operador
- **Então** o cursor já está posicionado no campo de documento (foco automático), a tecla Enter dispara a busca quando o formato é válido sem exigir clique adicional, e a tecla F2 retorna o foco ao campo de busca a partir de qualquer ponto da jornada de identificação

### 4.2 Consultas corporativas e exibição do resultado

**Cenário 6 — Exibição de dados cadastrais após busca bem-sucedida**
- **Dado** um documento válido informado
- **Quando** as consultas retornam com sucesso
- **Então** o sistema exibe um cartão de identificação com: nome completo ou razão social, tipo de pessoa (PF/PJ), documento formatado, faixa/segmento de relacionamento e situação do cadastro — além dos blocos de contato (e-mail, telefone/celular, nascimento), endereço completo com CEP, renda presumida com score de risco, e agência/conta com tempo de relacionamento, quando disponíveis

**Cenário 7 — Exibição da carteira Porto Bank em grade de produtos**
- **Dado** um cliente localizado com vínculos ativos no Porto Bank
- **Quando** o resultado é apresentado
- **Então** o sistema exibe um hub em grade com um cartão por tipo de produto Porto Bank existente (ex.: cartão de crédito, conta digital, consórcio, investimentos), cada um indicando resumo (ex.: "4 plásticos", "6 cotas • Imóvel, Veículo e Rural", "5 posições • Renda fixa, CDB e fundos", "Ativa") e permitindo seleção em um gesto
- **E** produtos sem vínculo não geram cartão ocioso nem erro

**Cenário 8 — Visibilidade informativa da carteira Holding**
- **Dado** um cliente que também possui vínculos na Holding/Porto Seguro (ex.: seguro auto, residencial, saúde)
- **Quando** o resultado é apresentado
- **Então** o sistema exibe esses vínculos de forma informativa (apenas leitura, sem seleção transacional), distinguindo-os visualmente dos produtos Porto Bank

**Cenário 9 — Cliente sem vínculo Porto Bank**
- **Dado** um documento válido cujo titular não possui nenhum produto ativo no Porto Bank
- **Quando** o resultado é apresentado
- **Então** o hub de produtos informa ausência de vínculos Porto Bank sem erro técnico, mantendo visíveis os dados cadastrais e, se houver, os vínculos da Holding e ofertas elegíveis

**Cenário 10 — Documento não encontrado nas fontes corporativas**
- **Dado** um documento com formato válido porém inexistente nas bases consultadas
- **Quando** a busca retorna vazia
- **Então** o sistema informa de forma clara que nenhum cadastro foi localizado para aquele documento, sem exibir dados de outro cliente, e mantém a possibilidade de nova busca imediata com o documento ainda digitado

### 4.3 Ofertas de venda consultiva (NBO) — pré-atendimento prioritário

**Cenário 11 — Oferta elegível exibida em destaque e de forma não bloqueante**
- **Dado** um cliente localizado que é elegível a pelo menos uma oferta (ex.: cliente sem cartão elegível a cartão)
- **Quando** o resultado da busca é exibido
- **Então** o sistema apresenta, em área destacada e distinta de erro/alerta de sistema, a narrativa da oferta: produto ofertado (ex.: Cartão Black), texto de elegibilidade, bandeiras disponíveis, limite pré-aprovado, anuidade com condição (ex.: "isento no 1º ano") e lista de benefícios — com ação primária "Abordar venda / Iniciar prospecção" e ação secundária de dispensa
- **E** a exibição da oferta não bloqueia nem atrasa a exibição dos dados cadastrais — ambos podem carregar em paralelo e a oferta surge assim que disponível; porém a grade de produtos só é liberada após o operador decidir a oferta (Abordar ou Dispensar), com aviso visível enquanto a decisão estiver pendente

**Cenário 12 — Ausência de oferta não ocupa espaço nem confunde**
- **Dado** um cliente localizado sem ofertas elegíveis no momento
- **Quando** o resultado é apresentado
- **Então** a área de oferta se recolhe automaticamente (não ocupa espaço vertical relevante) e não exibe mensagem de erro; o operador segue diretamente para a seleção de produto

**Cenário 13 — Múltiplas ofertas elegíveis**
- **Dado** um cliente elegível a mais de uma oferta simultaneamente
- **Quando** o resultado é apresentado
- **Então** o sistema exibe as ofertas segundo regra de priorização definida pelo negócio [NEEDS CLARIFICATION: qual regra — maior propensão, maior valor, ordem fixa? quantas exibir simultaneamente?], sem duplicar ofertas do mesmo produto

**Cenário 14 — Ação de abordar venda registra a abordagem e direciona à venda**
- **Dado** uma oferta exibida em destaque no estado identificada
- **Quando** o operador aciona "Abordar venda"
- **Então** o sistema registra a oferta no estado **em abordagem** no contexto atual do cliente, com data/hora e operador, e direciona o fluxo para a jornada de venda/prospecção correspondente, preservando o contexto de identificação já fixado

**Cenário 15 — Dispensa de oferta registra o encerramento e libera os produtos**
- **Dado** uma oferta exibida no estado identificada, com a grade de produtos ainda bloqueada pelo gate
- **Quando** o operador dispensa a oferta
- **Então** o sistema registra a oferta no estado **dispensada/encerrada** para aquela interação [NEEDS CLARIFICATION: janela de supressão e registro de motivo — ver §9], exibe confirmação discreta da dispensa, libera a grade de produtos e permite seguir para a seleção do produto motivador sem impedimento
- **E** não é possível alcançar a grade sem decidir a oferta: Abordar ou Dispensar são os únicos caminhos quando há oferta elegível

### 4.4 Seleção do contexto de atendimento

**Cenário 16 — Seleção primária define o contexto para produto sem sub-seleção**
- **Dado** um cliente com produtos Porto Bank exibidos, incluindo conta digital
- **Quando** o operador seleciona a conta digital no hub
- **Então** o sistema fixa imediatamente o contexto de interação como "cliente X + conta digital selecionada" e encerra a jornada de identificação, liberando a navegação para a etapa seguinte de atendimento
- **E** a seleção é perceptível (estado visual de selecionado) e reversível antes de avançar, caso o operador tenha clicado no produto errado

**Cenário 17 — Cartão, consórcio e investimentos exigem sub-seleção de item específico**
- **Dado** um cliente com vínculos nesses produtos
- **Quando** o operador seleciona "Cartão de crédito", "Consórcio" ou "Investimentos" no hub
- **Então** o sistema exibe um painel complementar (modal) com os itens daquele produto, sem recarregar a grade principal: vias/plásticos para cartão; cotas (Imóvel, Veículo, Rural — podendo haver mais de uma cota no mesmo grupo) para consórcio; posições (renda fixa, renda variável, CDB, fundos) para investimentos

**Cenário 18 — Listagem de itens com dados completos para decisão**
- **Dado** o painel de sub-seleção aberto
- **Quando** ele carrega
- **Então** cada cartão exibe: bandeira e categoria (ex.: Visa Infinite, Mastercard Platinum, Gold) com logo, últimos 4 dígitos mascarados (`•••• 1234`), nome do portador indicando titular vs. adicional, limite e anuidade, e selo de situação com cor funcional (ex.: verde para ativo, cinza para cancelado, âmbar para bloqueado/pendente); cada cota exibe tipo, grupo/cota, valor, contemplação, parcela e situação; cada posição exibe classe, produto, valor, rentabilidade, vencimento/liquidez e risco
- **E** itens ativos, cancelados e bloqueados aparecem todos listados (histórico completo), permitindo ao operador escolher inclusive item cancelado quando o motivo do contato exigir

**Cenário 19 — Seleção do item específico fixa o contexto final**
- **Dado** o painel de sub-seleção aberto com múltiplos itens
- **Quando** o operador seleciona um item específico (ex.: via final 1234 Visa Infinite titular; cota Rural grupo 9012/cota 007; posição CDB Porto Bank R$ 18.000)
- **Então** o sistema fixa o contexto final como "cliente X + produto + item específico" e encerra a identificação, da mesma forma que no Cenário 16
- **E** fechar o painel sem escolher (Cancelar) desfaz a seleção do produto no hub, sem fixar contexto

**Cenário 20 — Cliente com múltiplos itens incluindo titular e adicional**
- **Dado** um cliente com cartões de titular e de portadores adicionais (ou cotas no mesmo grupo)
- **Quando** o painel de sub-seleção é exibido
- **Então** cada item identifica claramente o portador (ou grupo/cota), permitindo ao operador distinguir sem ambiguidade qual item motivou o contato

### 4.5 Performance, desacoplamento e resiliência

**Cenário 21 — Carregamento progressivo sem travar a interface**
- **Dado** um operador que acionou a busca
- **Quando** as fontes corporativas respondem em tempos distintos (ex.: cadastro retorna antes de ofertas, ou vice-versa)
- **Então** cada área da tela (faixa de identificação, hub de produtos, banner de ofertas, painel de vias) carrega de forma independente com indicação sutil de carregamento (ex.: esqueleto/placeholder por área, nunca spinner de tela cheia) sem bloquear a interação nas áreas já carregadas
- **E** nenhuma consolidação em segundo plano para a visão 360° retém a navegação do operador

**Cenário 22 — Falha parcial não impede o atendimento**
- **Dado** uma busca onde a consulta de ofertas está indisponível ou excede tempo limite, mas a consulta cadastral e de carteira retornou
- **Quando** isso ocorre
- **Então** o sistema exibe os dados cadastrais e o hub de produtos normalmente, informa de forma discreta que as ofertas não puderam ser verificadas naquele momento, e permite ao operador selecionar o produto e prosseguir
- **E** o inverso também vale: falha da consulta de carteira não deve suprimir a oferta se ela já retornou [ver [NEEDS CLARIFICATION] sobre mensagem exata]

**Cenário 23 — Extensibilidade: novo produto sem impacto nas etapas existentes**
- **Dado** que o negócio decide ofertar um novo produto Porto Bank (ex.: financiamento de veículos) ainda não presente no hub
- **Quando** esse produto é configurado como disponível
- **Então** ele passa a aparecer no hub para clientes que o possuem, sem exigir alteração no fluxo de busca, na consulta de ofertas ou na sub-seleção de cartões
- **E** a remoção ou alteração de regra de um produto existente não afeta a exibição/seleção dos demais

**Cenário 24 — REMOVIDO (histórico de sessão retirado por decisão do negócio)**
- O histórico de buscas recentes da sessão ("Recentes") foi removido da jornada: a tela inicial não exibe re-acesso rápido e cada identificação parte sempre de uma nova busca. Sem dados de outros operadores em tela por construção.

---

## 5. Regras de negócio

| # | Regra | Descrição em linguagem de negócio |
|---|---|---|
| RN-01 | Chaves de busca exclusivas por interação | Cada identificação parte de **uma única chave** conforme o modo: documento (CPF **ou** CNPJ) nos modos PF/PJ, número de protocolo no modo Protocolo, ou documento de pessoa ainda sem cadastro no modo Não cliente. Não há busca combinada nem busca por conta/telefone/nome nesta capacidade. |
| RN-02 | Suporte a CNPJ alfanumérico BACEN | O sistema aceita tanto CNPJ numérico (14 dígitos) quanto CNPJ alfanumérico no padrão definido pelo BACEN (14 posições com letras e dígitos). A validação de formato ocorre antes de qualquer consulta externa. |
| RN-03 | Máscara, seletor de modo e normalização | A tela oferece os modos PF, PJ, Protocolo e Não cliente centralizados no topo; a máscara visual (ex.: `000.000.000-00`, `00.000.000/0000-00`) aplica-se somente a PF/PJ e é apenas apresentação — a busca lógica usa o valor normalizado. Digitação com ou sem máscara é aceita. |
| RN-04 | Oferta antes do atendimento (pré-atendimento prioritário) | Quando houver oferta elegível, a diretriz operacional é **abordar a venda/prospecção antes** de tratar a demanda original do contato. O sistema deve tornar a oferta visível em destaque no início do resultado, não ao final. |
| RN-05 | Oferta não bloqueia identificação | A consulta de elegibilidade a ofertas e a consulta cadastral/carteira são independentes; a ausência ou demora de uma não pode atrasar ou impedir a exibição da outra. |
| RN-06 | Escopo transacional vs. informativo | **Porto Bank** (cartão, conta digital, consórcio, investimentos) é escopo transacional: permite seleção e fixa contexto de atendimento. **Holding/Porto Seguro** (seguros, saúde, etc.) é apenas informativo: exibido para contexto do operador, sem seleção transacional nesta jornada. O projeto como um todo fica restrito ao Porto Bank. |
| RN-07 | Seleção primária fixa contexto | Para produtos sem sub-seleção (conta digital na configuração atual), a escolha no hub já define o contexto final da interação. |
| RN-08 | Sub-seleção condicional para cartão, consórcio e investimentos | Cartão de crédito exige a via/plástico específica (todas as vias: ativas, canceladas, bloqueadas; titular e adicionais; com bandeira, categoria, portador, situação, limite e anuidade). Consórcio exige a cota específica (tipo Imóvel/Veículo/Rural, grupo/cota, valor, contemplação, parcela, situação — podendo haver várias cotas no mesmo grupo). Investimentos exige a posição específica (classe, produto, valor, rentabilidade, vencimento/liquidez, risco). Fechar o painel sem escolher desfaz a seleção, sem fixar contexto. |
| RN-09 | Contexto como saída formal | A saída desta jornada é o **contexto de interação** (identificação do cliente + produto Porto Bank selecionado + item específico — via, cota ou posição — quando aplicável), que será consumido pelas jornadas seguintes de atendimento/protocolo. |
| RN-10 | Atualização progressiva sem travar | O que o operador vê em tela reflete o retorno das fontes corporativas em memória; a consolidação desses dados para a visão 360° futura ocorre de forma progressiva em segundo plano, sem reter a navegação. [NEEDS CLARIFICATION: regra de prevalência quando dado corporativo diverge do cadastro já consolidado]. |
| RN-11 | Consolidação seletiva e idempotente | Apenas o contrato/via **efetivamente selecionado** pelo operador é consolidado no momento da seleção — nunca a carteira inteira de uma vez. O documento (CPF/CNPJ) atua como chave unívoca de correlação: buscas repetidas ou simultâneas do mesmo documento não duplicam registros. |
| RN-12 | Independência entre etapas | Ofertas, dados cadastrais/carteira e detalhe de vias de cartão são etapas logicamente desacopladas: alterar regra ou fonte de uma não deve exigir alteração nas demais. |
| RN-13 | Extensibilidade de catálogo | O catálogo de produtos Porto Bank exibido no hub é configurável; adicionar/remover um tipo de produto não exige refatoração do fluxo de busca ou das demais seleções. |
| RN-14 | Ciclo de vida da oferta | Toda oferta exibida nasce **identificada**; ao ser abordada passa a **em abordagem** (e o fluxo segue para a jornada de venda correspondente com o contexto preservado); ao ser dispensada passa a **dispensada/encerrada** para aquela interação. [NEEDS CLARIFICATION: janela de supressão e motivo de dispensa — ver §9]. |
| RN-15 | Performance como requisito de negócio | Tempo de resposta percebido e número de gestos são requisitos críticos: cada segundo de espera e cada clique adicional têm custo operacional direto. O carregamento é progressivo e a seleção ocorre em 1–2 gestos. |
| RN-16 | Padrão de dados decidido na conversa (insumo para fundação e `plan.md`) | Em linguagem de negócio, sem decidir mecanismo técnico: pessoas físicas e jurídicas seguem o **mesmo padrão de cadastro** (conta + contato vinculado, sem conta-pessoa unificada); ofertas são tratadas como **oportunidades de venda** vinculadas ao cliente; contratos e cartões (cada via/plástico) são consolidados como **ativos** do cliente para a visão 360°; **sem estruturas de dados customizadas** e sem objetos do pacote gerenciado financeiro. O detalhamento técnico pertence à fundação (`_fundacao/001`) e ao `plan.md` técnico. |

---

## 6. Casos limite e edge cases

| # | Situação | Comportamento esperado |
|---|---|---|
| EL-01 | CPF/CNPJ com dígito verificador inválido | Tratado como formato inválido (Cenário 4): busca não é acionada; orientação de correção é exibida. Não gera consulta externa nem registro. |
| EL-02 | CNPJ alfanumérico fora do padrão BACEN (ex.: caractere especial, tamanho ≠ 14) | Mesmo tratamento de EL-01. [NEEDS CLARIFICATION: mensagem exata e se há validação de algoritmo BACEN além de formato]. |
| EL-03 | Cliente com grande volume de vias de cartão (ex.: 10+ entre ativas/canceladas) | Painel de vias deve paginar ou rolar sem degradar performance; todas as vias permanecem acessíveis e distinguíveis. |
| EL-04 | Todas as vias de cartão canceladas | Lista exibe todas como canceladas; operador ainda pode selecionar a via que motivou o contato (ex.: contestação de cobrança em cartão cancelado). |
| EL-05 | Vias bloqueadas temporariamente | Exibidas com selo de bloqueado/pendente, distinguível de ativo e cancelado; seleção permanece possível. |
| EL-06 | Cliente com homônimo mas documento distinto | Não há ambiguidade: a busca é sempre por documento, não por nome; cada documento retorna apenas seu titular. |
| EL-07 | Documento válido mas fontes retornam dados cadastrais divergentes (ex.: nome diferente do cadastro interno) | Exibição prioriza fonte corporativa mais atual [NEEDS CLARIFICATION: regra de prevalência], sem sobrescrever silenciosamente sem trilha. |
| EL-08 | Indisponibilidade total das fontes corporativas | Mensagem clara de indisponibilidade temporária, sem exibir dados obsoletos como se fossem atuais; operador pode tentar novamente sem perder o documento digitado. |
| EL-09 | Timeout parcial (ex.: ofertas demoram > limite) | Aplica Cenário 22: exibe o que retornou, informa discretamente a indisponibilidade parcial, não bloqueia seleção. |
| EL-10 | Cliente PJ com múltiplos contatos vinculados (sócios/representantes) | Esta jornada identifica a **empresa** pelo CNPJ; detalhamento de representantes/sócios pertence a visão 360° subsequente, não à seleção de contexto desta etapa. [NEEDS CLARIFICATION]. |
| EL-11 | Busca simultânea do mesmo documento por dois operadores | Cada interação é independente; a consolidação em segundo plano é idempotente pela chave do documento e não duplica registros [NEEDS CLARIFICATION: regra de concorrência e desempate]. |
| EL-12 | Cliente sem oferta e sem produto Porto Bank (apenas Holding) | Exibe cadastro + Holding informativo; hub informa ausência de produtos Porto Bank; não há seleção transacional possível — operador decide próximo passo fora desta jornada. |
| EL-13 | Oferta elegível para produto que o cliente já possui em outra categoria | Oferta só deve aparecer para produto **não possuído** ou com upgrade elegível [NEEDS CLARIFICATION: regra exata de elegibilidade, ex.: cartão Gold → Black conta como NBO?]. |
| EL-14 | Operador dispensa oferta e imediatamente busca o mesmo cliente novamente | Oferta dispensada não deve reaparecer de forma insistente na mesma sessão/interação [NEEDS CLARIFICATION: janela de supressão]. |

---

## 7. Dados envolvidos (em termos de negócio, não técnicos)

| Dado | Descrição | Origem | Uso nesta jornada |
|---|---|---|---|
| Documento de identificação | CPF (11 dígitos) ou CNPJ (14 posições, numérico ou alfanumérico BACEN) | Informado pelo operador | Chave única de busca e de correlação idempotente |
| Modo de busca indicado | PF, PJ, Protocolo ou Não cliente, selecionado no topo da entrada | Informado pelo operador | Define máscara/validação aplicada (máscara só em PF/PJ) |
| Dados demográficos do cliente | Nome completo / razão social, tipo de pessoa, documento, segmento e situação do cadastro, contato (e-mail, telefone/celular, nascimento), endereço completo com CEP, renda presumida com score de risco, agência/conta com tempo de relacionamento | Base cadastral corporativa | Cartão de identificação enriquecido; alimenta visão 360° futura |
| Carteira Porto Bank | Lista de produtos/vínculos ativos do cliente no Porto Bank, por tipo (cartão, conta digital, consórcio, investimentos), com quantidade e situação | Base de produtos Porto Bank | Hub de seleção primária |
| Carteira Holding | Resumo de vínculos do cliente no ecossistema Porto Seguro (seguros, saúde, etc.) | Base corporativa Holding | Exibição informativa, sem seleção |
| Detalhe de vias de cartão | Para cada via/plástico: bandeira com logo, categoria, últimos 4 dígitos, nome do portador (titular vs. adicional), limite, anuidade e situação (ativo / cancelado / bloqueado) | Base processadora de cartões | Sub-seleção condicional |
| Detalhe de cotas de consórcio | Para cada cota: tipo (Imóvel/Veículo/Rural), grupo/cota, valor, contemplação, parcela e situação — incluindo várias cotas no mesmo grupo | Base de consórcio | Sub-seleção condicional |
| Detalhe de posições de investimento | Para cada posição: classe (renda fixa, renda variável, CDB, fundos), produto, valor, rentabilidade, vencimento/liquidez e risco | Base de investimentos | Sub-seleção condicional |
| Oferta elegível (NBO) | Produto ofertado, narrativa de elegibilidade, bandeiras disponíveis, limite pré-aprovado, anuidade com condição, lista de benefícios e estado no ciclo de vida (identificada / em abordagem / dispensada) | Motor de ofertas (NBO) | Banner de pré-atendimento prioritário; a decisão (Abordar/Dispensar) libera a grade |
| Contexto de interação selecionado | Cliente identificado + produto Porto Bank escolhido + item específico — via, cota ou posição — quando aplicável | Construído nesta jornada | Saída para protocolo/atendimento subsequente; apenas este recorte é consolidado no momento da seleção |
| Registro de abordagem/dispensa de oferta | Indicação se oferta foi abordada ou dispensada, com quando e por quem | Gerado nesta jornada | Liberação da grade e supressão de reexibição |

> Nenhum nome de objeto, campo ou componente técnico é mencionado aqui. O mapeamento para cadastros, contratos, ofertas e protocolos específicos do ambiente ocorre em `plan.md` e na fundação, a partir dos insumos da §10.

---

## 8. Dependências

| Dependência | Tipo | Situação real em 2026-09-06 | Impacto nesta spec |
|---|---|---|---|
| `_fundacao/001` — Modelo de conta e segurança base (`BACKLOG.md`) | Fundação (gate rígido) | **Não iniciado** — prosseguimento autorizadao de forma exploratória | Define como o cadastro do cliente (PF/PJ) é estruturado e correlacionado pelo documento, e quem pode ver quais dados financeiros. Enquanto não ratificado, esta spec não assume nenhum mecanismo técnico subjacente — apenas o comportamento de negócio descrito acima e as decisões de negócio da RN-16 como insumo. O complemento técnico em `plan.md` §§11–17 foi elaborado exploratoriamente sobre essas premissas. |
| `docs/design-system/SYSTEM-DESIGN.md` | Fundação visual (gate leve) | **Não iniciado** | Tokens, densidade, cores funcionais e padrões de carregamento/estados ainda não ratificados. O `prototype/` usa defaults SLDS2 verificados e `plan.md` §7 sinaliza a divergência. |
| `atendimento/*` e `household-360/*` (futuros) | Domínios consumidores | Não iniciados | Consomem o **contexto de interação** fixado aqui como entrada. Não são pré-requisitos, mas a rastreabilidade inversa deve ser mantida: cenários de aceite desta spec precisam ter caminho navegável no protótipo e tasks em `tasks.md` (constituição Princípio IX). |
| Fontes corporativas externas (cadastro, carteira, ofertas, cartões) | Integração | Premissa: interfaces existentes mantidas, fluxos redesenhados | Esta spec descreve apenas o comportamento observável (o que o operador vê e seleciona); contratos de integração, timeouts e mapeamentos ficam para `plan.md`. |

---

## 9. Perguntas em aberto — [NEEDS CLARIFICATION]

Itens que não foram narrados na conversa (ou foram perguntados e não respondidos) e não podem ser inferidos sem decisão do negócio/compliance. Cada um bloqueia detalhamento de `plan.md`/`tasks.md` até ser resolvido; não devem ser respondidos com suposição.

1. [NEEDS CLARIFICATION: LGPD e sigilo bancário — qual base legal e trilha de consentimento permite exibir dados demográficos, carteira Holding e ofertas para qualquer operador que informe o CPF/CNPJ? Há perfis que veem menos dados?]
2. [NEEDS CLARIFICATION: Quem pode ver o quê — operadores de Porto Bank veem carteira completa da Holding por padrão, ou apenas resumo? Há restrição por papel/segmento?]
3. [NEEDS CLARIFICATION: Retenção e ciclo de vida da oferta — uma oferta identificada permanece válida por quanto tempo? Quando vira "perdida/expirada" e quando pode voltar a ser ofertada ao mesmo cliente?]
4. [NEEDS CLARIFICATION: Múltiplas ofertas elegíveis — qual regra de priorização/ordenação deve ser aplicada (propensão, valor, produto estratégico, ordem fixa)? Quantas exibir simultaneamente?]
5. [NEEDS CLARIFICATION: Dispensa de oferta — ao dispensar, deve-se registrar motivo? A oferta some por quanto tempo (sessão, dias, até nova elegibilidade)?]
6. [NEEDS CLARIFICATION: Prevalência de dados — quando a base cadastral corporativa diverge do cadastro já consolidado na visão 360°, qual fonte prevalece e há trilha de auditoria da atualização?]
7. [NEEDS CLARIFICATION: CNPJ alfanumérico BACEN — qual validação exata além de formato (algoritmo verificador, tabela de conversão)? Mensagem de erro específica?]
8. [NEEDS CLARIFICATION: Concorrência — dois operadores buscam o mesmo documento simultaneamente; a consolidação em segundo plano é idempotente? Há risco de duplicidade? Regra de desempate?]
9. [NEEDS CLARIFICATION: Cliente PJ — além da empresa, é necessário exibir/escolher sócio/representante que está ao telefone, ou apenas a empresa basta para fixar contexto?]
10. [NEEDS CLARIFICATION: Mensageria de falha parcial — qual texto exato deve ser exibido quando ofertas ou carteira estão indisponíveis temporariamente? Há código de erro visível ao operador?]
11. [REMOVIDO por decisão do negócio — histórico de sessão ("Recentes") retirado da jornada; sem re-acesso rápido, cada identificação parte de nova busca.]
12. [NEEDS CLARIFICATION: Elegibilidade fina de oferta — a regra "cliente não possui produto" considera apenas posse ativa, ou inclui produtos cancelados/encerrados recentemente? E upgrade dentro do mesmo produto (ex.: cartão Gold → Black) conta como NBO?]
13. [NEEDS CLARIFICATION: Auditoria — quais eventos desta jornada precisam ser auditados (busca por documento, exibição de oferta, seleção de produto/via, dispensa)? Por quanto tempo os logs são retidos?]
14. [NEEDS CLARIFICATION: Acessibilidade e responsividade — há requisitos WCAG ou de operação mobile a atender nesta jornada, ou apenas desktop em console?]
15. [NEEDS CLARIFICATION: Limite e paginação — há limite máximo de produtos/vias a exibir? Como ordenar (ex.: ativos primeiro, mais recentes primeiro)?]
16. [NEEDS CLARIFICATION: Busca por cliente estrangeiro ou sem CPF/CNPJ (passaporte, ID estrangeiro) — fora de escopo desta capacidade ou deve ser previsto como extensão futura?]
17. [NEEDS CLARIFICATION: Validação de identidade — existe etapa de perguntas de segurança/autenticação antes de exibir dados sensíveis e contratos, ou ela ocorre depois da seleção do produto? (Perguntado na conversa, não respondido.)]
18. [NEEDS CLARIFICATION: Pós-seleção imediata — ao fixar o contexto (produto ou via selecionada), o sistema cria o protocolo automaticamente e abre o espaço de trabalho, ou apenas disponibiliza o contexto para a próxima etapa? (Perguntado na conversa, não respondido.)]

---

## 10. Notas para as próximas fases (não são requisitos, apenas rastreabilidade)

- **Insumos de arquitetura já decididos na conversa** (registrar e justificar em `plan.md` e na fundação, conforme constituição Princípios IV e V — a conversa é insumo, e esta spec não decide tecnologia):
  - Back-end 100% em camadas de serviço desacopladas por domínio (ex.: busca cadastral, ofertas, cartões), **sem procedimentos de integração empacotados**; gatilhos seguem padrão corporativo com lógica delegada e consolidação em segundo plano — nunca lógica pesada síncrona prendendo a tela.
  - Front-end da identificação em **componentes modulares desacoplados por eventos** (barra de busca, banner de oferta, resumo do cliente, hub de produtos, drawer de cartões); cada etapa com contrato próprio, sem monolito de tela. Tecnologia concreta a decidir em `plan.md`.
  - Soluções guiadas empacotadas **reservadas às jornadas transacionais subsequentes** (contestação, cancelamento, alteração de limite, contratação) — não a esta identificação.
  - Dados: RN-16 (mesmo padrão conta+contato para PF e PJ; ofertas como oportunidades; contratos/cartões como ativos; sem estruturas customizadas; chave unívoca no documento).
- Esta spec **não** decide tecnologia de interface nem de back-end/integração — essas decisões, já discutidas na conversa como premissas de arquitetura, serão registradas e justificadas em `plan.md` pelos papéis de design e planejamento técnico, conforme constituição Princípios IV e V. A conversa é insumo, não decisão registrada em spec.
- `prototype/` desta capacidade cobre todos os cenários de aceite acima (exceto o Cenário 24, removido) em fluxo navegável com LWC real sobre SLDS2 real — shell orquestrador + 5 componentes de domínio + 3 modais de sub-seleção, todos sob `prototype/` como fonte única (ver `prototype/README.md` e `.claude/agents/fsc-html-prototyper.md`).
- `architecture.md` futuro deve mapear cada cenário de aceite a pelo menos uma task e cada artefato a suas conexões (constituição Princípio IX).

---

*Fim de `spec.md` — `busca-cliente/001` (revisão integral 2026-09-06 a partir de `ConversaGoogleGemini.md` integral)*
