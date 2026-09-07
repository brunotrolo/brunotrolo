import { LightningElement, api } from 'lwc';

const CIRCUNFERENCIA = 2 * Math.PI * 34;

/** Financial Goals — cartões de objetivo com donut. Somente leitura, sem eventos. */
export default class VisaoMetas extends LightningElement {
    @api metas = [];

    recolhidas = new Set();

    get temMetas() {
        return (this.metas?.length ?? 0) > 0;
    }

    get metasEstado() {
        return (this.metas ?? []).map((m) => {
            const pct = Math.min(100, Math.max(0, m.percentual ?? 0));
            const arco = ((pct / 100) * CIRCUNFERENCIA).toFixed(1);
            return {
                ...m,
                expandida: !this.recolhidas.has(m.id),
                traco: `${arco} ${CIRCUNFERENCIA.toFixed(1)}`,
                rotuloDonut: `${m.percentual}% do alvo de ${m.alvo}`
            };
        });
    }

    aoAlternarMeta(event) {
        const id = event.currentTarget?.dataset?.id;
        if (!id) return;
        const proximas = new Set(this.recolhidas);
        if (proximas.has(id)) proximas.delete(id);
        else proximas.add(id);
        this.recolhidas = proximas;
    }
}
