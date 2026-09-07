import { LightningElement, api } from 'lwc';

const ALTURA_PLOT = 160;
const TOPO_PLOT = 10;

/** Fluxo de entrada e saída — barras em SVG. Somente leitura, sem eventos. */
export default class VisaoFluxo extends LightningElement {
    @api fluxo = null;

    get temFluxo() {
        return Boolean(this.fluxo) && (this.fluxo.meses?.length ?? 0) > 0;
    }

    get linhas() {
        const max = this.fluxo?.maximo ?? 10000;
        return [0, max / 2, max].map((valor) => {
            const y = TOPO_PLOT + ALTURA_PLOT - (valor / max) * ALTURA_PLOT;
            return { valor, y, yTexto: y + 4, rotulo: valor.toLocaleString('pt-BR'), chaveGrade: `g${valor}`, chaveRotulo: `r${valor}` };
        });
    }

    get barras() {
        const meses = this.fluxo?.meses ?? [];
        const max = this.fluxo?.maximo ?? 10000;
        const larguraGrupo = 580 / Math.max(meses.length, 1);
        return meses.map((m, i) => {
            const xBase = 40 + i * larguraGrupo + (larguraGrupo - 60) / 2;
            const altEntrada = Math.max(2, (m.entrada / max) * ALTURA_PLOT);
            const altSaida = Math.max(2, (m.saida / max) * ALTURA_PLOT);
            return {
                ...m,
                idEntrada: `${m.mes}-e`,
                idSaida: `${m.mes}-s`,
                xEntrada: xBase,
                yEntrada: TOPO_PLOT + ALTURA_PLOT - altEntrada,
                altEntrada,
                xSaida: xBase + 24,
                ySaida: TOPO_PLOT + ALTURA_PLOT - altSaida,
                altSaida,
                xRotulo: xBase + 20
            };
        });
    }
}
