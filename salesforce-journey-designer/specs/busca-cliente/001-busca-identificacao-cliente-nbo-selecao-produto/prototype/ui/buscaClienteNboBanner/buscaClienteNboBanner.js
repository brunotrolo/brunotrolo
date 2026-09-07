import { LightningElement, api } from 'lwc';

/**
 * Banner NBO — dono de P6.
 * Entrada: @api ofertaAtiva (+ flags de estado vindas do shell).
 * Saída: eventos `abordar` / `dispensar` (sem payload — o shell detém o estado).
 */
export default class BuscaClienteNboBanner extends LightningElement {
    @api ofertaAtiva = null;
    @api mostrarOfertaEmAbordagem = false;
    @api mostrarOfertaDispensada = false;
    @api mostrarAvisoOfertasIndisponiveis = false;

    get temOfertaIdentificada() {
        return this.ofertaAtiva !== null && this.ofertaAtiva.estado === 'identificada';
    }

    aoAbordar() {
        this.dispatchEvent(new CustomEvent('abordar'));
    }

    aoDispensar() {
        this.dispatchEvent(new CustomEvent('dispensar'));
    }
}
