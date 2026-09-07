import { LightningElement, api } from 'lwc';

/** Eventos da vida — ordenação e filtro locais (mock). Sem eventos. */
export default class VisaoEventos extends LightningElement {
    @api eventos = [];

    recentesPrimeiro = true;
    ano = 'todos';

    get temEventos() {
        return (this.eventos?.length ?? 0) > 0;
    }

    get opcoesAno() {
        const anos = [...new Set((this.eventos ?? []).map((e) => this._ano(e.data)).filter(Boolean))].sort().reverse();
        return [{ label: 'Todos os anos', value: 'todos' }].concat(anos.map((a) => ({ label: a, value: a })));
    }

    get rotuloAno() {
        return this.ano === 'todos' ? 'Todos os anos' : this.ano;
    }

    get eventosVisiveis() {
        const lista = (this.eventos ?? [])
            .filter((e) => this.ano === 'todos' || this._ano(e.data) === this.ano)
            .map((e) => ({
                ...e,
                ordem: this._ordem(e.data),
                ehPessoa: e.glifo === 'pessoa',
                ehAlianca: e.glifo === 'alianca',
                ehCasa: e.glifo === 'casa',
                ehBebe: e.glifo === 'bebe',
                ehTrofeu: e.glifo === 'trofeu',
                ehLocal: e.glifo === 'local'
            }));
        lista.sort((a, b) => (this.recentesPrimeiro ? b.ordem - a.ordem : a.ordem - b.ordem));
        return lista;
    }

    get temVisiveis() {
        return this.eventosVisiveis.length > 0;
    }

    aoAlternarOrdem(event) {
        this.recentesPrimeiro = event.target?.checked ?? true;
    }

    aoTrocarAno(event) {
        this.ano = event.detail?.value ?? 'todos';
    }

    _ano(data) {
        const m = (data ?? '').match(/(\d{4})/);
        return m ? m[1] : '';
    }

    _ordem(data) {
        const m = (data ?? '').match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (m) return Number(`${m[3]}${m[2]}${m[1]}`);
        const a = this._ano(data);
        return a ? Number(`${a}0000`) : 0;
    }
}
