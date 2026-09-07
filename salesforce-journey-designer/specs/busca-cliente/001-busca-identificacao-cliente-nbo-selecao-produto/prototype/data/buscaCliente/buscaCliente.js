/**
 * Fixture data para busca-cliente/001 — melhorias pedidas:
 * - Oportunidade Black com narrativa completa (bandeiras, limites, anuidade)
 * - Holding expandido com iconografia
 * - Sem Recentes (removido)
 */

export const OFERTA_BLACK_DETALHE = {
    id: 'nbo-black',
    produto: 'Cartão Black',
    titulo: 'Oportunidade identificada: Cartão Black Porto Bank',
    narrativa:
        'Cliente elegível para upgrade para o Cartão Black — isento de anuidade no 1º ano e com benefícios exclusivos de concierge, sala VIP e cashback ampliado. A oferta foi identificada pelo motor de propensão com base no relacionamento e no histórico de uso.',
    beneficio: 'Isenção de anuidade no 1º ano',
    beneficios: [
        'Isenção total da anuidade no 1º ano',
        'Acesso a salas VIP LoungeKey + concierge 24h',
        'Cashback de 1,5% em todas as compras'
    ],
    bandeiras: [
        { nome: 'Visa Infinite', logo: 'utility:card_details', cor: '#1a1a1a' },
        { nome: 'Mastercard Black', logo: 'utility:card_details', cor: '#0f0f0f' }
    ],
    limites: 'Limite pré-aprovado de R$ 15.000 a R$ 50.000 (sujeito a análise)',
    anuidade: '12x de R$ 98,00 — isento no 1º ano',
    estado: 'identificada'
};

const VIAS_CARTAO_JOAO = [
    {
        id: 'via-1234',
        bandeira: 'Visa',
        categoria: 'Infinite',
        final: '1234',
        portador: 'João da Silva',
        titularidade: 'Titular',
        situacao: 'Ativo',
        iconeSituacao: 'utility:success',
        // Matte minimalista: card branco com contorno pastel (tom do plástico)
        corBorda: '#9db8d2',
        corTexto: '#2e2e2e',
        logoBandeira: 'VISA',
        limite: 'R$ 28.000',
        anuidade: 'Isento'
    },
    {
        id: 'via-5678',
        bandeira: 'Mastercard',
        categoria: 'Platinum',
        final: '5678',
        portador: 'João da Silva',
        titularidade: 'Titular',
        situacao: 'Cancelado',
        iconeSituacao: 'utility:ban',
        corBorda: '#c9c9c9',
        corTexto: '#5c5c5c',
        logoBandeira: 'MASTERCARD',
        limite: '—',
        anuidade: '—'
    },
    {
        id: 'via-9012',
        bandeira: 'Visa',
        categoria: 'Gold',
        final: '9012',
        portador: 'Maria da Silva',
        titularidade: 'Adicional',
        situacao: 'Ativo',
        iconeSituacao: 'utility:success',
        corBorda: '#d9c27a',
        corTexto: '#2e2e2e',
        logoBandeira: 'VISA',
        limite: 'R$ 8.000',
        anuidade: '12x R$ 32,00'
    },
    {
        id: 'via-3456',
        bandeira: 'Mastercard',
        categoria: 'Black',
        final: '3456',
        portador: 'João da Silva',
        titularidade: 'Titular',
        situacao: 'Bloqueado',
        iconeSituacao: 'utility:warning',
        corBorda: '#e8b26a',
        corTexto: '#2e2e2e',
        logoBandeira: 'MASTERCARD',
        limite: 'R$ 42.000',
        anuidade: '12x R$ 98,00'
    }
];

const COTAS_CONSORCIO_JOAO = [
    {
        id: 'cota-imovel-001',
        tipo: 'Imóvel',
        grupo: '1234',
        cota: '045',
        valor: 'R$ 350.000',
        status: 'Ativa',
        contemplada: 'Não contemplada',
        parcela: 'R$ 1.420/mês',
        icone: 'utility:home',
        corBorda: '#a8c3e0',
        corTexto: '#2e2e2e',
        badge: 'Ativa'
    },
    {
        id: 'cota-veiculo-002',
        tipo: 'Veículo',
        grupo: '5678',
        cota: '012',
        valor: 'R$ 85.000',
        status: 'Ativa',
        contemplada: 'Contemplada',
        parcela: 'R$ 680/mês',
        icone: 'utility:truck',
        corBorda: '#a9d3b8',
        corTexto: '#2e2e2e',
        badge: 'Contemplada'
    },
    {
        id: 'cota-rural-003',
        tipo: 'Rural',
        grupo: '9012',
        cota: '007',
        valor: 'R$ 220.000',
        status: 'Ativa',
        contemplada: 'Não contemplada',
        parcela: 'R$ 980/mês',
        icone: 'utility:contract_doc',
        corBorda: '#d8c49a',
        corTexto: '#2e2e2e',
        badge: 'Ativa'
    },
    {
        id: 'cota-rural-004',
        tipo: 'Rural',
        grupo: '9012',
        cota: '008',
        valor: 'R$ 220.000',
        status: 'Ativa',
        contemplada: 'Não contemplada',
        parcela: 'R$ 980/mês',
        icone: 'utility:contract_doc',
        corBorda: '#d8c49a',
        corTexto: '#2e2e2e',
        badge: 'Mesmo grupo'
    },
    {
        id: 'cota-imovel-005',
        tipo: 'Imóvel',
        grupo: '1234',
        cota: '089',
        valor: 'R$ 500.000',
        status: 'Ativa',
        contemplada: 'Contemplada',
        parcela: 'R$ 2.100/mês',
        icone: 'utility:home',
        corBorda: '#a8c3e0',
        corTexto: '#2e2e2e',
        badge: 'Contemplada'
    },
    {
        id: 'cota-veiculo-006',
        tipo: 'Veículo',
        grupo: '5678',
        cota: '034',
        valor: 'R$ 120.000',
        status: 'Cancelada',
        contemplada: '—',
        parcela: '—',
        icone: 'utility:ban',
        corBorda: '#c9c9c9',
        corTexto: '#5c5c5c',
        badge: 'Cancelada'
    }
];

const INVESTIMENTOS_JOAO = [
    {
        id: 'inv-rf-001',
        classe: 'Renda Fixa',
        produto: 'CDB Porto Bank',
        detalhe: 'Pós-fixado • 102% do CDI',
        valor: 'R$ 18.000',
        rentabilidade: '+11,2% a.a.',
        vencimento: 'Vence em 12/2027',
        risco: 'Baixo',
        icone: 'utility:money',
        corBorda: '#a8c3e0',
        corTexto: '#2e2e2e',
        badge: 'Renda Fixa'
    },
    {
        id: 'inv-rf-002',
        classe: 'Renda Fixa',
        produto: 'Tesouro Direto Selic 2029',
        detalhe: 'Título público • Liquidez diária',
        valor: 'R$ 9.500',
        rentabilidade: 'Selic + 0,1% a.a.',
        vencimento: 'Vence em 03/2029',
        risco: 'Baixo',
        icone: 'utility:money',
        corBorda: '#a8c3e0',
        corTexto: '#2e2e2e',
        badge: 'Renda Fixa'
    },
    {
        id: 'inv-cdb-003',
        classe: 'CDB',
        produto: 'CDB Prefixado 2 anos',
        detalhe: 'Prefixado • 12,4% a.a.',
        valor: 'R$ 6.000',
        rentabilidade: '12,4% a.a.',
        vencimento: 'Vence em 06/2027',
        risco: 'Baixo',
        icone: 'utility:contract_doc',
        corBorda: '#b9a7d9',
        corTexto: '#2e2e2e',
        badge: 'CDB'
    },
    {
        id: 'inv-rv-004',
        classe: 'Renda Variável',
        produto: 'Fundo de Ações Dividendos',
        detalhe: 'Cota atual R$ 4,82 • +18% em 12m',
        valor: 'R$ 5.200',
        rentabilidade: '+18,3% em 12m',
        vencimento: 'Resgate D+2',
        risco: 'Alto',
        icone: 'standard:investment_account',
        corBorda: '#a9d3b8',
        corTexto: '#2e2e2e',
        badge: 'Renda Variável'
    },
    {
        id: 'inv-fundo-005',
        classe: 'Fundos',
        produto: 'Fundo Multimercado Equilíbrio',
        detalhe: 'Taxa adm 0,8% a.a. • Sem taxa de performance',
        valor: 'R$ 3.300',
        rentabilidade: '+9,6% em 12m',
        vencimento: 'Resgate D+1',
        risco: 'Moderado',
        icone: 'utility:chart',
        corBorda: '#e8c98a',
        corTexto: '#2e2e2e',
        badge: 'Fundos'
    }
];

const HOLDING_EXPANDIDO = [
    { nome: 'Seguro Auto', detalhe: 'Apólice vigente • Cobertura completa', icone: 'utility:truck' },
    { nome: 'Seguro Residencial', detalhe: 'Apólice vigente • Incêndio e roubo', icone: 'utility:home' },
    { nome: 'Seguro de Vida', detalhe: 'Capital segurado R$ 250.000', icone: 'utility:people' },
    { nome: 'Plano de Saúde', detalhe: 'Titular + 2 dependentes • Rede premium', icone: 'utility:co_insurance' },
    { nome: 'Plano Odontológico', detalhe: 'Titular • Cobertura nacional', icone: 'utility:like' },
    { nome: 'Previdência Privada', detalhe: 'PGBL • Aporte mensal R$ 800', icone: 'utility:money' },
    { nome: 'Consórcio Imobiliário', detalhe: 'Carta contemplada • R$ 300.000', icone: 'utility:contract_doc' },
    { nome: 'Investimentos', detalhe: 'Carteira diversificada • R$ 85.000', icone: 'standard:investment_account' }
];

const CLIENTES = {
    // PF com carteira completa + NBO Black detalhada — dados cadastrais enriquecidos
    '12345678900': {
        nome: 'João da Silva',
        tipoPessoa: 'Pessoa Física',
        documentoFormatado: '123.456.789-00',
        segmento: 'Exclusivo',
        dataNascimento: '12/03/1985 • 40 anos',
        email: 'joao.silva@email.com',
        telefone: '(11) 99999-1234',
        celular: '(11) 98888-5678',
        endereco: 'Rua das Flores, 123 — Jardins, São Paulo/SP',
        cep: '01234-567',
        agencia: '0001 — Jardins',
        conta: '12345-6',
        renda: 'R$ 18.500',
        tempoRelacionamento: 'Cliente há 8 anos',
        statusCadastro: 'Cadastro atualizado em 15/08/2026',
        score: 'Score interno 872 — Baixo risco',
        produtos: [
            {
                tipo: 'CARTAO',
                nome: 'Cartão de Crédito',
                resumo: '4 plásticos',
                icone: 'utility:card_details',
                exigeSubselecao: true,
                vias: VIAS_CARTAO_JOAO
            },
            {
                tipo: 'CONTA',
                nome: 'Conta Digital',
                resumo: 'Ativa • Ag 0001',
                icone: 'custom:custom16',
                exigeSubselecao: false
            },
            {
                tipo: 'CONSORCIO',
                nome: 'Consórcio',
                resumo: '6 cotas • Imóvel, Veículo e Rural',
                icone: 'utility:contract_doc',
                exigeSubselecao: true,
                cotas: COTAS_CONSORCIO_JOAO
            },
            {
                tipo: 'INVESTIMENTOS',
                nome: 'Investimentos',
                resumo: '5 posições • Renda fixa, CDB e fundos',
                icone: 'standard:investment_account',
                exigeSubselecao: true,
                investimentos: INVESTIMENTOS_JOAO
            }
        ],
        holding: HOLDING_EXPANDIDO.slice(0, 6),
        ofertas: [{ ...OFERTA_BLACK_DETALHE }]
    },
    // PJ sem ofertas
    '12ABC345000190': {
        nome: 'Indústria Exemplo S.A.',
        tipoPessoa: 'Pessoa Jurídica',
        documentoFormatado: '12.ABC.345/0001-90',
        segmento: 'Empresarial',
        produtos: [
            {
                tipo: 'CONTA',
                nome: 'Conta Digital',
                resumo: 'Ativa',
                icone: 'custom:custom16',
                exigeSubselecao: false
            },
            {
                tipo: 'INVESTIMENTOS',
                nome: 'Investimentos',
                resumo: 'R$ 120.000',
                icone: 'standard:investment_account',
                exigeSubselecao: false
            }
        ],
        holding: HOLDING_EXPANDIDO.slice(0, 2).map(h=>({...h, detalhe: h.detalhe + ' • PJ'})),
        ofertas: []
    },
    // Só Holding
    '11111111111': {
        nome: 'Maria Oliveira',
        tipoPessoa: 'Pessoa Física',
        documentoFormatado: '111.111.111-11',
        segmento: 'Varejo',
        produtos: [],
        holding: HOLDING_EXPANDIDO.slice(0, 4),
        ofertas: []
    },
    // Falha parcial NBO
    '99999999999': {
        nome: 'Carlos Souza',
        tipoPessoa: 'Pessoa Física',
        documentoFormatado: '999.999.999-99',
        segmento: 'Varejo',
        produtos: [
            {
                tipo: 'CONTA',
                nome: 'Conta Digital',
                resumo: 'Ativa',
                icone: 'custom:custom16',
                exigeSubselecao: false
            }
        ],
        holding: HOLDING_EXPANDIDO.slice(0, 1),
        ofertas: null
    }
};

export function getCliente(normalizado) {
    return CLIENTES[normalizado] ?? null;
}

export function normalizarDocumento(valor) {
    return (valor ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function ehCpfValido(normalizado) {
    return /^[0-9]{11}$/.test(normalizado);
}

export function ehCnpjValido(normalizado) {
    return /^[A-Z0-9]{14}$/.test(normalizado);
}

export function aplicarMascara(valor, tipoPessoa) {
    const limpo = normalizarDocumento(valor);
    if (tipoPessoa === 'PJ') {
        const p1 = limpo.slice(0, 2);
        const p2 = limpo.slice(2, 5);
        const p3 = limpo.slice(5, 8);
        const p4 = limpo.slice(8, 12);
        const p5 = limpo.slice(12, 14);
        let out = p1;
        if (p2) out += `.${p2}`;
        if (p3) out += `.${p3}`;
        if (p4) out += `/${p4}`;
        if (p5) out += `-${p5}`;
        return out;
    }
    const p1 = limpo.slice(0, 3);
    const p2 = limpo.slice(3, 6);
    const p3 = limpo.slice(6, 9);
    const p4 = limpo.slice(9, 11);
    let out = p1;
    if (p2) out += `.${p2}`;
    if (p3) out += `.${p3}`;
    if (p4) out += `-${p4}`;
    return out;
}

export function mascararDocumento(formatado) {
    if (!formatado) return '';
    return formatado.slice(0, -2).replace(/[A-Za-z0-9]/g, '*') + formatado.slice(-2);
}
