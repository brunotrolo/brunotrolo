import { LightningElement, api } from 'lwc';

/** Financial Accounts — faixa de totais. Somente leitura, sem eventos. */
export default class VisaoContasResumo extends LightningElement {
    @api resumo = null;
    @api total = 0;
}
