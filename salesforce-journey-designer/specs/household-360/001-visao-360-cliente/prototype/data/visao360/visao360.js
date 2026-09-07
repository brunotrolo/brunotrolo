/**
 * Fixtures + simuladores de fetch para household-360/001 (Visão 360°).
 *
 * - Somente leitura em memória: nada aqui persiste (RN-04 — voláteis nunca
 *   gravados como cadastro).
 * - `fetchDetalheVolatil` simula o core bancário com cache client-side curto
 *   de 180s (Cenário 8) e falha determinística na 1ª consulta do consórcio
 *   do João para exercitar o retry (Cenário 9: falha → "Tentar Novamente" → sucesso).
 * - NBO é estático: `getOfertas` devolve as ofertas da safra vigente na hora,
 *   sem spinner. Para o Carlos, a 1ª carga do dia mostra o motor fora
 *   (EL-03/RN-12: só banner + retry, sem exibir último estado); o retry
 *   carrega na hora. `NBO_MOTOR` identifica modelo/safra/geração.
 */

export const DOC_JOAO = '12345678900';
export const DOC_INDUSTRIA = '12ABC345000190';
export const DOC_MARIA = '11111111111';
export const DOC_CARLOS = '99999999999';
export const DOC_PADRAO = DOC_JOAO;

export const DOCUMENTOS_TESTE = [
    { doc: DOC_JOAO, descricao: 'João da Silva (PF completo + NBO top 3)' },
    { doc: DOC_INDUSTRIA, descricao: 'Indústria Exemplo S.A. (PJ, sem ofertas, abas vazias)' },
    { doc: DOC_MARIA, descricao: 'Maria Oliveira (só conta, sem ofertas)' },
    { doc: DOC_CARLOS, descricao: 'Carlos Souza (motor NBO fora na 1ª carga → retry)' }
];

export const MOTIVOS_RECUSA = [
    { label: 'Sem interesse', value: 'SEM_INTERESSE' },
    { label: 'Achou caro', value: 'ACHOU_CARO' },
    { label: 'Já possui', value: 'JA_POSSUI' }
];

const ATIVOS_JOAO = [
    {
        id: 'cartao-joao-1234',
        familia: 'CARTAO',
        rotulo: 'Cartão Visa Infinite',
        identificador: 'final 1234 • Titular João',
        situacao: 'Ativo',
        icone: 'utility:card_details',
        numero: '0012 3456 •• 1234',
        valor: 'Limite R$ 28.000',
        encerramento: 'Vence 10/09/2026',
        ultimaMov: 'Fatura R$ 3.210,45'
    },
    {
        id: 'cartao-joao-3456',
        familia: 'CARTAO',
        rotulo: 'Cartão Mastercard Black',
        identificador: 'final 3456 • Titular João',
        situacao: 'Bloqueado',
        icone: 'utility:card_details',
        numero: '0012 3456 •• 3456',
        valor: 'Limite R$ 42.000',
        encerramento: 'Vence 10/09/2026',
        ultimaMov: 'Fatura R$ 1.080,20'
    },
    {
        id: 'cartao-joao-9012',
        familia: 'CARTAO',
        rotulo: 'Cartão Visa Gold',
        identificador: 'final 9012 • Adicional Maria',
        situacao: 'Cancelado',
        icone: 'utility:card_details',
        numero: '0012 3456 •• 9012',
        valor: '—',
        encerramento: 'Cancelado em 05/2026',
        ultimaMov: '—'
    },
    {
        id: 'conta-joao-1',
        familia: 'CONTA',
        rotulo: 'Conta Digital',
        identificador: 'Ag 0001 • C/C 12345-6',
        situacao: 'Ativo',
        icone: 'custom:custom16',
        numero: 'Ag 0001 • C/C 12345-6',
        valor: 'R$ 12.480,90',
        encerramento: '—',
        ultimaMov: 'Pix enviado hoje'
    },
    {
        id: 'consorcio-joao-1',
        familia: 'CONSORCIO',
        rotulo: 'Consórcio Imóvel',
        identificador: 'Grupo 1234 • Cota 045',
        situacao: 'Ativo',
        icone: 'utility:contract_doc',
        numero: 'Grupo 1234 • Cota 045',
        valor: 'Devedor R$ 212.400',
        encerramento: '—',
        ultimaMov: 'Parcela 09/2026 paga'
    },
    {
        id: 'consorcio-joao-2',
        familia: 'CONSORCIO',
        rotulo: 'Consórcio Veículo',
        identificador: 'Grupo 5678 • Cota 012',
        situacao: 'Encerrado',
        icone: 'utility:contract_doc',
        numero: 'Grupo 5678 • Cota 012',
        valor: 'Quitado',
        encerramento: 'Encerrado em 03/2024',
        ultimaMov: '—'
    },
    {
        id: 'invest-joao-1',
        familia: 'INVEST',
        rotulo: 'CDB Porto Bank',
        identificador: 'Pós-fixado • 102% do CDI',
        situacao: 'Ativo',
        icone: 'standard:investment_account',
        numero: 'Conta 88114-2',
        valor: 'R$ 18.000 • +11,2% a.a.',
        encerramento: 'Vence em 12/2027',
        ultimaMov: 'Aplicação R$ 2.000'
    },
    {
        id: 'invest-joao-2',
        familia: 'INVEST',
        rotulo: 'Fundo de Ações Dividendos',
        identificador: 'Renda variável • +18,3% em 12m',
        situacao: 'Ativo',
        icone: 'standard:investment_account',
        numero: 'Conta 77231-9',
        valor: 'R$ 5.200 • +18,3% em 12m',
        encerramento: 'Resgate D+2',
        ultimaMov: 'Rendimento R$ 310'
    }
];

const DETALHES_VOLATEIS = {
    'cartao-joao-1234': {
        tipo: 'CARTAO',
        limiteTotal: 'R$ 28.000',
        limiteDisponivel: 'R$ 19.450',
        faturaAtual: 'R$ 3.210,45',
        vencimento: '10/09/2026',
        melhorDiaCompra: 'dia 02'
    },
    'cartao-joao-3456': {
        tipo: 'CARTAO',
        limiteTotal: 'R$ 42.000',
        limiteDisponivel: 'R$ 0,00 (bloqueado)',
        faturaAtual: 'R$ 1.080,20',
        vencimento: '10/09/2026',
        melhorDiaCompra: 'dia 02',
        aviso: 'Bloqueio preventivo — oriente o cliente a contatar a central.'
    },
    'cartao-joao-9012': {
        tipo: 'CARTAO',
        limiteTotal: '—',
        limiteDisponivel: '—',
        faturaAtual: '—',
        vencimento: '—',
        melhorDiaCompra: '—',
        aviso: 'Cartão cancelado — dados cadastrais em leitura reduzida.'
    },
    'conta-joao-1': {
        tipo: 'CONTA',
        saldo: 'R$ 12.480,90',
        agenciaConta: 'Ag 0001 • C/C 12345-6',
        chavesPix: ['j***@email.com (e-mail)', '(11) *****-1234 (celular)', '***.***.***-00 (CPF)']
    },
    'consorcio-joao-1': {
        tipo: 'CONSORCIO',
        grupoCota: 'Grupo 1234 • Cota 045 (Imóvel)',
        saldoDevedor: 'R$ 212.400,00',
        parcela: 'R$ 1.420/mês',
        proximaAssembleia: '18/09/2026 às 19h',
        contemplacao: 'Não contemplada'
    },
    'consorcio-joao-2': {
        tipo: 'CONSORCIO',
        grupoCota: 'Grupo 5678 • Cota 012 (Veículo)',
        saldoDevedor: 'Quitado',
        parcela: '—',
        proximaAssembleia: '—',
        contemplacao: 'Contemplada em 03/2024',
        aviso: 'Cota encerrada — dados cadastrais em leitura reduzida.'
    },
    'invest-joao-1': {
        tipo: 'INVEST',
        produto: 'CDB Porto Bank • Pós-fixado 102% do CDI',
        valorAplicado: 'R$ 18.000,00',
        rentabilidade: '+11,2% a.a.',
        vencimento: 'Vence em 12/2027'
    },
    'invest-joao-2': {
        tipo: 'INVEST',
        produto: 'Fundo de Ações Dividendos',
        valorAplicado: 'R$ 5.200,00',
        rentabilidade: '+18,3% em 12 meses',
        vencimento: 'Resgate D+2'
    },
    'conta-industria-1': {
        tipo: 'CONTA',
        saldo: 'R$ 340.900,00',
        agenciaConta: 'Ag 0007 • C/C 98765-4',
        chavesPix: ['c***@industriaexemplo.com.br (e-mail)', '**.***.***/0001-90 (CNPJ)']
    },
    'invest-industria-1': {
        tipo: 'INVEST',
        produto: 'CDB Empresarial • 104% do CDI',
        valorAplicado: 'R$ 120.000,00',
        rentabilidade: '+11,8% a.a.',
        vencimento: 'Vence em 06/2027'
    },
    'conta-maria-1': {
        tipo: 'CONTA',
        saldo: 'R$ 2.140,00',
        agenciaConta: 'Ag 0001 • C/C 54321-0',
        chavesPix: ['(11) *****-8899 (celular)']
    },
    'conta-carlos-1': {
        tipo: 'CONTA',
        saldo: 'R$ 8.020,35',
        agenciaConta: 'Ag 0003 • C/C 77777-7',
        chavesPix: ['c***@email.com (e-mail)']
    }
};

export const NBO_MOTOR = {
    modelo: 'Propensão Porto v3.2',
    safra: '2026-09',
    geradoEm: '06/09/2026 às 08:00'
};

const OFERTAS_JOAO = [
    {
        id: 'nbo-black',
        produto: 'Cartão Black',
        condicao: 'Isenção de anuidade no 1º ano',
        elegibilidade: 'Sem cartão Black + gasto médio acima de R$ 8.000/mês',
        score: 92,
        confianca: 'Alta',
        motivos: ['Gasto médio de R$ 8.400/mês nos últimos 6 meses', 'Relacionamento de 8 anos sem atraso', 'Perfil Exclusivo sem cartão premium'],
        validade: '30/09/2026',
        chaveSafra: '12345678900_BLACK_2026-09',
        omniScriptKey: 'osSaleCreditCard'
    },
    {
        id: 'nbo-consorcio',
        produto: 'Consórcio Imóvel — lance embutido',
        condicao: 'Contemplação acelerada com lance de 20%',
        elegibilidade: 'Sem consórcio ativo + relacionamento acima de 5 anos',
        score: 81,
        confianca: 'Alta',
        motivos: ['Simulação de consórcio em andamento (PRT-2026-87531)', 'Idade e renda compatíveis com carta de R$ 350 mil', 'Sem consórcio ativo no CPF'],
        validade: '30/09/2026',
        chaveSafra: '12345678900_CONSORCIO_2026-09',
        omniScriptKey: 'osSaleConsorcio'
    },
    {
        id: 'nbo-cdb',
        produto: 'CDB 102% do CDI',
        condicao: 'Aplicação mínima de R$ 1.000',
        elegibilidade: 'Saldo em conta acima de R$ 10.000 sem investimento',
        score: 74,
        confianca: 'Média',
        motivos: ['Saldo parado de R$ 12.480 sem investimento vinculado', 'Primeira aplicação há mais de 2 anos', 'Perfil conservador em 70% da carteira'],
        validade: '15/10/2026',
        chaveSafra: '12345678900_CDB_2026-09',
        omniScriptKey: 'osSaleInvestimento'
    }
];

const OFERTAS_CARLOS = [
    {
        id: 'nbo-carlos-1',
        produto: 'Cartão Platinum',
        condicao: 'Anuidade grátis por 6 meses',
        elegibilidade: 'Sem cartão + score acima de 700',
        score: 68,
        confianca: 'Média',
        motivos: ['Score 705 em alta pelo 3º mês', 'Sem cartão no CPF', 'Gasto concentrado no débito'],
        validade: '30/09/2026',
        chaveSafra: '99999999999_PLATINUM_2026-09',
        omniScriptKey: 'osSaleCreditCard'
    },
    {
        id: 'nbo-carlos-2',
        produto: 'Consórcio Veículo',
        condicao: 'Primeira assembleia sem taxa',
        elegibilidade: 'Sem consórcio ativo',
        score: 61,
        confianca: 'Média',
        motivos: ['Sem consórcio ativo no CPF', 'Idade da frota familiar acima de 6 anos', 'Visitas à página de veículos no app'],
        validade: '30/09/2026',
        chaveSafra: '99999999999_CONSORCIO_2026-09',
        omniScriptKey: 'osSaleConsorcio'
    }
];

const CASOS_JOAO = [
    { id: 'caso-1', protocolo: 'PRT-2026-88114', data: '28/08/2026', motivo: 'Dúvida sobre fatura do cartão', categoria: 'Cartões', situacao: 'Encerrado', satisfacao: 5, responsavel: 'Paula Mendes', canal: 'Central', resolucao: '1 dia útil' },
    { id: 'caso-2', protocolo: 'PRT-2026-87902', data: '12/08/2026', motivo: 'Atualização cadastral', categoria: 'Cadastro', situacao: 'Encerrado', satisfacao: 4, responsavel: 'Paula Mendes', canal: 'Agência', resolucao: 'No mesmo dia' },
    { id: 'caso-3', protocolo: 'PRT-2026-87531', data: '30/07/2026', motivo: 'Simulação de consórcio', categoria: 'Consórcio', situacao: 'Em andamento', satisfacao: 5, responsavel: 'Ricardo Alves', canal: 'App', resolucao: '—' },
    { id: 'caso-4', protocolo: 'PRT-2026-86120', data: '09/07/2026', motivo: 'Contestação de tarifa de pacote', categoria: 'Tarifas', situacao: 'Encerrado', satisfacao: 3, responsavel: 'Ricardo Alves', canal: 'App', resolucao: '4 dias úteis' },
    { id: 'caso-5', protocolo: 'PRT-2026-85447', data: '18/06/2026', motivo: 'Aumento de limite do cartão', categoria: 'Cartões', situacao: 'Encerrado', satisfacao: 5, responsavel: 'Paula Mendes', canal: 'Agência', resolucao: '2 dias úteis' }
];

const CASOS_PADRAO = [
    { id: 'caso-a', protocolo: 'PRT-2026-87001', data: '20/08/2026', motivo: 'Atualização de endereço', categoria: 'Cadastro', situacao: 'Encerrado', satisfacao: 4, responsavel: 'Paula Mendes', canal: 'Agência', resolucao: 'No mesmo dia' },
    { id: 'caso-b', protocolo: 'PRT-2026-86612', data: '05/08/2026', motivo: 'Extrato para imposto de renda', categoria: 'Conta', situacao: 'Encerrado', satisfacao: 5, responsavel: 'Ricardo Alves', canal: 'App', resolucao: 'No mesmo dia' },
    { id: 'caso-c', protocolo: 'PRT-2026-85233', data: '22/07/2026', motivo: 'Contestação de tarifa', categoria: 'Tarifas', situacao: 'Em andamento', satisfacao: 3, responsavel: 'Paula Mendes', canal: 'Central', resolucao: '—' }
];

/** Aba Atividades — próximas melhores ações recomendadas (NBA). */
const ACOES_JOAO = [
    {
        id: 'acao-1',
        titulo: 'Agendar revisão da carteira',
        descricao: 'Cliente Exclusivo sem contato há 45 dias; última revisão há 8 meses.',
        cta: 'Agendar'
    },
    {
        id: 'acao-2',
        titulo: 'Ligar sobre a fatura do Black',
        descricao: 'Fatura 3× acima da média; risco de contestação no vencimento.',
        cta: 'Ligar'
    },
    {
        id: 'acao-3',
        titulo: 'Enviar proposta do consórcio',
        descricao: 'Simulação em andamento (PRT-2026-87531) sem retorno há 9 dias.',
        cta: 'Enviar'
    }
];

/** Aba Resumo — KPIs, eventos da vida, tags e wellness (telas de referência). */
const RESUMO_JOAO = {
    aum: 'R$ 127.400,00',
    patrimonioHousehold: 'R$ 214.900,00',
    ativosFora: 'R$ 67.200,00',
    walletShare: '68%',
    scoreCredito: '872 (baixo risco)',
    completude: '80%',
    eventosVida: [
        { id: 'ev-1', titulo: 'Abertura de conta', data: '03/02/2018', glifo: 'pessoa' },
        { id: 'ev-2', titulo: 'Casamento', data: '20/06/2020', glifo: 'alianca' },
        { id: 'ev-3', titulo: 'Casa nova', data: '10/07/2022', glifo: 'casa' },
        { id: 'ev-4', titulo: 'Nascimento do Pedro', data: '25/09/2023', glifo: 'bebe' },
        { id: 'ev-5', titulo: 'Promoção no trabalho', data: '25/05/2025', glifo: 'trofeu' },
        { id: 'ev-6', titulo: 'Aposentadoria (prevista)', data: '2038', glifo: 'local' }
    ],
    tags: {
        segmentos: ['Exclusivo', 'Top 50'],
        investimentos: ['Renda fixa', 'Fundos imobiliários'],
        estilo: ['Viagens', 'Gastronomia']
    },
    wellness: { nota: '4,8', variacao: '+0,3 no ano', nivel: 'Alto', barras: [55, 60, 58, 66, 62, 70, 68, 75, 72, 80, 78, 88] },
    planejamento: { nivel: 'Intermediário', etapa: 2, recomendacao: 'Recomendado concluir o plano 2026', recomendacaoDetalhe: 'Clientes com plano de longo prazo têm 8× mais valor.' }
};

/** Aba Inteligência — comportamento digital (site/app). */
const COMPORTAMENTO_JOAO = {
    site: [
        { quando: '03/09/2026 09:38', duracao: '2:48', paginas: 5, origem: 'Link de e-mail', dispositivo: 'Desktop', detalhe: 'Abriu a fatura do Visa Infinite e simulou parcelamento.', destaque: 'Visitou: fatura, parcelamento, ajuda' },
        { quando: '14/08/2026 17:10', duracao: '1:05', paginas: 2, origem: 'Buscador', dispositivo: 'Celular', detalhe: 'Pesquisou taxas do consórcio e saiu na página de grupos.', destaque: 'Visitou: consórcio, grupos' },
        { quando: '19/07/2026 16:20', duracao: '3:15', paginas: 6, origem: 'Acesso direto', dispositivo: 'Desktop', detalhe: 'Comparou CDB x poupança e leu o regulamento do Black.', destaque: 'Visitou: investimentos, cartões, regulamento' },
        { quando: '02/07/2026 20:02', duracao: '0:58', paginas: 2, origem: 'Link de SMS', dispositivo: 'Celular', detalhe: 'Abriu o boleto do consórcio e copiou o código de barras.', destaque: 'Visitou: boletos' }
    ],
    app: [
        { quando: '05/09/2026 08:12', duracao: '4:02', paginas: 9, origem: 'Push de fatura', dispositivo: 'Celular', detalhe: 'Pagou a fatura, ativou débito automático e avaliou o app.', destaque: 'Ações: pagamento, débito automático, CSAT 5/5' },
        { quando: '28/08/2026 19:44', duracao: '1:37', paginas: 4, origem: 'Acesso direto', dispositivo: 'Celular', detalhe: 'Consultou o Pix agendado e conferiu o extrato.', destaque: 'Ações: Pix, extrato' },
        { quando: '09/08/2026 12:30', duracao: '2:20', paginas: 5, origem: 'Push de oferta', dispositivo: 'Celular', detalhe: 'Tocou na oferta do Black, leu condições e salvou para depois.', destaque: 'Ações: oferta Black salva' }
    ]
};

/** Aba Inteligência — fluxo de entrada e saída (6 meses). */
const FLUXO_JOAO = {
    maximo: 10000,
    meses: [
        { mes: 'JUL', entrada: 9400, saida: 6300 },
        { mes: 'AGO', entrada: 7400, saida: 7400 },
        { mes: 'SET', entrada: 8400, saida: 6800 },
        { mes: 'OUT', entrada: 8400, saida: 6300 },
        { mes: 'NOV', entrada: 8400, saida: 6800 },
        { mes: 'DEZ', entrada: 8300, saida: 8100 }
    ]
};

/** Aba Inteligência — gastos por segmentação. */
const SEGMENTACAO_JOAO = {
    periodo: 'JUL – DEZ',
    itens: [
        { rotulo: 'Empréstimos e financiamentos', percentual: 30, cor: '#1f8ef1' },
        { rotulo: 'Casa e serviços', percentual: 23, cor: '#4a5568' },
        { rotulo: 'Viagem e lazer', percentual: 18, cor: '#e94e77' },
        { rotulo: 'Saúde', percentual: 15, cor: '#9b7ed9' },
        { rotulo: 'Alimentação e bebidas', percentual: 7.5, cor: '#f5a623' },
        { rotulo: 'Transporte e carro', percentual: 6.5, cor: '#34a853' }
    ]
};

/** Aba Inteligência — reação a campanhas (ok/falha/pendente por objetivo). */
const CAMPANHAS_JOAO = [
    { id: 'camp-1', inicio: '26/08/2026', nome: 'Upgrade para cartão Black', primeira: 'ok', final: 'pendente', oportunidade: 'pendente' },
    { id: 'camp-2', inicio: '18/07/2026', nome: 'Portabilidade de salário', primeira: 'ok', final: 'falha', oportunidade: 'falha' },
    { id: 'camp-3', inicio: '01/04/2026', nome: 'Ativação do débito automático', primeira: 'ok', final: 'ok', oportunidade: 'ok' }
];

/** Aba Metas — objetivos financeiros com progresso. */
const METAS_JOAO = [
    { id: 'meta-1', nome: 'Reserva de emergência', estado: 'Em andamento', alvo: 'R$ 30.000', atual: 'R$ 17.500', dataAlvo: '23/08/2027', percentual: 58 },
    { id: 'meta-2', nome: 'Entrada da casa própria', estado: 'Em andamento', alvo: 'R$ 120.000', atual: 'R$ 42.000', dataAlvo: '15/12/2028', percentual: 35 }
];

/** Aba Atividades — próximos passos (tarefas) + linha do tempo. */
const TAREFAS_JOAO = [
    { id: 'tar-1', titulo: 'Enviar proposta do cartão Black', prazo: 'Hoje', responsavel: 'Ricardo Alves', concluida: false },
    { id: 'tar-2', titulo: 'Agendar revisão da carteira', prazo: '12/09/2026', responsavel: 'Ricardo Alves', concluida: false }
];

const INTERACOES_JOAO = [
    { id: 'int-1', tipo: 'email', titulo: 'Proposta do consórcio imóvel', detalhe: 'Enviado comparativo de grupos e assembleias.', detalheLongo: 'Anexo com 3 grupos (1234, 5678 e 9012), estimativa de lance embutido de 20% e calendário das próximas 4 assembleias.', de: 'Ricardo Alves', para: 'João da Silva', quando: '02/09/2026', hora: '14:30', duracao: '—', canal: 'E-mail', protocolo: 'PRT-2026-87531' },
    { id: 'int-2', tipo: 'ligacao', titulo: 'Follow-up: fatura do cartão', detalhe: 'Cliente confirmou o pagamento e pediu 2ª via.', detalheLongo: 'Fatura do Visa Infinite 3× acima da média; cliente alega compra parcelada de passagem aérea. 2ª via enviada por e-mail durante a ligação.', de: 'Paula Mendes', para: 'João da Silva', quando: '28/08/2026', hora: '10:12', duracao: '7:48', canal: 'Central', protocolo: 'PRT-2026-88114' },
    { id: 'int-3', tipo: 'tarefa', titulo: 'Atualização cadastral concluída', detalhe: 'Endereço e renda atualizados na agência.', detalheLongo: 'Renda atualizada para R$ 18.500; novo comprovante de endereço arquivado. Pendência KYC segue aberta (validação de identidade).', de: 'Paula Mendes', para: '—', quando: '12/08/2026', hora: '15:40', duracao: '—', canal: 'Agência', protocolo: 'PRT-2026-87902' },
    { id: 'int-4', tipo: 'chat', titulo: 'Dúvida sobre Pix agendado', detalhe: 'Orientado pelo app; sem necessidade de retorno.', detalheLongo: 'Cliente não encontrava o agendamento; era filtro de período. Enviado passo a passo com prints. CSAT 5/5.', de: 'Atendimento digital', para: 'João da Silva', quando: '05/08/2026', hora: '09:05', duracao: '8:45', canal: 'App', protocolo: '—' },
    { id: 'int-5', tipo: 'email', titulo: 'Boleto da parcela do consórcio', detalhe: '2ª via enviada com vencimento atualizado.', detalheLongo: 'Parcela de R$ 1.420 do grupo 1234 com vencimento prorrogado para 25/08 sem multa, por solicitação do cliente.', de: 'Ricardo Alves', para: 'João da Silva', quando: '20/08/2026', hora: '10:05', duracao: '—', canal: 'E-mail', protocolo: '—' },
    { id: 'int-6', tipo: 'ligacao', titulo: 'Oferta de portabilidade de salário', detalhe: 'Cliente pediu para retornar em outubro.', detalheLongo: 'Oferta recusada no momento por fidelidade ao banco atual; pedir retorno em 15/10 com condição de anuidade zerada.', de: 'Ricardo Alves', para: 'João da Silva', quando: '15/07/2026', hora: '16:40', duracao: '6:12', canal: 'Central', protocolo: '—' },
    { id: 'int-7', tipo: 'chat', titulo: 'Saldo contestado no app', detalhe: 'Divergência explicada; caso encerrado.', detalheLongo: 'Diferença de R$ 180 referente a débito automático de consórcio. Extrato detalhado enviado; cliente satisfeito.', de: 'Atendimento digital', para: 'João da Silva', quando: '30/06/2026', hora: '11:22', duracao: '12:03', canal: 'App', protocolo: 'PRT-2026-86120' }
];

const CANAIS_JOAO = [
    { rotulo: 'Telefone', icone: 'action:call' },
    { rotulo: 'E-mail', icone: 'action:email' }
];

const CANAIS_PADRAO = [{ rotulo: 'E-mail', icone: 'action:email' }];

const ARC_RESUMO_JOAO = [
    { id: 'no-joao', nome: 'João da Silva', papel: 'Titular', tipo: 'PF', doc: DOC_JOAO },
    { id: 'no-maria', nome: 'Maria da Silva', papel: 'Cônjuge', tipo: 'PF', doc: null },
    { id: 'no-pedro', nome: 'Pedro da Silva', papel: 'Dependente', tipo: 'PF', doc: null },
    { id: 'no-ana', nome: 'Ana da Silva', papel: 'Dependente', tipo: 'PF', doc: null },
    { id: 'no-industria', nome: 'Indústria Exemplo S.A.', papel: 'Empresa vinculada', tipo: 'PJ', doc: DOC_INDUSTRIA }
];

const ARC_COMPLETA_JOAO = [
    { id: 'no-joao', nome: 'João da Silva', papel: 'Titular', tipo: 'PF', doc: DOC_JOAO, nivel: 0 },
    { id: 'no-maria', nome: 'Maria da Silva', papel: 'Cônjuge', tipo: 'PF', doc: null, nivel: 1 },
    { id: 'no-pedro', nome: 'Pedro da Silva', papel: 'Dependente', tipo: 'PF', doc: null, nivel: 1 },
    { id: 'no-ana', nome: 'Ana da Silva', papel: 'Dependente', tipo: 'PF', doc: null, nivel: 1 },
    { id: 'no-industria', nome: 'Indústria Exemplo S.A.', papel: 'Empresa vinculada (sócio-administrador)', tipo: 'PJ', doc: DOC_INDUSTRIA, nivel: 1 },
    { id: 'no-coligada', nome: 'Logística Exemplo Ltda.', papel: 'Coligada da Indústria Exemplo', tipo: 'PJ', doc: null, nivel: 2 },
    { id: 'no-socio1', nome: 'Paulo Mendes', papel: 'Sócio da Indústria Exemplo (30%)', tipo: 'PF', doc: null, nivel: 2 },
    { id: 'no-contadora', nome: 'Contábil Alfa', papel: 'Representante contábil', tipo: 'PJ', doc: null, nivel: 2 },
    { id: 'no-mae', nome: 'Rosa da Silva', papel: 'Mãe (2º nível)', tipo: 'PF', doc: null, nivel: 2 }
];

const ARC_RESUMO_INDUSTRIA = [
    { id: 'no-industria', nome: 'Indústria Exemplo S.A.', papel: 'Titular (raiz)', tipo: 'PJ', doc: DOC_INDUSTRIA },
    { id: 'no-joao', nome: 'João da Silva', papel: 'Sócio-administrador', tipo: 'PF', doc: DOC_JOAO },
    { id: 'no-socio1', nome: 'Paulo Mendes', papel: 'Sócio (30%)', tipo: 'PF', doc: null },
    { id: 'no-socia2', nome: 'Fernanda Lima', papel: 'Sócia (20%)', tipo: 'PF', doc: null },
    { id: 'no-contadora', nome: 'Contábil Alfa', papel: 'Representante contábil', tipo: 'PJ', doc: null }
];

const ARC_COMPLETA_INDUSTRIA = [
    { id: 'no-industria', nome: 'Indústria Exemplo S.A.', papel: 'Titular (raiz)', tipo: 'PJ', doc: DOC_INDUSTRIA, nivel: 0 },
    { id: 'no-joao', nome: 'João da Silva', papel: 'Sócio-administrador (50%)', tipo: 'PF', doc: DOC_JOAO, nivel: 1 },
    { id: 'no-socio1', nome: 'Paulo Mendes', papel: 'Sócio (30%)', tipo: 'PF', doc: null, nivel: 1 },
    { id: 'no-socia2', nome: 'Fernanda Lima', papel: 'Sócia (20%)', tipo: 'PF', doc: null, nivel: 1 },
    { id: 'no-contadora', nome: 'Contábil Alfa', papel: 'Representante contábil', tipo: 'PJ', doc: null, nivel: 1 },
    { id: 'no-coligada', nome: 'Logística Exemplo Ltda.', papel: 'Coligada', tipo: 'PJ', doc: null, nivel: 2 },
    { id: 'no-maria', nome: 'Maria da Silva', papel: 'Cônjuge do sócio-administrador', tipo: 'PF', doc: null, nivel: 2 }
];

const ARC_RESUMO_SIMPLES = (raizNome, raizPapel, raizTipo, raizDoc) => [
    { id: 'no-raiz', nome: raizNome, papel: raizPapel, tipo: raizTipo, doc: raizDoc }
];

const ARC_COMPLETA_SIMPLES = (raizNome, raizPapel, raizTipo, raizDoc) => [
    { id: 'no-raiz', nome: raizNome, papel: raizPapel, tipo: raizTipo, doc: raizDoc, nivel: 0 }
];

const CLIENTES = {
    [DOC_JOAO]: {
        doc: DOC_JOAO,
        nome: 'João da Silva',
        tipoPessoa: 'Pessoa Física',
        documentoFormatado: '123.456.789-00',
        documentoMascarado: '***.***.***-00',
        segmento: 'Exclusivo',
        status: 'Ativo',
        canais: CANAIS_JOAO,
        saldoConsolidado: 'R$ 127.400,00',
        alerta: null,
        telefone: '(11) 99999-1234',
        email: 'joao.silva@email.com',
        clienteDesde: '03/02/2018',
        estadoCivil: 'Casado',
        filhos: '2',
        rating: '872',
        responsavel: 'Ricardo Alves',
        necessidade: { rotulo: 'Investimentos', icone: 'utility:moneybag' },
        jornada: { rotulo: 'Casa própria', icone: 'standard:household' },
        perfil: {
            contato: 'joao.silva@email.com • (11) 99999-1234',
            endereco: 'Rua das Flores, 123 — Jardins, São Paulo/SP',
            rendaScore: 'Renda R$ 18.500 • Score 872 (baixo risco)',
            agenciaConta: 'Ag 0001 • C/C 12345-6 • Cliente há 8 anos'
        },
        arcResumo: ARC_RESUMO_JOAO,
        arcCompleta: ARC_COMPLETA_JOAO,
        arcTotalVinculos: 24,
        ativos: ATIVOS_JOAO,
        casos: CASOS_JOAO,
        resumo: RESUMO_JOAO,
        comportamento: COMPORTAMENTO_JOAO,
        campanhas: CAMPANHAS_JOAO,
        metas: METAS_JOAO,
        tarefas: TAREFAS_JOAO,
        interacoes: INTERACOES_JOAO,
        acoes: ACOES_JOAO,
        fluxo: FLUXO_JOAO,
        segmentacao: SEGMENTACAO_JOAO
    },
    [DOC_INDUSTRIA]: {
        doc: DOC_INDUSTRIA,
        nome: 'Indústria Exemplo S.A.',
        tipoPessoa: 'Pessoa Jurídica',
        documentoFormatado: '12.ABC.345/0001-90',
        documentoMascarado: '**.***.***/0001-90',
        segmento: 'Empresarial',
        status: 'Ativo',
        canais: CANAIS_PADRAO,
        saldoConsolidado: 'R$ 460.900,00',
        alerta: null,
        telefone: '(11) 3333-4444',
        email: 'financeiro@industriaexemplo.com.br',
        clienteDesde: '12/06/2021',
        estadoCivil: '—',
        filhos: '—',
        rating: '810',
        responsavel: 'Paula Mendes',
        necessidade: { rotulo: 'Capital de giro', icone: 'utility:moneybag' },
        jornada: { rotulo: 'Expansão', icone: 'standard:account' },
        perfil: {
            contato: 'financeiro@industriaexemplo.com.br • (11) 3333-4444',
            endereco: 'Av. Industrial, 1500 — Barueri/SP',
            rendaScore: 'Faturamento R$ 2,4 mi/ano • Score 810',
            agenciaConta: 'Ag 0007 • C/C 98765-4 • Cliente há 5 anos'
        },
        arcResumo: ARC_RESUMO_INDUSTRIA,
        arcCompleta: ARC_COMPLETA_INDUSTRIA,
        arcTotalVinculos: 11,
        resumo: null,
        comportamento: null,
        campanhas: [],
        fluxo: null,
        segmentacao: null,
        metas: [],
        tarefas: [],
        interacoes: [],
        acoes: [],
        ativos: [
            {
                id: 'conta-industria-1',
                familia: 'CONTA',
                rotulo: 'Conta Empresarial',
                identificador: 'Ag 0007 • C/C 98765-4',
                situacao: 'Ativo',
                icone: 'custom:custom16',
                numero: 'Ag 0007 • C/C 98765-4',
                valor: 'R$ 340.900,00',
                encerramento: '—',
                ultimaMov: 'TED recebida hoje'
            },
            {
                id: 'invest-industria-1',
                familia: 'INVEST',
                rotulo: 'CDB Empresarial',
                identificador: '104% do CDI',
                situacao: 'Ativo',
                icone: 'standard:investment_account',
                numero: 'Conta 55021-8',
                valor: 'R$ 120.000 • +11,8% a.a.',
                encerramento: 'Vence em 06/2027',
                ultimaMov: 'Rendimento R$ 1.180'
            }
        ],
        casos: CASOS_PADRAO
    },
    [DOC_MARIA]: {
        doc: DOC_MARIA,
        nome: 'Maria Oliveira',
        tipoPessoa: 'Pessoa Física',
        documentoFormatado: '111.111.111-11',
        documentoMascarado: '***.***.***-11',
        segmento: 'Varejo',
        status: 'Ativo',
        canais: CANAIS_PADRAO,
        saldoConsolidado: 'R$ 2.140,00',
        alerta: null,
        telefone: '(11) 97777-8899',
        email: 'maria.oliveira@email.com',
        clienteDesde: '20/03/2024',
        estadoCivil: 'Solteira',
        filhos: '0',
        rating: '640',
        responsavel: 'Paula Mendes',
        necessidade: { rotulo: 'Conta do dia a dia', icone: 'utility:moneybag' },
        jornada: { rotulo: 'Reserva de emergência', icone: 'standard:household' },
        perfil: {
            contato: 'maria.oliveira@email.com • (11) 97777-8899',
            endereco: 'Rua Azul, 45 — Centro, São Paulo/SP',
            rendaScore: 'Renda R$ 4.200 • Score 640',
            agenciaConta: 'Ag 0001 • C/C 54321-0 • Cliente há 2 anos'
        },
        arcResumo: ARC_RESUMO_SIMPLES('Maria Oliveira', 'Titular', 'PF', DOC_MARIA),
        arcCompleta: ARC_COMPLETA_SIMPLES('Maria Oliveira', 'Titular', 'PF', DOC_MARIA),
        arcTotalVinculos: 1,
        resumo: null,
        comportamento: null,
        campanhas: [],
        fluxo: null,
        segmentacao: null,
        metas: [],
        tarefas: [],
        interacoes: [],
        acoes: [],
        ativos: [
            {
                id: 'conta-maria-1',
                familia: 'CONTA',
                rotulo: 'Conta Digital',
                identificador: 'Ag 0001 • C/C 54321-0',
                situacao: 'Ativo',
                icone: 'custom:custom16',
                numero: 'Ag 0001 • C/C 54321-0',
                valor: 'R$ 2.140,00',
                encerramento: '—',
                ultimaMov: 'Débito automático hoje'
            }
        ],
        casos: CASOS_PADRAO.slice(0, 2)
    },
    [DOC_CARLOS]: {
        doc: DOC_CARLOS,
        nome: 'Carlos Souza',
        tipoPessoa: 'Pessoa Física',
        documentoFormatado: '999.999.999-99',
        documentoMascarado: '***.***.***-99',
        segmento: 'Varejo',
        status: 'Ativo',
        canais: CANAIS_PADRAO,
        saldoConsolidado: 'R$ 8.020,35',
        alerta: null,
        telefone: '(11) 96666-7777',
        email: 'carlos.souza@email.com',
        clienteDesde: '10/01/2023',
        estadoCivil: 'Casado',
        filhos: '1',
        rating: '705',
        responsavel: 'Ricardo Alves',
        necessidade: { rotulo: 'Cartão de crédito', icone: 'utility:moneybag' },
        jornada: { rotulo: 'Troca de carro', icone: 'standard:household' },
        perfil: {
            contato: 'carlos.souza@email.com • (11) 96666-7777',
            endereco: 'Rua Verde, 78 — Moema, São Paulo/SP',
            rendaScore: 'Renda R$ 7.900 • Score 705',
            agenciaConta: 'Ag 0003 • C/C 77777-7 • Cliente há 3 anos'
        },
        arcResumo: ARC_RESUMO_SIMPLES('Carlos Souza', 'Titular', 'PF', DOC_CARLOS),
        arcCompleta: ARC_COMPLETA_SIMPLES('Carlos Souza', 'Titular', 'PF', DOC_CARLOS),
        arcTotalVinculos: 1,
        resumo: null,
        comportamento: null,
        campanhas: [],
        fluxo: null,
        segmentacao: null,
        metas: [],
        tarefas: [],
        interacoes: [],
        acoes: [],
        ativos: [
            {
                id: 'conta-carlos-1',
                familia: 'CONTA',
                rotulo: 'Conta Digital',
                identificador: 'Ag 0003 • C/C 77777-7',
                situacao: 'Ativo',
                icone: 'custom:custom16',
                numero: 'Ag 0003 • C/C 77777-7',
                valor: 'R$ 8.020,35',
                encerramento: '—',
                ultimaMov: 'Salário creditado dia 05'
            }
        ],
        casos: CASOS_PADRAO.slice(0, 2)
    }
};

/** Retorna o bloco cadastral/inventário da raiz (sem NBO — motor é consultado à parte). */
export function getVisao(docNormalizado) {
    return CLIENTES[docNormalizado] ?? null;
}

export function normalizarDocumento(valor) {
    return (valor ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// --- Motor NBO estático (safra vigente; RN-12: erro nunca exibe último estado) ---

/** Devolve as ofertas da raiz na hora, sem fetch (componente estático). */
export function getOfertas(docNormalizado) {
    if (docNormalizado === DOC_JOAO) {
        return OFERTAS_JOAO.map((o) => ({ ...o, estado: 'elegivel' }));
    }
    if (docNormalizado === DOC_CARLOS) {
        return OFERTAS_CARLOS.map((o) => ({ ...o, estado: 'elegivel' }));
    }
    return [];
}

/** Falha determinística do Carlos na 1ª carga do dia (EL-03). */
export function falhaMotorCarlos() {
    return { codigo: 'NBO_FORA', mensagem: 'Motor de propensão indisponível no momento.' };
}

// --- Simulação do core bancário (voláteis sob demanda + cache 180s + falha 1x) ---

const CACHE_TTL_MS = 180 * 1000;
const _detalheCache = new Map();
const _detalheTentativas = {};

export function fetchDetalheVolatil(ativoId, { forcar = false } = {}) {
    const agora = Date.now();
    const emCache = _detalheCache.get(ativoId);
    if (!forcar && emCache && agora - emCache.ts < CACHE_TTL_MS) {
        return Promise.resolve({ ...emCache.dados, doCache: true });
    }
    const tentativas = (_detalheTentativas[ativoId] ?? 0) + 1;
    _detalheTentativas[ativoId] = tentativas;
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Mock de falha parcial: 1ª consulta do consórcio do João falha (Cenário 9).
            if (ativoId === 'consorcio-joao-1' && tentativas === 1) {
                reject({ codigo: 'CORE_TIMEOUT', mensagem: 'Core bancário demorou a responder (timeout simulado).' });
                return;
            }
            const base = DETALHES_VOLATEIS[ativoId];
            if (!base) {
                reject({ codigo: 'DESCONHECIDO', mensagem: 'Ativo sem detalhe volátil no mock.' });
                return;
            }
            const dados = { ...base, atualizadoEm: new Date(), doCache: false };
            _detalheCache.set(ativoId, { dados, ts: Date.now() });
            resolve({ ...dados });
        }, 800);
    });
}

export function formatarHora(data) {
    if (!data) return '';
    const d = data instanceof Date ? data : new Date(data);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
