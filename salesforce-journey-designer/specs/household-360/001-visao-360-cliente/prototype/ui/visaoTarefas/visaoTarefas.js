import { LightningElement, api } from 'lwc';

/** Próximos passos — tarefas; baixa é estado local (mock). Sem eventos. */
export default class VisaoTarefas extends LightningElement {
    @api tarefas = [];

    concluidas = new Set();

    get temTarefas() {
        return (this.tarefas?.length ?? 0) > 0;
    }

    get tarefasEstado() {
        return (this.tarefas ?? []).map((t) => ({
            ...t,
            concluida: t.concluida || this.concluidas.has(t.id)
        }));
    }

    aoAlternarTarefa(event) {
        const id = event.currentTarget?.dataset?.id;
        if (!id) return;
        if (event.target?.checked) this.concluidas.add(id);
        else this.concluidas.delete(id);
        // Reatividade sobre Set exige nova referência.
        this.concluidas = new Set(this.concluidas);
    }
}
