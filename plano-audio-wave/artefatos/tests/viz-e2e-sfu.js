#!/usr/bin/env node
// Teste de PONTA A PONTA com LiveKit SFU REAL (2 navegadores headless com microfone falso do Chromium).
// >>> NÃO FOI EXECUTADO pelo autor do plano (o sandbox bloqueou rodar o binário do livekit-server). <<<
// Pré-requisitos: SFU no ar (docker compose up livekit), call-ingress rodando (porta 8091), playwright instalado.
// Uso:  BASE_URL=http://localhost:8091 node tests/viz-e2e-sfu.js
// Critério: durante 25 s, o celular (A) deve mostrar "mic" e o ouvinte (B) deve mostrar "fone" pelo menos uma vez.
const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:8091';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const ARGS = ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream',
              '--autoplay-policy=no-user-gesture-required', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];

async function join(browser, identity, publish) {
  const ctx = await browser.newContext({ permissions: ['microphone'], viewport: { width: 420, height: 800 } });
  const p = await ctx.newPage(); p.errs = []; p.seen = new Set();
  p.on('pageerror', e => p.errs.push(e.message));
  await p.goto(`${BASE}/?call=e2e-viz&identity=${identity}`);
  await p.evaluate(pub => { document.getElementById('pubMic').checked = pub; }, publish);
  await p.click('#joinBtn');
  return p;
}
(async () => {
  const browser = await chromium.launch({ args: ARGS });
  const A = await join(browser, 'e2e-phone', true);      // publica microfone
  const B = await join(browser, 'e2e-listener', false);  // só ouve
  for (let i = 0; i < 125; i++) {                         // 25 s, amostrando a cada 200 ms
    for (const p of [A, B]) p.seen.add(await p.evaluate(() => document.getElementById('lkTagTxt').textContent));
    await sleep(200);
  }
  const res = [
    ['A (celular) viu "mic"', A.seen.has('mic') || A.seen.has('mic | fone')],
    ['B (ouvinte) viu "fone"', B.seen.has('fone') || B.seen.has('mic | fone')],
    ['sem erros de JS em A e B', A.errs.length + B.errs.length === 0],
  ];
  res.forEach(([n, c]) => console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`));
  console.log('A viu:', [...A.seen], ' B viu:', [...B.seen], ' erros:', [...A.errs, ...B.errs]);
  await browser.close();
  process.exit(res.every(r => r[1]) ? 0 : 1);
})().catch(e => { console.error('ERRO:', e); process.exit(2); });
