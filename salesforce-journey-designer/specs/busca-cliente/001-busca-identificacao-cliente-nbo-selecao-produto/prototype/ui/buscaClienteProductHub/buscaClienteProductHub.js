import { LightningElement, api } from 'lwc';

/**
 * Hub de produtos — dono de P4/P7.
 * Entrada: @api produtos (com selecionado/selo/classeCartao calculados pelo shell).
 * Saída: evento `productselect` { tipo }. Não abre modal nem fixa contexto.
 */
export default class BuscaClienteProductHub extends LightningElement {
    @api produtos = [];

    get temProdutos() {
        return (this.produtos?.length ?? 0) > 0;
    }

    aoSelecionar(event) {
        this.dispatchEvent(
            new CustomEvent('productselect', {
                detail: { tipo: event.currentTarget.dataset.tipo }
            })
        );
    }
}
