import { LightningElement, api } from 'lwc';

const ICONE_TIPO = {
    email: 'action:email',
    ligacao: 'action:call',
    tarefa: 'standard:task',
    chat: 'utility:chat'
};

const ROTULO_TIPO = {
    email: 'E-mail',
    ligacao: 'Ligação',
    tarefa: 'Tarefa',
    chat: 'Chat'
};

const POR_PAGINA = 4;

/** Linha do tempo — grade responsiva com filtro, expansão e paginação. Somente leitura. */
export default class VisaoAtividades extends LightningElement {
    @api interacoes = [];

    filtro = 'todos';
    expandidos = new Set();
    limite = POR_PAGINA;

    get temInteracoes() {
        return (this.interacoes?.length ?? 0) > 0;
    }

    get filtros() {
        const tipos = [...new Set((this.interacoes ?? []).map((i) => i.tipo))];
        return [{ id: 'todos', rotulo: 'Todas', ativo: this.filtro === 'todos', classe: this._classeFiltro('todos') }].concat(
            tipos.map((t) => ({
                id: t,
                rotulo: ROTULO_TIPO[t] ?? t,
                ativo: this.filtro === t,
                classe: this._classeFiltro(t)
            }))
        );
    }

    get interacoesFiltradas() {
        const lista = this.interacoes ?? [];
        return this.filtro === 'todos' ? lista : lista.filter((i) => i.tipo === this.filtro);
    }

    get interacoesVisiveis() {
        return this.interacoesFiltradas.slice(0, this.limite).map((i) => ({
            ...i,
            icone: ICONE_TIPO[i.tipo] ?? 'action:info',
            rotuloTipo: ROTULO_TIPO[i.tipo] ?? i.tipo,
            expandido: this.expandidos.has(i.id),
            rotuloVerMais: this.expandidos.has(i.id) ? 'Ver menos' : 'Ver mais'
        }));
    }

    get temMais() {
        return this.interacoesFiltradas.length > this.limite;
    }

    get restantes() {
        return this.interacoesFiltradas.length - this.limite;
    }

    get paginado() {
        return this.limite > POR_PAGINA;
    }

    aoFiltrar(event) {
        const id = event.currentTarget?.dataset?.id;
        if (!id) return;
        this.filtro = id;
        this.limite = POR_PAGINA;
    }

    aoAlternarDetalhe(event) {
        const id = event.currentTarget?.dataset?.id;
        if (!id) return;
        const proximos = new Set(this.expandidos);
        if (proximos.has(id)) proximos.delete(id);
        else proximos.add(id);
        this.expandidos = proximos;
    }

    aoVerMais() {
        this.limite = this.interacoesFiltradas.length;
    }

    aoVerMenos() {
        this.limite = POR_PAGINA;
    }

    _classeFiltro(id) {
        return id === this.filtro ? 'c-timeline-filtro c-timeline-filtro_ativo' : 'c-timeline-filtro';
    }
}
