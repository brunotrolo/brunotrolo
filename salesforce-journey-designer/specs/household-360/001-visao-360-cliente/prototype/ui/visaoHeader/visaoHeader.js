import { LightningElement, api } from 'lwc';

/** Destaques 3 colunas — dono de P1/P2. Somente leitura, sem eventos. */
export default class VisaoHeader extends LightningElement {
    @api cliente = null;

    get temCanais() {
        return (this.cliente?.canais?.length ?? 0) > 0;
    }

    get completude() {
        return this.cliente?.resumo?.completude ?? '—';
    }

    get iniciaisResponsavel() {
        const nome = (this.cliente?.responsavel ?? '').trim().split(/\s+/);
        if (!nome.length) return '—';
        return (nome[0][0] + (nome.length > 1 ? nome[nome.length - 1][0] : '')).toUpperCase();
    }
}
