import { LightningElement, api } from 'lwc';

const NIVEIS = ['Inicial', 'Básico', 'Intermediário', 'Avançado', 'Completo'];

/** Planejamento financeiro — régua de maturidade + recomendação. Somente leitura. */
export default class VisaoPlanejamento extends LightningElement {
    @api planejamento = null;

    get etapas() {
        const atual = this.planejamento?.etapa ?? 0;
        return NIVEIS.map((rotulo, indice) => ({
            indice,
            rotulo,
            classe: `c-plan_etapa c-plan_etapa_${indice}`
        }));
    }

    /** Check posicionado na fronteira do nível atual (como na referência). */
    get estiloMarcador() {
        const atual = this.planejamento?.etapa ?? 0;
        return `left: calc(${(atual + 1) * 20}% - 11px);`;
    }
}
