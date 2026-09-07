import { LightningElement } from 'lwc';
import {
    DOC_PADRAO,
    DOC_CARLOS,
    getVisao,
    normalizarDocumento,
    getOfertas,
    falhaMotorCarlos,
    NBO_MOTOR,
    fetchDetalheVolatil,
    formatarHora
} from 'data/visao360';

const ORDEM_FAMILIAS = ['TODOS', 'CARTAO', 'CONTA', 'CONSORCIO', 'INVEST'];

const ABAS = [
    { id: 'resumo', rotulo: 'Resumo' },
    { id: 'inteligencia', rotulo: 'Inteligência' },
    { id: 'accounts', rotulo: 'Financial Accounts' },
    { id: 'goals', rotulo: 'Financial Goals' },
    { id: 'relacionamentos', rotulo: 'Relacionamentos' },
    { id: 'atividades', rotulo: 'Atividades' }
];

/**
 * Shell fino da Visão 360° — dono APENAS do estado/roteamento da página:
 * raiz (?doc=), aba ativa, flags de carga por área, ofertas NBO, sub-abas
 * paralelas de detalhe (máx. 2 lado a lado) e troca de raiz vinda da árvore.
 * Toda UI de domínio mora nos filhos (ui/visao*). O shell nunca renderiza
 * dado cadastral, ativo, oferta ou caso diretamente.
 */
export default class VisaoCliente extends LightningElement {
    docRaiz = DOC_PADRAO;
    cliente = null;
    abaAtiva = 'resumo';

    carregandoHeader = true;
    carregandoArc = true;
    carregandoAtivos = true;
    carregandoHistorico = true;
    nboErro = null;
    ofertas = [];
    nboMotor = NBO_MOTOR;

    selecionadoId = null;
    abasDetalhe = [];
    abaDetalheAtivaId = null;

    _token = 0;
    _nboVistos = new Set();

    connectedCallback() {
        this.docRaiz = this._lerDocDaUrl() ?? DOC_PADRAO;
        this._carregarRaiz(this.docRaiz);
    }

    _lerDocDaUrl() {
        try {
            const deSearch = new URLSearchParams(window.location.search).get('doc');
            if (deSearch) return normalizarDocumento(deSearch);
            const hash = window.location.hash ?? '';
            const qIndex = hash.indexOf('?');
            if (qIndex >= 0) {
                const deHash = new URLSearchParams(hash.slice(qIndex)).get('doc');
                if (deHash) return normalizarDocumento(deHash);
            }
        } catch (e) {
            // URL ilegível — cai no documento padrão.
        }
        return null;
    }

    _sincronizarUrl() {
        try {
            const url = new URL(window.location.href);
            url.searchParams.set('doc', this.docRaiz);
            window.history.replaceState({}, '', url);
        } catch (e) {
            // Ambiente sem History API — raiz segue válida só em memória.
        }
    }

    _carregarRaiz(doc) {
        const token = ++this._token;
        const visao = getVisao(doc) ?? getVisao(DOC_PADRAO);
        this.docRaiz = visao.doc;
        this.cliente = visao;
        this.abaAtiva = 'resumo';
        this._carregarNbo(this.docRaiz);
        this.selecionadoId = null;
        this.abasDetalhe = [];
        this.abaDetalheAtivaId = null;
        this.carregandoHeader = true;
        this.carregandoArc = true;
        this.carregandoAtivos = true;
        this.carregandoHistorico = true;
        this._sincronizarUrl();

        // Cenário 15 — cada área carrega independente, com indicação sutil.
        setTimeout(() => {
            if (token !== this._token) return;
            this.carregandoHeader = false;
        }, 400);
        setTimeout(() => {
            if (token !== this._token) return;
            this.carregandoArc = false;
        }, 700);
        setTimeout(() => {
            if (token !== this._token) return;
            this.carregandoAtivos = false;
        }, 1000);
        setTimeout(() => {
            if (token !== this._token) return;
            this.carregandoHistorico = false;
        }, 1100);
    }

    _carregarNbo(doc) {
        // NBO estático: entra com a raiz, sem spinner. Carlos na 1ª carga do
        // dia mostra o motor fora (EL-03/RN-12); o retry carrega na hora.
        if (doc === DOC_CARLOS && !this._nboVistos.has(doc)) {
            this.ofertas = [];
            this.nboErro = falhaMotorCarlos().mensagem;
            return;
        }
        this.ofertas = getOfertas(doc);
        this.nboErro = null;
    }

    // --- Leitura para os filhos (props IN) ---

    get abas() {
        return ABAS.map((a) => ({
            ...a,
            ativa: a.id === this.abaAtiva,
            classe: a.id === this.abaAtiva ? 'slds-tabs_default__item slds-is-active' : 'slds-tabs_default__item'
        }));
    }

    get ehAbaResumo() {
        return this.abaAtiva === 'resumo';
    }

    get ehAbaInteligencia() {
        return this.abaAtiva === 'inteligencia';
    }

    get ehAbaAccounts() {
        return this.abaAtiva === 'accounts';
    }

    get ehAbaGoals() {
        return this.abaAtiva === 'goals';
    }

    get ehAbaRelacionamentos() {
        return this.abaAtiva === 'relacionamentos';
    }

    get ehAbaAtividades() {
        return this.abaAtiva === 'atividades';
    }

    get resumo() {
        return this.cliente?.resumo ?? null;
    }

    get tags() {
        return this.cliente?.resumo?.tags ?? null;
    }

    get wellness() {
        return this.cliente?.resumo?.wellness ?? null;
    }

    get planejamento() {
        return this.cliente?.resumo?.planejamento ?? null;
    }

    get eventosVida() {
        return this.cliente?.resumo?.eventosVida ?? [];
    }

    get totalAtivos() {
        return this.cliente?.ativos?.length ?? 0;
    }

    get comportamento() {
        return this.cliente?.comportamento ?? null;
    }

    get campanhasLista() {
        return this.cliente?.campanhas ?? [];
    }

    get fluxo() {
        return this.cliente?.fluxo ?? null;
    }

    get segmentacao() {
        return this.cliente?.segmentacao ?? null;
    }

    get metasLista() {
        return this.cliente?.metas ?? [];
    }

    get tarefasLista() {
        return this.cliente?.tarefas ?? [];
    }

    get interacoesLista() {
        return this.cliente?.interacoes ?? [];
    }

    get acoesLista() {
        return this.cliente?.acoes ?? [];
    }

    get arcNos() {
        return this.cliente?.arcResumo ?? [];
    }

    get arcArvore() {
        return this.cliente?.arcCompleta ?? [];
    }

    get arcTotalVinculos() {
        return this.cliente?.arcTotalVinculos ?? 0;
    }

    get ativosLista() {
        return this.cliente?.ativos ?? [];
    }

    get casosLista() {
        return this.cliente?.casos ?? [];
    }

    get ordemFamilias() {
        return ORDEM_FAMILIAS;
    }

    get temDetalhes() {
        return this.abasDetalhe.length > 0;
    }

    get mostrarPlaceholderDetalhe() {
        return !this.carregandoAtivos && !this.temDetalhes;
    }

    get tamanhoPainelDetalhe() {
        // 1 detalhe ocupa a coluna; 2 dividem lado a lado no desktop (Cenário 16).
        return this.abasDetalhe.length > 1
            ? 'slds-col slds-size_1-of-1 slds-large-size_1-of-2'
            : 'slds-col slds-size_1-of-1';
    }

    // --- Eventos dos filhos (OUT → estado do shell) ---

    aoTrocarAba(event) {
        const id = event.currentTarget?.dataset?.id;
        if (id && ABAS.some((a) => a.id === id)) this.abaAtiva = id;
    }

    aoTrocarRaiz(event) {
        const doc = event.detail?.doc;
        if (doc && doc !== this.docRaiz) this._carregarRaiz(doc);
    }

    aoSelecionarAtivo(event) {
        const id = event.detail?.id;
        if (!id) return;
        this.selecionadoId = id;
        const aberta = this.abasDetalhe.find((a) => a.ativoId === id);
        if (aberta) {
            this.abaDetalheAtivaId = id;
            this._sincronizarAbaAtiva();
            return;
        }
        const ativo = this.ativosLista.find((a) => a.id === id);
        if (!ativo) return;
        // Cenário 16 — até 2 detalhes lado a lado; o 3º substitui o mais antigo.
        const proxima = [...this.abasDetalhe, { ativoId: id, ativo, detalhe: null, horaAtualizacao: '', carregando: true, erro: null, ativa: true, classeAba: '' }];
        while (proxima.length > 2) proxima.shift();
        this.abasDetalhe = proxima;
        this.abaDetalheAtivaId = id;
        this._sincronizarAbaAtiva();
        this._carregarDetalhe(id, false);
    }

    aoRecarregarDetalhe(event) {
        const id = event.detail?.id;
        if (id) this._carregarDetalhe(id, true);
    }

    aoFecharDetalhe(event) {
        const id = event.detail?.id ?? event.currentTarget?.dataset?.id;
        if (!id) return;
        this.abasDetalhe = this.abasDetalhe.filter((a) => a.ativoId !== id);
        if (this.selecionadoId === id) this.selecionadoId = null;
        if (this.abaDetalheAtivaId === id) {
            this.abaDetalheAtivaId = this.abasDetalhe.length ? this.abasDetalhe[this.abasDetalhe.length - 1].ativoId : null;
        }
        this._sincronizarAbaAtiva();
    }

    aoFocarDetalhe(event) {
        const id = event.currentTarget?.dataset?.id;
        if (!id) return;
        this.abaDetalheAtivaId = id;
        this._sincronizarAbaAtiva();
    }

    _sincronizarAbaAtiva() {
        this.abasDetalhe = this.abasDetalhe.map((a) => ({
            ...a,
            ativa: a.ativoId === this.abaDetalheAtivaId,
            classeAba:
                a.ativoId === this.abaDetalheAtivaId
                    ? 'slds-tabs_scoped__item slds-is-active c-subaba-cab'
                    : 'slds-tabs_scoped__item c-subaba-cab'
        }));
    }

    _carregarDetalhe(ativoId, forcar) {
        this.abasDetalhe = this.abasDetalhe.map((a) =>
            a.ativoId === ativoId ? { ...a, carregando: true, erro: null } : a
        );
        fetchDetalheVolatil(ativoId, { forcar }).then(
            (dados) => {
                this.abasDetalhe = this.abasDetalhe.map((a) =>
                    a.ativoId === ativoId
                        ? { ...a, detalhe: dados, horaAtualizacao: formatarHora(dados.atualizadoEm), carregando: false, erro: null }
                        : a
                );
            },
            (falha) => {
                // Cenário 9 — falha parcial: banner + retry no painel, resto navegável.
                this.abasDetalhe = this.abasDetalhe.map((a) =>
                    a.ativoId === ativoId
                        ? { ...a, carregando: false, erro: falha?.mensagem ?? 'Falha ao consultar o core bancário.' }
                        : a
                );
            }
        );
    }

    aoRecusarOferta(event) {
        const { ofertaId } = event.detail ?? {};
        if (!ofertaId) return;
        // Cenário 12 — some na hora; o registro em 2º plano é mock (ver README).
        this.ofertas = this.ofertas.filter((o) => o.id !== ofertaId);
    }

    aoContratarOferta(event) {
        const { ofertaId } = event.detail ?? {};
        if (!ofertaId) return;
        // Cenário 13 / RN-14 — marca negociação; a venda guiada é capacidade futura.
        this.ofertas = this.ofertas.map((o) => (o.id === ofertaId ? { ...o, estado: 'negociacao' } : o));
    }

    aoTentarNbo() {
        this._nboVistos.add(this.docRaiz);
        this._carregarNbo(this.docRaiz);
    }
}
