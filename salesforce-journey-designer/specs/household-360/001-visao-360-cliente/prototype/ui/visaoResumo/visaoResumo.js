import { LightningElement, api } from 'lwc';

/** Aba Resumo — dono da apresentação de KPIs/eventos/tags/wellness. Somente leitura, sem eventos. */
export default class VisaoResumo extends LightningElement {
    @api resumo = null;

    get temResumo() {
        return Boolean(this.resumo);
    }
}
