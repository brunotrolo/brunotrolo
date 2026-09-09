import { LightningElement, api } from 'lwc';
import getVisao from '@salesforce/apex/Visao360Controller.getVisao';

/** Destaques 3 colunas — standalone via recordId ou em shell via @api header. */
export default class Visao360Header extends LightningElement {
    @api recordId;
    @api header = null;
    @api completude = null;

    _visaoHeader = null;
    _visaoCompletude = null;
    _carregando = false;

    connectedCallback() {
        this._carregarSePreciso();
    }

    renderedCallback() {
        // recordId pode chegar depois do connectedCallback em FlexiPage
        if (this.recordId && !this._visaoHeader && !this._carregando && !this.header) {
            this._carregarSePreciso();
        }
    }

    async _carregarSePreciso() {
        if (!this.recordId || this.header || this._visaoHeader) return;
        this._carregando = true;
        try {
            const data = await getVisao({ accountId: this.recordId });
            if (data && !data.fault) {
                this._visaoHeader = data.header ?? null;
                this._visaoCompletude = data.completude ?? null;
            }
        } catch (e) {
            // fault já vem no DTO; exceção é só entrada inválida
        } finally {
            this._carregando = false;
        }
    }

    get headerResolvido() {
        return this.header ?? this._visaoHeader;
    }

    get completudeResolvida() {
        return this.completude ?? this._visaoCompletude;
    }

    get temCanais() {
        return (this.headerResolvido?.canais?.length ?? 0) > 0;
    }

    get completudeExibida() {
        return this.completudeResolvida ?? '—';
    }

    get iniciaisResponsavel() {
        const nome = (this.headerResolvido?.responsavel ?? '').trim().split(/\s+/).filter(Boolean);
        if (!nome.length || nome[0] === '—') return '—';
        return (nome[0][0] + (nome.length > 1 ? nome[nome.length - 1][0] : '')).toUpperCase();
    }
}
