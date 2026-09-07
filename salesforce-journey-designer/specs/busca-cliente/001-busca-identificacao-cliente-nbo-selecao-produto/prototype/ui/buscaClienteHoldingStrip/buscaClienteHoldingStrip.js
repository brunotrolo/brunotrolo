import { LightningElement, api } from 'lwc';

/** Faixa Holding — dono de P5. Somente leitura, sem eventos. */
export default class BuscaClienteHoldingStrip extends LightningElement {
    @api holding = [];
}
