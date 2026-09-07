import { LightningElement, api } from 'lwc';
import {
    normalizarDocumento,
    ehCpfValido,
    ehCnpjValido,
    aplicarMascara
} from 'data/buscaCliente';

const OPCOES_TIPO_PESSOA = [
    { label: 'PF', value: 'PF' },
    { label: 'PJ', value: 'PJ' },
    { label: 'Protocolo', value: 'PROTOCOLO' },
    { label: 'Não cliente', value: 'NAO_CLIENTE' }
];

/**
 * Barra de busca — dono de P1.
 * Contrato de saída: evento `buscar` { tipo, normalizado }.
 * Não conhece resultado, hub, oferta ou modais.
 */
export default class BuscaClienteSearchBar extends LightningElement {
    tipoPessoa = 'PF';
    documentoDigitado = '';
    _f2Handler = null;

    opcoesTipoPessoa = OPCOES_TIPO_PESSOA;

    connectedCallback() {
        this._f2Handler = (event) => {
            if (event.key === 'F2') {
                event.preventDefault();
                this.focusInput();
            }
        };
        window.addEventListener('keydown', this._f2Handler);
        setTimeout(() => this.focusInput(), 0);
    }

    disconnectedCallback() {
        if (this._f2Handler) window.removeEventListener('keydown', this._f2Handler);
    }

    @api
    focusInput() {
        const el = this.template.querySelector('lightning-input');
        if (el) el.focus();
    }

    @api
    limpar() {
        this.documentoDigitado = '';
        setTimeout(() => this.focusInput(), 0);
    }

    get documentoNormalizado() {
        return normalizarDocumento(this.documentoDigitado);
    }

    get buscaDesabilitada() {
        const doc = this.documentoNormalizado;
        if (this.tipoPessoa === 'PF') return !ehCpfValido(doc);
        if (this.tipoPessoa === 'PJ') return !ehCnpjValido(doc);
        if (this.tipoPessoa === 'PROTOCOLO') return doc.length < 5;
        if (this.tipoPessoa === 'NAO_CLIENTE') return doc.length === 0;
        return !doc;
    }

    get dicaBusca() {
        if (!this.documentoDigitado) return 'Digite o valor e pressione Enter.';
        if (this.buscaDesabilitada) return 'Formato inválido — confira o valor.';
        return 'Formato válido — pressione Enter ou clique em Localizar.';
    }

    get labelCampo() {
        if (this.tipoPessoa === 'PROTOCOLO') return 'Protocolo';
        if (this.tipoPessoa === 'NAO_CLIENTE') return 'CPF ou CNPJ (não cliente)';
        return 'CPF ou CNPJ';
    }

    get helpCampo() {
        if (this.tipoPessoa === 'PROTOCOLO') return 'Informe o número do protocolo para localizar o atendimento.';
        if (this.tipoPessoa === 'NAO_CLIENTE') return 'Informe o documento para iniciar cadastro como não cliente.';
        return 'Aceita CPF (11 dígitos), CNPJ numérico (14 dígitos) e CNPJ alfanumérico BACEN (14 posições).';
    }

    get placeholderDocumento() {
        if (this.tipoPessoa === 'PROTOCOLO') return '0000000000';
        if (this.tipoPessoa === 'NAO_CLIENTE') return '000.000.000-00';
        return this.tipoPessoa === 'PF' ? '000.000.000-00' : '00.000.000/0000-00 ou alfanumérico BACEN';
    }

    aoTrocarTipoPessoa(event) {
        this.tipoPessoa = event.detail.value;
        // Máscara dinâmica só faz sentido para PF/PJ — protocolo e não-cliente
        // usam o valor digitado sem formatação (Cenário 4).
        if (this.tipoPessoa === 'PF' || this.tipoPessoa === 'PJ') {
            this.documentoDigitado = aplicarMascara(this.documentoDigitado, this.tipoPessoa);
        }
    }

    aoDigitarDocumento(event) {
        const bruta = event.target.value ?? '';
        this.documentoDigitado =
            this.tipoPessoa === 'PF' || this.tipoPessoa === 'PJ'
                ? aplicarMascara(bruta, this.tipoPessoa)
                : bruta;
        if (event.key === 'Enter' && !this.buscaDesabilitada) {
            this.aoBuscar();
        }
    }

    aoBuscar() {
        if (this.buscaDesabilitada) return;
        this.dispatchEvent(
            new CustomEvent('buscar', {
                detail: { tipo: this.tipoPessoa, normalizado: this.documentoNormalizado }
            })
        );
    }
}
