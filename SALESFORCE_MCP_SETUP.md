# Como conectar o Salesforce MCP no Claude Code

Passo a passo para conectar o MCP Server do Salesforce (`salesforce-sobject-all`) no Claude Code.

## Pré-requisitos

- Claude Code instalado e autenticado
- Salesforce CLI instalado (`sf org list` mostra a org como Connected)
- Acesso de Admin na org Salesforce para criar um External Client App

---

## 1. Criar o External Client App na org Salesforce

No Salesforce, vá em **Setup → App Manager → New External Client App** e configure:

**App Settings**
- Callback URL: `http://localhost:38000/callback`
- OAuth Scopes (mover para "Selected"):
  - `Perform requests at any time (refresh_token, offline_access)`
  - `Access Salesforce hosted MCP servers (mcp_api)`

**Policies → App Authorization**
- "All users can self-authorize"

**Policies → Flow Enablement**
- ✅ Enable Authorization Code and Credentials Flow

**Policies → Security**
- ☐ Require secret for Web Server Flow — **desmarcado** (o fluxo usa PKCE, sem secret)
- ✅ Require PKCE — mantém marcado (padrão)

Salve e copie o **Consumer Key** (Client ID) do app.

> Aguarde alguns minutos após salvar — mudanças em External Client Apps levam um tempo para propagar.

---

## 2. Adicionar o servidor MCP via terminal

No terminal, dentro da pasta do projeto, rode:

```bash
claude mcp add --transport http salesforce-sobject-all \
  https://api.salesforce.com/platform/mcp/v1/platform/sobject-all \
  --client-id SEU_CONSUMER_KEY_AQUI \
  --callback-port 38000
```

**Importante:** use sempre os flags do comando (`--client-id`, `--callback-port`). Não edite o `oauth` manualmente no `.claude.json` — o formato manual não é reconhecido corretamente e gera o erro `invalid client credentials`.

---

## 3. Autenticar

### Opção A — `claude mcp login` (versões mais recentes do Claude Code)

```bash
claude mcp login salesforce-sobject-all
```

Isso abre o navegador para você logar na org Salesforce e autorizar o app. Ao final, deve aparecer:

```
Authenticated with "salesforce-sobject-all". Its tools are now available in Claude Code.
```

### Opção B — via `/mcp` dentro do Claude Code (se o `claude mcp login` não existir na sua versão)

Se ao rodar `claude mcp login` aparecer `error: unknown command 'login'`, use este fluxo alternativo. Adicione o servidor passando também o `--client-secret`:

```bash
claude mcp add --transport http salesforce-sobject-all \
  https://api.salesforce.com/platform/mcp/v1/platform/sobject-all \
  --client-id SEU_CONSUMER_KEY_AQUI \
  --callback-port 38000 \
  --client-secret
```

Quando aparecer `Enter OAuth client secret:`, cole o Consumer Secret e pressione Enter. Depois:

1. Abra o Claude Code com `claude` no terminal
2. Digite `/mcp`
3. Selecione **salesforce-sobject-all** (aparece como "needs authentication")
4. Selecione **Authenticate**
5. O browser abrirá — autorize o acesso
6. Volte ao Claude Code — o servidor aparecerá como **connected**

---

## 4. Testar no chat do Claude Code

Dentro do Claude Code, rode:

```
/mcp
```

Deve mostrar `salesforce-sobject-all` como **conectado**, sem o aviso de "needs authentication".

Depois, teste pedindo algo como:

```
Consulte via Salesforce MCP as informações do usuário logado
```

Se retornar seu nome, org e perfil, está tudo funcionando.

---

## 5. Variante somente leitura (`sobject-reads`)

Existe uma versão mais restrita do MCP, apenas leitura, mais segura para uso do dia a dia:

```
https://api.salesforce.com/platform/mcp/v1/platform/sobject-reads
```

Pode usar o **mesmo External Client App** (mesmo Consumer Key) criado no passo 1, já que ele tem o scope `mcp_api`, que cobre esse endpoint também. Basta repetir os passos 2 e 3 trocando o nome e a URL:

```bash
claude mcp add --transport http salesforce-sobject-reads \
  https://api.salesforce.com/platform/mcp/v1/platform/sobject-reads \
  --client-id SEU_CONSUMER_KEY_AQUI \
  --callback-port 38000
```

```bash
claude mcp login salesforce-sobject-reads
```

> **Importante sobre a porta:** use sempre a mesma porta configurada no Callback URL do App (`38000`, no exemplo do passo 1). Se usar uma porta diferente da registrada, o navegador retorna `ERR_CONNECTION_REFUSED` ao tentar redirecionar depois do login.

---

## URLs disponíveis

| Nome sugerido | URL — Produção | URL — Sandbox/Scratch |
|---|---|---|
| `salesforce-sobject-all` | `https://api.salesforce.com/platform/mcp/v1/platform/sobject-all` | `https://api.salesforce.com/platform/mcp/v1/sandbox/platform/sobject-all` |
| `salesforce-sobject-reads` | `https://api.salesforce.com/platform/mcp/v1/platform/sobject-reads` | `https://api.salesforce.com/platform/mcp/v1/sandbox/platform/sobject-reads` |

---

## Problemas comuns

- **"invalid client credentials"**: geralmente é porque o `oauth`/`clientId` foi editado manualmente no `.claude.json` em vez de usado via `--client-id` no comando `claude mcp add`.
- **"does not support dynamic client registration"**: o Salesforce não suporta o fluxo automático de client registration — é obrigatório criar o External Client App manualmente e passar o `--client-id`.
- **`ERR_CONNECTION_REFUSED` no navegador ao autenticar**: a porta passada em `--callback-port` não bate com o Callback URL registrado no App. Use a mesma porta configurada no Salesforce.
- **`error: unknown command 'login'`**: sua versão do Claude Code não tem o `claude mcp login`. Use a **Opção B** do passo 3 (com `--client-secret` e autenticação via `/mcp`).
- **`claude mcp list` mostra "No MCP servers"** no terminal externo: normal para servidores no escopo local do projeto — eles só aparecem dentro de uma sessão Claude Code aberta na pasta do projeto.
