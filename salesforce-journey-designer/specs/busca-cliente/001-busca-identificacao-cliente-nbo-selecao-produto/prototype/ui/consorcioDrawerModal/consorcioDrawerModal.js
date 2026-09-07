import LightningModal from 'lightning/modal';
import { api } from 'lwc';

export default class ConsorcioDrawerModal extends LightningModal {
    _cotas = [];

    @api
    get cotas() {
        return this._cotas;
    }

    set cotas(value) {
        // Matte minimalista: card branco, contorno pastel na cor do grupo
        this._cotas = (value ?? []).map((c) => ({
            ...c,
            estiloCartao: `background:#ffffff;color:${c.corTexto};border:1px solid ${c.corBorda};border-left:4px solid ${c.corBorda}`,
            estiloTexto: `color:${c.corTexto}`,
            ariaLabel: `${c.tipo} Grupo ${c.grupo} Cota ${c.cota} ${c.valor} ${c.status}`
        }));
    }

    aoEscolherCota(event) {
        const id = event.currentTarget.dataset.id;
        const cota = (this._cotas ?? []).find((c) => c.id === id) ?? null;
        this.close(cota);
    }

    aoCancelar() {
        this.close(undefined);
    }
}
