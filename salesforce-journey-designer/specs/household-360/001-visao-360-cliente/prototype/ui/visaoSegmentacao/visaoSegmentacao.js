import { LightningElement, api } from 'lwc';

/** Gastos por segmentação — pizza em SVG. Somente leitura, sem eventos. */
export default class VisaoSegmentacao extends LightningElement {
    @api segmentacao = null;

    get temSegmentacao() {
        return Boolean(this.segmentacao) && (this.segmentacao.itens?.length ?? 0) > 0;
    }

    get fatias() {
        // Cunha explícita (M + arco): sem dasharray/pathLength — determinístico no LWC.
        const raio = 48;
        let acumulado = 0;
        return (this.segmentacao?.itens ?? []).map((item) => {
            const a0 = (acumulado / 100) * Math.PI * 2 - Math.PI / 2;
            acumulado += item.percentual;
            const a1 = (acumulado / 100) * Math.PI * 2 - Math.PI / 2;
            const x1 = (50 + raio * Math.cos(a0)).toFixed(2);
            const y1 = (50 + raio * Math.sin(a0)).toFixed(2);
            const x2 = (50 + raio * Math.cos(a1)).toFixed(2);
            const y2 = (50 + raio * Math.sin(a1)).toFixed(2);
            return {
                ...item,
                textoPct: `${String(item.percentual).replace('.', ',')}%`,
                estiloCor: `background: ${item.cor};`,
                caminho: `M 50 50 L ${x1} ${y1} A ${raio} ${raio} 0 ${item.percentual > 50 ? 1 : 0} 1 ${x2} ${y2} Z`
            };
        });
    }

    get rotulos() {
        let acumulado = 0;
        return (this.segmentacao?.itens ?? []).map((item) => {
            const meio = ((acumulado + item.percentual / 2) / 100) * Math.PI * 2 - Math.PI / 2;
            acumulado += item.percentual;
            return {
                rotulo: item.rotulo,
                textoPct: `${String(item.percentual).replace('.', ',')}%`,
                x: (50 + 24 * Math.cos(meio)).toFixed(1),
                y: (50 + 24 * Math.sin(meio)).toFixed(1)
            };
        });
    }
}
