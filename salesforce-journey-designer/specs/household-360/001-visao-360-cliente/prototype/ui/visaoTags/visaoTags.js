import { LightningElement, api } from 'lwc';

/** Tags de interesse — busca, filtro e remoção locais (mock). Sem eventos. */
export default class VisaoTags extends LightningElement {
    @api tags = null;

    categoria = 'todas';
    busca = '';
    removidas = new Set();

    get temTags() {
        return Boolean(this.tags);
    }

    get opcoesCategoria() {
        return [
            { label: 'Todas as categorias', value: 'todas' },
            { label: 'Segmento', value: 'segmentos' },
            { label: 'Investimentos', value: 'investimentos' },
            { label: 'Estilo de vida', value: 'estilo' }
        ];
    }

    get gruposVisiveis() {
        if (!this.tags) return [];
        const termo = (this.busca ?? '').trim().toLowerCase();
        const todos = [
            { id: 'segmentos', rotulo: 'Segmento do cliente', icone: 'standard:groups' },
            { id: 'investimentos', rotulo: 'Investimentos', icone: 'utility:moneybag' },
            { id: 'estilo', rotulo: 'Estilo de vida', icone: 'utility:target' }
        ];
        return todos
            .filter((g) => this.categoria === 'todas' || g.id === this.categoria)
            .map((g) => ({
                ...g,
                tags: (this.tags[g.id] ?? []).filter(
                    (t) => !this.removidas.has(`${g.id}:${t}`) && (!termo || t.toLowerCase().includes(termo))
                )
            }))
            .filter((g) => g.tags.length > 0);
    }

    aoTrocarCategoria(event) {
        this.categoria = event.detail?.value ?? 'todas';
    }

    aoBuscar(event) {
        this.busca = event.target?.value ?? '';
    }

    aoFocarBusca() {
        this.template.querySelector('.c-tags_busca-texto')?.focus();
    }

    aoRemover(event) {
        const grupo = event.currentTarget?.dataset?.grupo;
        const tag = event.currentTarget?.dataset?.tag;
        if (grupo && tag) this.removidas = new Set(this.removidas).add(`${grupo}:${tag}`);
    }
}
