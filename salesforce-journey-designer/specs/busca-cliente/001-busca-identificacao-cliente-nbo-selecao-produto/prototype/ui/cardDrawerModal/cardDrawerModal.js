import LightningModal from 'lightning/modal';
import { api } from 'lwc';

export default class CardDrawerModal extends LightningModal {
    _vias = [];

    @api
    get vias() {
        return this._vias;
    }

    set vias(value) {
        // Matte minimalista: card branco, contorno pastel na cor do plástico
        this._vias = (value ?? []).map((v) => ({
            ...v,
            estiloCartao: `background:#ffffff;color:${v.corTexto};border:1px solid ${v.corBorda};border-left:4px solid ${v.corBorda}`,
            estiloTexto: `color:${v.corTexto}`,
            estiloLogo: `color:${v.corBorda}`,
            badgeVariant: v.situacao === 'Ativo' ? 'success' : v.situacao === 'Cancelado' ? 'inverse' : 'warning',
            ariaLabel: `${v.bandeira} ${v.categoria} final ${v.final} ${v.situacao} ${v.portador}`
        }));
    }

    aoEscolherVia(event) {
        const id = event.currentTarget.dataset.id;
        const via = (this._vias ?? []).find((v) => v.id === id) ?? null;
        // Retorna o objeto original sem os campos de estilo extras
        const original = (this.vias ?? []).find((v) => v.id === id) ?? via;
        this.close(original);
    }

    aoCancelar() {
        this.close(undefined);
    }
}
