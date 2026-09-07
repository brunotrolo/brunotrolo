import { LightningElement } from 'lwc';
import CardDrawerModal from 'ui/cardDrawerModal';
import ConsorcioDrawerModal from 'ui/consorcioDrawerModal';
import InvestimentoDrawerModal from 'ui/investimentoDrawerModal';
import { getCliente } from 'data/buscaCliente';

const DOC_ERRO_TOTAL = '88888888888';

/**
 * Shell orquestrador — dono APENAS do estado da jornada:
 * busca → carregando → resultado/erro + gate NBO + contexto fixado.
 * Toda UI de domínio mora nos filhos (ui/buscaCliente*). O shell nunca
 * renderiza máscara, oferta, faixa, hub ou holding diretamente.
 */
export default class BuscaCliente extends LightningElement {
    estado = 'busca';
    cliente = null;
    ofertaAtiva = null;
    ofertaDispensada = false;
    produtoSelecionadoTipo = null;
    contextoFixado = null;
    ultimoNormalizado = null;

    carregandoCadastro = false;
    carregandoHub = false;
    carregandoNbo = false;
    _buscaToken = 0;

    get mostrarCarregamento() {
        return this.estado === 'carregando';
    }

    get mostrarNaoEncontrado() {
        return this.estado === 'nao-encontrado';
    }

    get mostrarErroTotal() {
        return this.estado === 'erro-total';
    }

    get mostrarResultado() {
        return this.estado === 'resultado';
    }

    get temHolding() {
        return (this.cliente?.holding?.length ?? 0) > 0;
    }

    get iconeTipoPessoa() {
        if (this.cliente?.tipoPessoa === 'Pessoa Jurídica') return 'standard:account';
        return 'standard:contact';
    }

    get temOfertaIdentificada() {
        return this.ofertaAtiva !== null && this.ofertaAtiva.estado === 'identificada';
    }

    get mostrarOfertaEmAbordagem() {
        return this.ofertaAtiva !== null && this.ofertaAtiva.estado === 'em abordagem';
    }

    get mostrarOfertaDispensada() {
        return this.ofertaDispensada && !this.mostrarOfertaEmAbordagem && this.ofertaAtiva === null;
    }

    get mostrarAvisoOfertasIndisponiveis() {
        return this.estado === 'resultado' && this.cliente !== null && this.cliente.ofertas === null;
    }

    get semOferta() {
        return (
            (Array.isArray(this.cliente?.ofertas) && this.cliente.ofertas.length === 0) ||
            this.mostrarAvisoOfertasIndisponiveis
        );
    }

    get ofertaDecidida() {
        return this.mostrarOfertaEmAbordagem || this.ofertaDispensada || this.semOferta;
    }

    get mostrarGateProdutos() {
        return this.mostrarResultado && this.temOfertaIdentificada && !this.ofertaDecidida;
    }

    get mostrarHub() {
        return this.mostrarResultado && (!this.temOfertaIdentificada || this.ofertaDecidida);
    }

    // Evento `buscar` do filho search-bar
    aoBuscarSolicitada(event) {
        const { normalizado } = event.detail ?? {};
        if (!normalizado) return;
        this.ultimoNormalizado = normalizado;
        this._executarBusca(normalizado);
    }

    aoTentarNovamente() {
        if (this.ultimoNormalizado) this._executarBusca(this.ultimoNormalizado);
    }

    _executarBusca(normalizado) {
        const token = ++this._buscaToken;
        this.estado = 'carregando';
        this.cliente = null;
        this.ofertaAtiva = null;
        this.ofertaDispensada = false;
        this.produtoSelecionadoTipo = null;
        this.contextoFixado = null;
        this.carregandoCadastro = true;
        this.carregandoHub = true;
        this.carregandoNbo = true;

        if (normalizado === DOC_ERRO_TOTAL) {
            setTimeout(() => {
                if (token !== this._buscaToken) return;
                this.carregandoCadastro = false;
                this.carregandoHub = false;
                this.carregandoNbo = false;
                this.estado = 'erro-total';
            }, 900);
            return;
        }

        const encontrado = getCliente(normalizado);
        setTimeout(() => {
            if (token !== this._buscaToken) return;
            this.carregandoCadastro = false;
            if (!encontrado) {
                this.carregandoHub = false;
                this.carregandoNbo = false;
                this.estado = 'nao-encontrado';
                return;
            }
            this.cliente = {
                ...encontrado,
                produtos: encontrado.produtos.map((p) => ({
                    ...p,
                    selecionado: false,
                    selo: 'Disponível',
                    classeCartao: 'c-product-card'
                }))
            };
        }, 700);
        setTimeout(() => {
            if (token !== this._buscaToken || !encontrado) return;
            this.carregandoHub = false;
            this.estado = 'resultado';
        }, 1000);
        setTimeout(() => {
            if (token !== this._buscaToken || !encontrado) return;
            this.carregandoNbo = false;
            if (Array.isArray(encontrado.ofertas) && encontrado.ofertas.length > 0) {
                this.ofertaAtiva = { ...encontrado.ofertas[0] };
            }
        }, 1300);
    }

    aoLimpar() {
        this._buscaToken += 1;
        this.estado = 'busca';
        this.cliente = null;
        this.ofertaAtiva = null;
        this.ofertaDispensada = false;
        this.produtoSelecionadoTipo = null;
        this.contextoFixado = null;
        this.ultimoNormalizado = null;
        this.template.querySelector('ui-busca-cliente-search-bar')?.limpar();
    }

    // Eventos `abordar` / `dispensar` do filho nbo-banner
    aoAbordarOferta() {
        if (!this.ofertaAtiva) return;
        this.ofertaAtiva = { ...this.ofertaAtiva, estado: 'em abordagem' };
    }

    aoDispensarOferta() {
        this.ofertaAtiva = null;
        this.ofertaDispensada = true;
    }

    // Evento `productselect` do filho product-hub
    async aoProdutoSelecionado(event) {
        const tipo = event.detail?.tipo;
        const produto = this.cliente.produtos.find((p) => p.tipo === tipo);
        if (!produto) return;
        this._marcarSelecionado(tipo);
        if (produto.exigeSubselecao) {
            if (tipo === 'CARTAO') {
                const via = await CardDrawerModal.open({
                    label: `Vias de cartão — ${this.cliente.nome}`,
                    size: 'medium',
                    vias: produto.vias
                });
                if (via) {
                    this.contextoFixado = { produtoNome: produto.nome, via, cota: null };
                } else {
                    this._marcarSelecionado(null);
                }
                return;
            }
            if (tipo === 'CONSORCIO') {
                const cota = await ConsorcioDrawerModal.open({
                    label: `Cotas de consórcio — ${this.cliente.nome}`,
                    size: 'medium',
                    cotas: produto.cotas
                });
                if (cota) {
                    this.contextoFixado = { produtoNome: produto.nome, via: null, cota, investimento: null };
                } else {
                    this._marcarSelecionado(null);
                }
                return;
            }
            if (tipo === 'INVESTIMENTOS') {
                const investimento = await InvestimentoDrawerModal.open({
                    label: `Investimentos — ${this.cliente.nome}`,
                    size: 'medium',
                    investimentos: produto.investimentos
                });
                if (investimento) {
                    this.contextoFixado = { produtoNome: produto.nome, via: null, cota: null, investimento };
                } else {
                    this._marcarSelecionado(null);
                }
                return;
            }
        }
        this.contextoFixado = { produtoNome: produto.nome, via: null, cota: null, investimento: null };
    }

    _marcarSelecionado(tipo) {
        this.produtoSelecionadoTipo = tipo;
        this.cliente = {
            ...this.cliente,
            produtos: this.cliente.produtos.map((p) => ({
                ...p,
                selecionado: p.tipo === tipo,
                selo: p.tipo === tipo ? 'Selecionado' : 'Disponível',
                classeCartao: p.tipo === tipo ? 'c-product-card c-product-card_selecionado' : 'c-product-card'
            }))
        };
        if (tipo === null) this.contextoFixado = null;
    }
}
