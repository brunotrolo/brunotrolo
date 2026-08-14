# Como conectar o Salesforce MCP no VS Code (Claude Code)

Passo a passo simples para conectar o MCP Server do Salesforce (`salesforce-sobject-all`) no Claude Code dentro do VS Code.

## Pré-requisitos

- Claude Code instalado no VS Code e logado (`claude auth status` deve mostrar `"loggedIn": true`)
- Acesso de Admin (ou quem configura Apps) na org Salesforce, para criar um External Client App

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
- ⬜ Require secret for Web Server Flow → **desmarcado** (o fluxo usa PKCE, sem secret)
- ✅ Require PKCE → mantém marcado (padrão)

Salve e copie o **Consumer Key** (Client ID) do app.

> Aguarde alguns minutos após salvar — mudanças em External Client Apps levam um tempo para propagar.

## 2. Adicionar o servidor MCP via terminal

No terminal (dentro da pasta do seu projeto no VS Code), rode:

```bash
claude mcp add --transport http salesforce-sobject-all \
  https://api.salesforce.com/platform/mcp/v1/platform/sobject-all \
  --client-id SEU_CONSUMER_KEY_AQUI \
  --callback-port 38000
```

**Importante:** use sempre os *flags* do comando (`--client-id`, `--callback-port`). Não edite o `oauth` manualmente no `.claude.json` — o formato manual não é reconhecido corretamente e gera o erro `invalid client credentials`.

## 3. Autenticar

```bash
claude mcp login salesforce-sobject-all
```

Isso abre o navegador para você logar na org Salesforce e autorizar o app. Ao final, deve aparecer:

```
Authenticated with "salesforce-sobject-all". Its tools are now available in Claude Code.
```

## 4. Testar no chat do Claude Code

Dentro do VS Code, no chat do Claude Code, rode:

```
/mcp
```

Deve mostrar `salesforce-sobject-all` como **conectado**, sem o aviso de "needs authentication".

Depois, teste pedindo algo como:

```
Consulte via Salesforce MCP as informações do usuário logado
```

Se retornar seu nome, org e perfil, está tudo funcionando.

## Problemas comuns

- **"invalid client credentials"**: geralmente é porque o `oauth`/`clientId` foi editado manualmente no `.claude.json` em vez de usado via `--client-id` no comando `claude mcp add`.
- **"does not support dynamic client registration"**: o Salesforce não suporta o fluxo automático de client registration — é obrigatório criar o External Client App manualmente e passar o `--client-id`.
- App novo não aparece em "Connected Apps OAuth Usage": não é necessariamente um problema — External Client Apps (o tipo novo) nem sempre aparecem nessa tela legada.
