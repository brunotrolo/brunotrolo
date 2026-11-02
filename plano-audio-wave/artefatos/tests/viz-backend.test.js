#!/usr/bin/env node
// Teste de BACKEND do visualizador (sem navegador, sem LiveKit SFU).
// Uso:  BASE_URL=http://localhost:8091 node tests/viz-backend.test.js
// Requer: Node >= 18 e o call-ingress/server.js rodando (npm i && node call-ingress/server.js).
const BASE = process.env.BASE_URL || 'http://localhost:8091';
let fail = 0;
const ok = (c, msg, extra = '') => { console.log(`${c ? 'PASS' : 'FAIL'}  ${msg}${extra ? '  ' + extra : ''}`); if (!c) fail++; };
const get = (p) => fetch(BASE + p, { redirect: 'manual' });

(async () => {
  // 1. saúde + regressão das rotas que já existiam
  let r = await get('/health');                      ok(r.status === 200 && (await r.json()).status === 'ok', 'GET /health');
  r = await get('/sw.js');                           ok(r.status === 200, 'GET /sw.js (regressão)');
  r = await get('/manifest.json');                   ok(r.status === 200, 'GET /manifest.json (regressão)');

  // 2. HTML servido já traz picklist e referência ao bundle
  r = await get('/'); const html = await r.text();
  ok(r.status === 200, 'GET / 200');
  ok(html.includes('id="vizType"') && html.includes('value="bar" selected'), 'HTML tem picklist com Bar como padrão');
  ok(['bar', 'radial', 'wave', 'aura'].every(v => html.includes(`value="${v}"`)), 'picklist tem Bar/Radial/Wave/Aura');
  ok(html.includes('agent-viz.js') && html.includes('agent-viz.css'), 'HTML referencia agent-viz.js/.css');
  ok(html.includes('id="lkDot"') && html.includes('id="lkTagTxt"'), 'HTML tem a bolinha/texto (mic | fone)');
  ok(html.indexOf('livekit-client.umd.js') < html.indexOf('agent-viz.js'), 'livekit-client UMD carrega ANTES do bundle');

  // 3. assets do bundle (era o ponto cego: o server.js só servia index/manifest/sw)
  r = await get('/agent-viz.js?v=1'); const js = await r.text();
  ok(r.status === 200, 'GET /agent-viz.js?v=1 200');
  ok(/javascript/.test(r.headers.get('content-type') || ''), 'agent-viz.js: Content-Type javascript', r.headers.get('content-type'));
  ok(js.length > 200_000 && js.length < 1_500_000, 'agent-viz.js: tamanho plausível', `${js.length} bytes`);
  ok(js.includes('AgentVizBridge'), 'agent-viz.js expõe window.AgentVizBridge');
  ok(!/from\s*["']livekit-client["']|require\(["']livekit-client["']\)/.test(js), 'agent-viz.js NÃO embute livekit-client (usa o global)');
  r = await get('/agent-viz.css?v=1'); const css = await r.text();
  ok(r.status === 200 && /text\/css/.test(r.headers.get('content-type') || ''), 'GET /agent-viz.css 200 text/css');
  // Tailwind SEM preflight: nada de box-sizing nem seletores globais (html/body/button/input/select). O bloco '*,:before,:after,::backdrop{--tw-...}' só declara variáveis CSS.
  ok(css.length > 1000 && !/box-sizing/.test(css) && !/(^|[};])(html|body|button|input|select)[,{ ]/.test(css), 'agent-viz.css sem preflight global (não afeta a página)', `${css.length} bytes`);

  // 4. segurança: lista fechada, sem path traversal nem listagem
  for (const bad of ['/agent-viz.js/../../.env', '/%2e%2e/.env', '/agent-viz.js%2f..%2fserver.js', '/viz/package.json', '/viz/src/bridge.tsx', '/../package.json']) {
    r = await get(bad); const body = await r.text();
    ok(r.status !== 200 || (!body.includes('livekit-server-sdk') && !body.includes('API_SECRET')), `bloqueado: ${bad}`, `status ${r.status}`);
  }

  // 5. token continua válido (JWT de 3 partes, sala call-<id>)
  r = await get('/token?callId=viztest&identity=viz-bot'); const t = await r.json();
  ok(r.status === 200 && typeof t.token === 'string' && t.token.split('.').length === 3, 'GET /token devolve JWT');
  const grant = JSON.parse(Buffer.from(t.token.split('.')[1], 'base64url').toString());
  ok(grant.video && grant.video.room === 'call-viztest' && grant.video.canPublish && grant.video.canSubscribe, 'JWT: sala call-viztest, publish+subscribe');

  console.log(fail ? `\n${fail} FALHA(S)` : '\nTODOS OS TESTES DE BACKEND PASSARAM');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('ERRO:', e.message); process.exit(2); });
