import LightningModal from 'lightning/modal';
import { api } from 'lwc';

export default class InvestimentoDrawerModal extends LightningModal {
    _investimentos = [];

    @api
    get investimentos() {
        return this._investimentos;
    }

    set investimentos(value) {
        // Matte minimalista: card branco, contorno pastel na cor da classe
        this._investimentos = (value ?? []).map((inv) => ({
            ...inv,
            estiloCartao: `background:#ffffff;color:${inv.corTexto};border:1px solid ${inv.corBorda};border-left:4px solid ${inv.corBorda}`,
            estiloTexto: `color:${inv.corTexto}`,
            ariaLabel: `${inv.classe} ${inv.produto} ${inv.valor} ${inv.rentabilidade}`
        }));
    }

    aoEscolherInvestimento(event) {
        const id = event.currentTarget.dataset.id;
        const inv = (this._investimentos ?? []).find((i) => i.id === id) ?? null;
        this.close(inv);
    }

    aoCancelar() {
        this.close(undefined);
    }
}
