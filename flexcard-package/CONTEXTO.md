# FlexCard visaoHeader360 — Contexto Completo para Deploy

## Org
- Alias: FSC
- Instance: na138.salesforce.com
- Username: bruno.rolo_vtnf7bhgdb@portobank.com.br
- OrgId: 00DWs00000SxIGvMAN
- API Version: 68.0
- Runtime: **Vlocity managed package** (NÃO Standard Runtime)
  - `sf project retrieve start -m OmniUiCard` NÃO funciona
  - Deploy via REST API PATCH em `/services/data/v68.0/sobjects/OmniUiCard/{id}`
  - Auth: `sf org auth show-access-token --target-org FSC --json`

## Card
- Name: `visaoHeader360`
- Id: `0koWs000000UvX7IAK`
- Version: 5 (a única ativa — v1-v4 deletadas)
- Type: Parent
- DataSource: ApexRemote → `Visao360FlexCardDS.getHeader`

## PROBLEMA CONFIRMADO (não é hipótese)
O FlexCard renderer usa `<lightning-formatted-rich-text>` pra renderizar o conteúdo de cada elemento Text/outputField. Esse componente do Salesforce **remove**:
- `style="..."` inline
- `class="..."` customizado
- `<style>` tags
- `<link>` tags

O HTML chega correto (estrutura `<div>` preservada), mas **todo estilo é cortado**.

**Evidência:** Inspeção de DOM (print do HTML real no navegador).

## O que NÃO funciona
1. `style="..."` no mergeField → removido pelo sanitizer
2. `class="..."` no mergeField → removido pelo sanitizer
3. `globalCSS` no PropertySetConfig → não injeta `<style>` na página
4. `state.css` no PropertySetConfig → não injeta `<style>` na página

## O que PRESUMO que funciona (não testado)
- `state.styleObject.css` → pode ser processado pelo motor FlexCard como config estrutural, não como HTML de mergeField
- SLDS classes globais (`slds-text-title`, `slds-badge`, etc.) → já carregadas na página, mas não chegam no conteúdo do mergeField porque `class=` é removido

## O que o FlexCard PRECISA ter
- Layout 3 colunas (4-4-4)
- Dados: nome, tipoPessoa, documentoMascarado, segmento, status, telefone, email, perfilEndereco, perfilAgenciaConta, clienteDesde, estadoCivil, rating, filhos, completude, responsavel, responsavelIniciais, necessidade, jornada, canais
- Seções: "Autenticação", "Resumo do perfil", "Necessidades"
- Avatar circular com iniciais
- Selos pill (segmento=ouro, status=verde)

## Design de referência (LWC que JÁ funciona)
O arquivo `lwc-header.css` tem todas as classes CSS exatas que o FlexCard precisa reproduzir.
O arquivo `lwc-header.html` tem o template com a estrutura.
O arquivo `lwc-header.js` tem a lógica de dados (imperative @wire).

## Apex Data Source
Classe: `Visao360FlexCardDS` (arquivo incluso)
Contrato: `System.Callable`, args={input,output,options}, escreve em args['output'], retorna flat Strings.
Campos retornados: nome, tipoPessoa, documentoMascarado, segmento, status, telefone, email, perfilEndereco, perfilAgenciaConta, clienteDesde, estadoCivil, rating, filhos, completude, responsavel, responsavelIniciais, necessidade, jornada, canais.

## Deploy
```python
# Deploy via REST API (Python urllib)
import json, subprocess, urllib.request

def run_sf(args):
    r = subprocess.run(['sf'] + args, capture_output=True, text=True, shell=True)
    return r.stdout

stdout = run_sf(['org', 'display', '--target-org', 'FSC', '--verbose', '--json'])
iu = json.loads(stdout)['result']['instanceUrl']
stdout2 = run_sf(['org', 'auth', 'show-access-token', '--target-org', 'FSC', '--json'])
at = json.loads(stdout2)['result']['accessToken']

card_id = '0koWs000000UvX7IAK'
url = f'{iu}/services/data/v68.0/sobjects/OmniUiCard/{card_id}'

# Deactivate → Update → Activate
body = json.dumps({"PropertySetConfig": ps_json_string, "IsActive": True}).encode()
req = urllib.request.Request(url, data=body, method='PATCH',
    headers={'Authorization': f'Bearer {at}', 'Content-Type': 'application/json'})
urllib.request.urlopen(req, timeout=15)
```

## Pergunta principal
**Como estilizar o conteúdo do mergeField dentro de `<lightning-formatted-rich-text>` no FlexCard, sabendo que `style=`, `class=`, `<style>` e `globalCSS` são todos removidos/não aplicados?**
