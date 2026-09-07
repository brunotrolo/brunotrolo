import { LightningElement, api } from 'lwc';

/** Faixa de identificação — dono de P3. Somente leitura, sem eventos. */
export default class BuscaClienteHeaderSummary extends LightningElement {
    @api cliente = null;
    @api iconeTipoPessoa = 'standard:contact';
}
