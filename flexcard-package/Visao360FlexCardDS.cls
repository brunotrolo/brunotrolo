/**
 * Data source Apex Remote do FlexCard de cabecalho (household-360/001).
 * Contrato OmniStudio Apex Remote (Callable + convencao vlocity):
 *   args = { input, output, options } — a classe LE `input`, ESCREVE em `output`
 *   e tambem retorna o mapa (cobre as duas convencoes possiveis).
 * Reusa Visao360Controller.getVisao; nao toca classes existentes.
 */
global with sharing class Visao360FlexCardDS implements System.Callable {

    global Object call(String action, Map<String, Object> args) {
        Map<String, Object> input = args == null ? null : (Map<String, Object>) args.get('input');
        Map<String, Object> output = args == null ? null : (Map<String, Object>) args.get('output');
        Map<String, Object> flat = (input != null && !input.isEmpty()) ? input : args;

        Map<String, Object> data = buildHeader(flat);
        if (output != null) {
            output.putAll(data);
        }
        return data;
    }

    private Map<String, Object> buildHeader(Map<String, Object> input) {
        String accountId = stringOf(input, 'accountId');
        String recordId = stringOf(input, 'recordId');
        Id raiz = String.isNotBlank(accountId)
            ? tryId(accountId)
            : String.isNotBlank(recordId) ? tryId(recordId) : null;

        Map<String, Object> vazio = new Map<String, Object>{
            'error' => 'OK', 'nome' => '—', 'tipoPessoa' => '—',
            'documentoMascarado' => '—', 'segmento' => '—', 'status' => '—',
            'telefone' => '—', 'email' => '—', 'perfilEndereco' => '—',
            'perfilAgenciaConta' => '—', 'clienteDesde' => '—', 'estadoCivil' => '—',
            'rating' => '—', 'filhos' => '—', 'completude' => '—',
            'responsavel' => '—', 'responsavelIniciais' => '—', 'necessidade' => '—',
            'jornada' => '—', 'canais' => '—'
        };

        if (raiz == null) {
            return vazio;
        }
        Visao360DTOs.VisaoResult visao = Visao360Controller.getVisao(raiz);
        if (visao == null || visao.header == null) {
            vazio.put('nome', 'Conta nao localizada');
            return vazio;
        }
        Visao360DTOs.HeaderDTO h = visao.header;

        Map<String, Object> data = new Map<String, Object>();
        data.put('nome', str(h.nome));
        data.put('tipoPessoa', str(h.tipoPessoa));
        data.put('documentoMascarado', str(h.documentoMascarado));
        data.put('segmento', str(h.segmento));
        data.put('status', str(h.status));
        data.put('telefone', str(h.telefone));
        data.put('email', str(h.email));
        data.put('perfilEndereco', str(h.perfilEndereco));
        data.put('perfilAgenciaConta', str(h.perfilAgenciaConta));
        data.put('clienteDesde', str(h.clienteDesde));
        data.put('estadoCivil', str(h.estadoCivil));
        data.put('rating', str(h.rating));
        data.put('filhos', str(h.filhos));
        data.put('completude', str(visao.completude));
        data.put('responsavel', str(h.responsavel));
        data.put('responsavelIniciais', iniciais(h.responsavel));
        data.put('necessidade', str(h.necessidade));
        data.put('jornada', str(h.jornada));
        data.put('canais', canaisTexto(h.canais));
        data.put('error', 'OK');
        return data;
    }

    private static String str(String v) {
        return String.isBlank(v) ? '—' : v;
    }

    private static String canaisTexto(List<String> canais) {
        if (canais == null || canais.isEmpty()) {
            return '—';
        }
        return String.join(canais, ', ');
    }

    private static String iniciais(String nome) {
        if (String.isBlank(nome)) {
            return '—';
        }
        List<String> partes = nome.trim().split('\\s+');
        if (partes.isEmpty() || partes[0] == '—') {
            return '—';
        }
        String ini = partes[0].substring(0, 1);
        if (partes.size() > 1) {
            ini += partes[partes.size() - 1].substring(0, 1);
        }
        return ini.toUpperCase();
    }

    private static String stringOf(Map<String, Object> input, String key) {
        if (input == null) {
            return null;
        }
        Object v = input.get(key);
        return v == null ? null : String.valueOf(v);
    }

    private static Id tryId(String value) {
        try {
            return Id.valueOf(value);
        } catch (Exception e) {
            return null;
        }
    }
}