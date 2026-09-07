import { LightningElement, api } from 'lwc';

/** Próxima melhor ação (NBA) — recomendações com CTA; estado local (mock). */
export default class VisaoProximaAcao extends LightningElement {
    @api acoes = [];

    iniciadas = new Set();

    get temAcoes() {
        return (this.acoes?.length ?? 0) > 0;
    }

    get acoesEstado() {
        return (this.acoes ?? []).map((a, indice) => ({
            ...a,
            ehPrimeira: indice === 0,
            iniciada: this.iniciadas.has(a.id)
        }));
    }

    aoIniciar(event) {
        const id = event.currentTarget?.dataset?.id;
        if (!id) return;
        this.iniciadas = new Set(this.iniciadas).add(id);
    }
}
