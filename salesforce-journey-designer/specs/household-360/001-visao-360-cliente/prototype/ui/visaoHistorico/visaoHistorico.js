import { LightningElement, api } from 'lwc';

/** Histórico de atendimentos — dono de P7. Tabela, somente leitura. */
export default class VisaoHistorico extends LightningElement {
    @api casos = [];

    get temCasos() {
        return (this.casos?.length ?? 0) > 0;
    }

    get casosApresentacao() {
        return (this.casos ?? []).map((c) => ({
            ...c,
            estrelas: '★'.repeat(c.satisfacao ?? 0) + '☆'.repeat(5 - (c.satisfacao ?? 0))
        }));
    }
}
