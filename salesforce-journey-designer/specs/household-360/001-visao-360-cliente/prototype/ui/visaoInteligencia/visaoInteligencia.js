import { LightningElement, api } from 'lwc';

const ICONE_STATUS = {
    ok: 'utility:success',
    falha: 'utility:clear',
    pendente: 'utility:warning'
};

const POR_PAGINA_ACESSOS = 3;

/** Aba Inteligência — fluxo, segmentação, comportamento e campanhas. Somente leitura, sem eventos. */
export default class VisaoInteligencia extends LightningElement {
    @api comportamento = null;
    @api campanhas = [];
    @api fluxo = null;
    @api segmentacao = null;

    canal = 'site';
    acessosExpandidos = new Set();
    limiteAcessos = POR_PAGINA_ACESSOS;
    secoesAbertas = new Set(['comportamento']);

    get temComportamento() {
        return Boolean(this.comportamento);
    }

    get temCampanhas() {
        return (this.campanhas?.length ?? 0) > 0;
    }

    get campanhasApresentacao() {
        return (this.campanhas ?? []).map((c) => ({
            ...c,
            iconePrimeira: ICONE_STATUS[c.primeira] ?? ICONE_STATUS.pendente,
            iconeFinal: ICONE_STATUS[c.final] ?? ICONE_STATUS.pendente,
            iconeOportunidade: ICONE_STATUS[c.oportunidade] ?? ICONE_STATUS.pendente
        }));
    }

    // --- Accordion SLDS: comportamento abre expandido, campanhas recolhida ---

    get secoesAbertasLista() {
        return [...this.secoesAbertas];
    }

    aoAlternarSecao(event) {
        this.secoesAbertas = new Set(event.detail?.openSections ?? []);
    }

    get filtrosCanal() {
        const base = [
            { id: 'site', rotulo: 'Site' },
            { id: 'app', rotulo: 'Aplicativo' }
        ];
        return base.map((f) => ({
            ...f,
            ativo: this.canal === f.id,
            classe: f.id === this.canal ? 'c-subaba c-subaba_ativa' : 'c-subaba'
        }));
    }

    get acessosFiltrados() {
        const lista = this.canal === 'app' ? (this.comportamento?.app ?? []) : (this.comportamento?.site ?? []);
        return lista;
    }

    get acessosVisiveis() {
        return this.acessosFiltrados.slice(0, this.limiteAcessos).map((a) => ({
            ...a,
            expandido: this.acessosExpandidos.has(a.quando)
        }));
    }

    get temMaisAcessos() {
        return this.acessosFiltrados.length > this.limiteAcessos;
    }

    get restantesAcessos() {
        return this.acessosFiltrados.length - this.limiteAcessos;
    }

    get paginadoAcessos() {
        return this.limiteAcessos > POR_PAGINA_ACESSOS;
    }

    aoFiltrarCanal(event) {
        const id = event.currentTarget?.dataset?.id;
        if (!id) return;
        this.canal = id;
        this.limiteAcessos = POR_PAGINA_ACESSOS;
    }

    aoAlternarAcesso(event) {
        const id = event.currentTarget?.dataset?.id;
        if (!id) return;
        const proximos = new Set(this.acessosExpandidos);
        if (proximos.has(id)) proximos.delete(id);
        else proximos.add(id);
        this.acessosExpandidos = proximos;
    }

    aoVerMaisAcessos() {
        this.limiteAcessos = this.acessosFiltrados.length;
    }

    aoVerMenosAcessos() {
        this.limiteAcessos = POR_PAGINA_ACESSOS;
    }
}
