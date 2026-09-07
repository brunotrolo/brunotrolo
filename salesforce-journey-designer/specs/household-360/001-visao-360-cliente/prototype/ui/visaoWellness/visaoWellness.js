import { LightningElement, api } from 'lwc';

/** Saúde financeira — nota + evolução em barras. Somente leitura, sem eventos. */
export default class VisaoWellness extends LightningElement {
    @api wellness = null;

    get barras() {
        return (this.wellness?.barras ?? []).map((valor, indice) => ({
            indice,
            estilo: `height: ${valor}%;`,
            titulo: `Mês ${indice + 1}: ${valor}`
        }));
    }

    get estiloMedia() {
        const valores = this.wellness?.barras ?? [];
        if (!valores.length) return 'bottom: 0%;';
        const media = valores.reduce((soma, v) => soma + v, 0) / valores.length;
        return `bottom: ${media}%;`;
    }
}
