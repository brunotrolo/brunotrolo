/**
 * @description DTOs da Visao 360 (household-360/001). Contratos tipados entre
 * services, controller e LWC. Espelham prototype/data/visao360/visao360.js.
 * Volateis (saldos/limites/fatura) trafegam SOMENTE nestes DTOs em memoria e
 * nunca sao persistidos (RN-04). Nada aqui importa classe de busca-cliente.
 * Todo campo serializado para o LWC carrega @AuraEnabled (sem isso o payload
 * chega vazio e o componente estoura em `null.<campo>`).
 */
public with sharing class Visao360DTOs {

    /** Falha tipada de fonte externa ou parcial: UI vira banner + retry. */
    public class ApiFaultDTO {
        @AuraEnabled public String source;
        @AuraEnabled public String code;
        @AuraEnabled public String message;
        public ApiFaultDTO() {}
        public ApiFaultDTO(String source, String code, String message) {
            this.source = source;
            this.code = code;
            this.message = message;
        }
    }

    /** Linha do inventario por ativo (cadastro, nunca volatil). */
    public class AssetSummaryDTO {
        @AuraEnabled public String assetId;
        @AuraEnabled public String contractNumber;
        @AuraEnabled public String productFamily;
        @AuraEnabled public String label;
        @AuraEnabled public String maskedId;
        @AuraEnabled public String status;
        @AuraEnabled public String numero;
        @AuraEnabled public String valor;
        @AuraEnabled public String encerramento;
        @AuraEnabled public String ultimaMov;
        @AuraEnabled public String recordTypeName;
    }

    /** Detalhe volatil por ativo: SOMENTE memoria + cache client 180s. */
    public class AssetRealtimeDTO {
        @AuraEnabled public String tipo;
        @AuraEnabled public String limiteTotal;
        @AuraEnabled public String limiteDisponivel;
        @AuraEnabled public String faturaAtual;
        @AuraEnabled public String vencimento;
        @AuraEnabled public String melhorDiaCompra;
        @AuraEnabled public String saldo;
        @AuraEnabled public String agenciaConta;
        @AuraEnabled public List<String> chavesPix;
        @AuraEnabled public String grupoCota;
        @AuraEnabled public String saldoDevedor;
        @AuraEnabled public String parcela;
        @AuraEnabled public String proximaAssembleia;
        @AuraEnabled public String contemplacao;
        @AuraEnabled public String produto;
        @AuraEnabled public String valorAplicado;
        @AuraEnabled public String rentabilidade;
        @AuraEnabled public String aviso;
        @AuraEnabled public String atualizadoEm;
        @AuraEnabled public Boolean doCache;
        public AssetRealtimeDTO() {
            this.chavesPix = new List<String>();
            this.doCache = false;
        }
    }

    /** Oferta NBO do motor (safra vigente, estatica, top 3 por score). */
    public class NBOOfferDTO implements System.Comparable {
        @AuraEnabled public String offerId;
        @AuraEnabled public String externalOfferId;
        @AuraEnabled public String productCode;
        @AuraEnabled public String productName;
        @AuraEnabled public String category;
        @AuraEnabled public Integer priority;
        @AuraEnabled public Decimal propensityScore;
        @AuraEnabled public String headline;
        @AuraEnabled public String elegibilidade;
        @AuraEnabled public String confianca;
        @AuraEnabled public List<String> motivos;
        @AuraEnabled public String validade;
        @AuraEnabled public String chaveSafra;
        @AuraEnabled public String omniScriptKey;
        @AuraEnabled public String estado;
        public NBOOfferDTO() {
            this.motivos = new List<String>();
            this.estado = 'elegivel';
        }
        /** Ordenacao: score descendente; empate desempatado por prioridade. */
        public Integer compareTo(Object other) {
            NBOOfferDTO b = (NBOOfferDTO) other;
            Decimal sa = this.propensityScore == null ? 0 : this.propensityScore;
            Decimal sb = b.propensityScore == null ? 0 : b.propensityScore;
            if (sa != sb) {
                return sb > sa ? 1 : -1;
            }
            Integer pa = this.priority == null ? 0 : this.priority;
            Integer pb = b.priority == null ? 0 : b.priority;
            return pa - pb;
        }
    }

    /** Identificacao modelo/safra/geracao do motor NBO. */
    public class MotorInfoDTO {
        @AuraEnabled public String modelo;
        @AuraEnabled public String safra;
        @AuraEnabled public String geradoEm;
    }

    /** Cabecalho cadastral em 3 colunas (P1/P2). */
    public class HeaderDTO {
        @AuraEnabled public String nome;
        @AuraEnabled public String tipoPessoa;
        @AuraEnabled public String documentoMascarado;
        @AuraEnabled public String segmento;
        @AuraEnabled public String status;
        @AuraEnabled public String telefone;
        @AuraEnabled public String email;
        @AuraEnabled public String clienteDesde;
        @AuraEnabled public String estadoCivil;
        @AuraEnabled public String filhos;
        @AuraEnabled public String rating;
        @AuraEnabled public String responsavel;
        @AuraEnabled public String necessidade;
        @AuraEnabled public String jornada;
        @AuraEnabled public List<String> canais;
        @AuraEnabled public String saldoConsolidado;
        @AuraEnabled public String alerta;
        @AuraEnabled public String perfilContato;
        @AuraEnabled public String perfilEndereco;
        @AuraEnabled public String perfilRendaScore;
        @AuraEnabled public String perfilAgenciaConta;
        public HeaderDTO() {
            this.canais = new List<String>();
        }
    }

    public class EventoVidaDTO {
        @AuraEnabled public String id;
        @AuraEnabled public String titulo;
        @AuraEnabled public String data;
        @AuraEnabled public String glifo;
    }

    public class WellnessDTO {
        @AuraEnabled public String nota;
        @AuraEnabled public String variacao;
        @AuraEnabled public String nivel;
        @AuraEnabled public List<Integer> barras;
        public WellnessDTO() {
            this.barras = new List<Integer>();
        }
    }

    public class PlanejamentoDTO {
        @AuraEnabled public String nivel;
        @AuraEnabled public Integer etapa;
        @AuraEnabled public String recomendacao;
        @AuraEnabled public String recomendacaoDetalhe;
    }

    public class FluxoMesDTO {
        @AuraEnabled public String mes;
        @AuraEnabled public Decimal entrada;
        @AuraEnabled public Decimal saida;
    }

    public class FluxoDTO {
        @AuraEnabled public Decimal maximo;
        @AuraEnabled public List<FluxoMesDTO> meses;
        public FluxoDTO() {
            this.meses = new List<FluxoMesDTO>();
        }
    }

    public class SegmentoDTO {
        @AuraEnabled public String rotulo;
        @AuraEnabled public Decimal percentual;
        @AuraEnabled public String cor;
    }

    public class SegmentacaoDTO {
        @AuraEnabled public String periodo;
        @AuraEnabled public List<SegmentoDTO> itens;
        public SegmentacaoDTO() {
            this.itens = new List<SegmentoDTO>();
        }
    }

    public class ComportamentoItemDTO {
        @AuraEnabled public String quando;
        @AuraEnabled public String duracao;
        @AuraEnabled public Integer paginas;
        @AuraEnabled public String origem;
        @AuraEnabled public String dispositivo;
        @AuraEnabled public String detalhe;
        @AuraEnabled public String destaque;
    }

    public class ComportamentoDTO {
        @AuraEnabled public List<ComportamentoItemDTO> site;
        @AuraEnabled public List<ComportamentoItemDTO> app;
        public ComportamentoDTO() {
            this.site = new List<ComportamentoItemDTO>();
            this.app = new List<ComportamentoItemDTO>();
        }
    }

    public class CampanhaDTO {
        @AuraEnabled public String id;
        @AuraEnabled public String inicio;
        @AuraEnabled public String nome;
        @AuraEnabled public String primeira;
        @AuraEnabled public String finalizacao;
        @AuraEnabled public String oportunidade;
    }

    public class MetaDTO {
        @AuraEnabled public String id;
        @AuraEnabled public String nome;
        @AuraEnabled public String estado;
        @AuraEnabled public String alvo;
        @AuraEnabled public String atual;
        @AuraEnabled public String dataAlvo;
        @AuraEnabled public Integer percentual;
    }

    public class TarefaDTO {
        @AuraEnabled public String id;
        @AuraEnabled public String titulo;
        @AuraEnabled public String prazo;
        @AuraEnabled public String responsavel;
        @AuraEnabled public Boolean concluida;
    }

    public class InteracaoDTO {
        @AuraEnabled public String id;
        @AuraEnabled public String tipo;
        @AuraEnabled public String titulo;
        @AuraEnabled public String detalhe;
        @AuraEnabled public String detalheLongo;
        @AuraEnabled public String de;
        @AuraEnabled public String para;
        @AuraEnabled public String quando;
        @AuraEnabled public String hora;
        @AuraEnabled public String duracao;
        @AuraEnabled public String canal;
        @AuraEnabled public String protocolo;
    }

    public class AcaoDTO {
        @AuraEnabled public String id;
        @AuraEnabled public String titulo;
        @AuraEnabled public String descricao;
        @AuraEnabled public String cta;
    }

    /** Linha do historico de atendimentos (tabela 9 colunas, leitura). */
    public class CasoDTO {
        @AuraEnabled public String id;
        @AuraEnabled public String protocolo;
        @AuraEnabled public String dataOcorrencia;
        @AuraEnabled public String assunto;
        @AuraEnabled public String categoria;
        @AuraEnabled public String canal;
        @AuraEnabled public String responsavel;
        @AuraEnabled public String situacao;
        @AuraEnabled public Integer satisfacao;
        @AuraEnabled public String resolucao;
    }

    /** No da arvore de relacionamentos (resumida ou completa). */
    public class ArcNodeDTO {
        @AuraEnabled public String id;
        @AuraEnabled public String nome;
        @AuraEnabled public String papel;
        @AuraEnabled public String tipo;
        @AuraEnabled public String doc;
        @AuraEnabled public Integer nivel;
    }

    // =================================================================
    // Resultados compostos (um por chamada do controller)
    // =================================================================

    public class AssetsResult {
        @AuraEnabled public List<AssetSummaryDTO> items;
        @AuraEnabled public ApiFaultDTO fault;
        public AssetsResult() {
            this.items = new List<AssetSummaryDTO>();
        }
    }

    public class RealtimeResult {
        @AuraEnabled public AssetRealtimeDTO detail;
        @AuraEnabled public ApiFaultDTO fault;
    }

    public class NboResult {
        @AuraEnabled public List<NBOOfferDTO> offers;
        @AuraEnabled public MotorInfoDTO motor;
        @AuraEnabled public ApiFaultDTO fault;
        public NboResult() {
            this.offers = new List<NBOOfferDTO>();
        }
    }

    /** Visao consolidada nao-volatil da raiz (header + rico + arc + casos). */
    public class VisaoResult {
        @AuraEnabled public HeaderDTO header;
        @AuraEnabled public String aum;
        @AuraEnabled public String patrimonioHousehold;
        @AuraEnabled public String ativosFora;
        @AuraEnabled public String walletShare;
        @AuraEnabled public String scoreCredito;
        @AuraEnabled public String completude;
        @AuraEnabled public List<EventoVidaDTO> eventosVida;
        @AuraEnabled public List<String> tagsSegmentos;
        @AuraEnabled public List<String> tagsInvestimentos;
        @AuraEnabled public List<String> tagsEstilo;
        @AuraEnabled public WellnessDTO wellness;
        @AuraEnabled public PlanejamentoDTO planejamento;
        @AuraEnabled public FluxoDTO fluxo;
        @AuraEnabled public SegmentacaoDTO segmentacao;
        @AuraEnabled public ComportamentoDTO comportamento;
        @AuraEnabled public List<CampanhaDTO> campanhas;
        @AuraEnabled public List<MetaDTO> metas;
        @AuraEnabled public List<TarefaDTO> tarefas;
        @AuraEnabled public List<InteracaoDTO> interacoes;
        @AuraEnabled public List<AcaoDTO> acoes;
        @AuraEnabled public List<ArcNodeDTO> arcResumo;
        @AuraEnabled public List<ArcNodeDTO> arcCompleta;
        @AuraEnabled public Integer arcTotalVinculos;
        @AuraEnabled public List<CasoDTO> casos;
        @AuraEnabled public ApiFaultDTO fault;
        public VisaoResult() {
            this.eventosVida = new List<EventoVidaDTO>();
            this.tagsSegmentos = new List<String>();
            this.tagsInvestimentos = new List<String>();
            this.tagsEstilo = new List<String>();
            this.campanhas = new List<CampanhaDTO>();
            this.metas = new List<MetaDTO>();
            this.tarefas = new List<TarefaDTO>();
            this.interacoes = new List<InteracaoDTO>();
            this.acoes = new List<AcaoDTO>();
            this.arcResumo = new List<ArcNodeDTO>();
            this.arcCompleta = new List<ArcNodeDTO>();
            this.casos = new List<CasoDTO>();
        }
    }
}