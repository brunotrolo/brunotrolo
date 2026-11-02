#!/usr/bin/env node
// Teste de INTERFACE headless (Playwright) SEM LiveKit SFU: injeta analisadores de áudio sintéticos
// nos mesmos objetos que a página usa (localAnalyser / remoteAnalysers) e verifica gráfico + bolinha.
// Uso:  npm i -D playwright && npx playwright install chromium
//       BASE_URL=http://localhost:8091 node tests/viz-e2e.js
// Opcional (sandbox sem internet): LK_UMD=/caminho/livekit-client.umd.js  (deve ser a 2.11.0)
const { chromium } = require('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:8091';
let fail = 0;
const ok = (c, msg, extra = '') => { console.log(`${c ? 'PASS' : 'FAIL'}  ${msg}${extra ? '  ' + extra : ''}`); if (!c) fail++; };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'];

async function open(browser, { blockBundle = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 420, height: 800 } });
  const p = await ctx.newPage(); p.errs = [];
  p.on('pageerror', e => p.errs.push(e.message));
  p.on('console', m => m.type() === 'error' && !/Failed to load resource/.test(m.text()) && p.errs.push(m.text()));
  if (process.env.LK_UMD) await p.route('**/unpkg.com/livekit-client**', r => r.fulfill({ path: process.env.LK_UMD, contentType: 'application/javascript' }));
  if (blockBundle) await p.route('**/agent-viz.js*', r => r.abort());
  await p.goto(BASE + '/'); await sleep(600);
  return p;
}
// Fontes sintéticas (osciladores) — dois analisadores independentes: "mic" e "fone"
const inject = (p) => p.evaluate(() => {
  const ctx = ensureAudioCtx();
  const mk = () => { const g = ctx.createGain();
    [140, 420, 900].forEach(f => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(g); o.start(); });
    g.gain.value = .3;   // volume CONSTANTE: o limiar de fala (RMS>0.03) fica estável e o teste determinístico
    const an = ctx.createAnalyser(); an.fftSize = 256; g.connect(an); return { analyser: an, buf: new Uint8Array(256) }; };
  window.__loc = mk(); window.__rem = mk();
  room = { localParticipant: {}, remoteParticipants: new Map() };   // "conectado" fake
});
const setSrc = (p, mic, fone) => p.evaluate(([m, f]) => {
  localAnalyser = m ? window.__loc : null; localSpeaking = m;
  for (const k of Object.keys(remoteAnalysers)) delete remoteAnalysers[k];
  if (f) remoteAnalysers.agent = { ...window.__rem, lastActive: Date.now() + 1e9, confirmed: true };
}, [mic, fone]);
const tag = (p) => p.evaluate(() => [lkDot.style.background, lkTagTxt.textContent]);

(async () => {
  const browser = await chromium.launch({ args: ARGS });

  // A. padrão + picklist + persistência
  let p = await open(browser);
  ok(await p.evaluate(() => typeof window.AgentVizBridge) === 'object', 'bundle carregou (AgentVizBridge)');
  ok(await p.evaluate(() => document.getElementById('vizType').value) === 'bar', 'padrão = Bar');
  await inject(p); await setSrc(p, true, false); await sleep(900);
  ok((await p.evaluate(() => getComputedStyle(document.getElementById('lkBars')).display)) === 'none', 'canvas antigo oculto quando o bundle existe');
  ok(await p.evaluate(() => document.querySelectorAll('#lkViz [data-lk-index]').length) === 5, 'Bar renderiza 5 barras');
  const barColor = await p.evaluate(() => getComputedStyle(document.querySelector('#lkViz [data-lk-index]')).backgroundColor);
  ok(/255,\s*255,\s*255/.test(barColor), 'Bar = branco (cor oficial, sem cor por estado)', barColor);

  // B. os 4 tipos renderizam e persistem
  await p.click('#configAccordion summary');
  for (const m of ['radial', 'wave', 'aura', 'bar']) {
    await p.selectOption('#vizType', m); await sleep(1400);
    const has = await p.evaluate(m => m === 'wave' || m === 'aura' ? !!document.querySelector('#lkViz canvas') : document.querySelectorAll('#lkViz [data-lk-index]').length > 0, m);
    ok(has, `tipo ${m} renderiza`);
  }
  await p.selectOption('#vizType', 'aura');
  ok(await p.evaluate(() => localStorage.getItem('vizType')) === 'aura', 'escolha salva no localStorage');
  await p.reload(); await sleep(600);
  ok(await p.evaluate(() => document.getElementById('vizType').value) === 'aura', 'escolha lembrada após recarregar');
  await p.evaluate(() => localStorage.removeItem('vizType'));

  // C. bolinha + texto nos 4 estados
  await p.reload(); await sleep(600); await inject(p);
  const cases = [['silêncio', false, false, 'rgb(63, 63, 70)', ''], ['mic', true, false, 'rgb(34, 197, 94)', 'mic'],
                 ['fone', false, true, 'rgb(239, 68, 68)', 'fone'], ['mic | fone', true, true, 'rgb(250, 204, 21)', 'mic | fone']];
  for (const [n, m, f, color, text] of cases) {
    await setSrc(p, m, f); await sleep(1000);
    const [c, t] = await tag(p);
    ok(c === color && t === text, `bolinha/texto: ${n}`, `${c} "${t}"`);
  }
  // C2. retenção: ao parar de falar, 'mic' segue ~700 ms (não pisca) e depois volta ao silêncio
  await setSrc(p, true, false); await sleep(900);
  await p.evaluate(() => { localAnalyser = null; localSpeaking = false; });
  await sleep(250); let [, t1] = await tag(p);
  await sleep(1300); let [, t2] = await tag(p);
  ok(t1 === 'mic' && t2 === '', 'retenção: "mic" a 250 ms, silêncio após ~1,5 s', `250ms="${t1}" 1,5s="${t2}"`);
  ok(p.errs.length === 0, 'sem erros de JS/console (fluxo principal)', p.errs.join(' | '));
  await p.context().close();

  // D. fallback: bundle bloqueado → gráfico antigo continua funcionando
  p = await open(browser, { blockBundle: true });
  await inject(p); await setSrc(p, true, false); await sleep(900);
  ok((await p.evaluate(() => getComputedStyle(document.getElementById('lkBars')).display)) !== 'none', 'fallback: canvas antigo visível sem o bundle');
  ok(p.errs.length === 0, 'fallback: sem erros de JS', p.errs.join(' | '));
  await p.context().close();

  await browser.close();
  console.log(fail ? `\n${fail} FALHA(S)` : '\nTODOS OS TESTES DE INTERFACE PASSARAM');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('ERRO:', e); process.exit(2); });
