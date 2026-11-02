# Plano de ajuste — gráfico de áudio com Bar / Radial / Wave / Aura + marcador mic | fone

> **RASCUNHO — requer revisão humana antes de executar.**
> Destinatário: **opencode** (agente de código). Repositório alvo: `brunotrolo/Salesforce_Copilot_LiveKit` (HEAD usado na homologação: `7e9950b`).
> Os trechos de código deste documento foram extraídos dos arquivos efetivamente testados (verificados por asserção na geração), não reescritos.

---

## 0. Como usar este documento (instruções para o opencode)

1. Execute as fases **na ordem** da seção 5. Não pule a Fase 0 (baseline) nem as fases de teste.
2. Cada alteração tem **DE (atual) → PARA (novo)** na seção 6. Os mesmos patches estão prontos em `artefatos/patches/*.patch` (aplicam limpos com `patch -p1` sobre o HEAD `7e9950b`). **Prefira aplicar os patches; use o DE→PARA para conferir.**
3. Arquivos novos estão integralmente na seção 7 e em `artefatos/`.
4. **Não** altere a lógica de áudio/LiveKit (`ensureAudioCtx`, `monitorRemoteAudio`, `monitorLocalAudio`, `room.*`, token). A mudança é só de apresentação.
5. **Não** coloque segredos em nenhum arquivo (ver achado 3.3). Os testes usam variáveis de ambiente.
6. Se qualquer critério de aceite da seção 8 falhar: pare, reporte o comando e a saída; não "contorne" o teste.

## 1. Resultado final esperado (aprovado nas conversas)

| Item | Especificação |
|---|---|
| Tipos de gráfico | **Bar, Radial, Wave, Aura** — componentes **oficiais** do LiveKit Agents UI, sem alteração |
| Seletor | Picklist **dentro** do accordion "Configurações avançadas", rótulo "Tipo do gráfico de áudio:" |
| Padrão | **Bar** (escolha lembrada em `localStorage`, chave `vizType`) |
| Cores dos gráficos | **Não mudam com o estado**: Bar e Radial **brancos**; Wave e Aura **azul claro** (`#1FD5F9`, padrão oficial) |
| Única marcação de cor | **Bolinha + texto discreto** abaixo do gráfico: verde `mic` · vermelho `fone` · amarelo `mic \| fone` (ambos ao mesmo tempo) · cinza escuro sem texto (silêncio) |
| Texto | cinza escuro, fonte pequena (`.7rem`) |
| Retenção | `mic` permanece 700 ms após parar de falar (evita piscar entre palavras) |
| Fallback | Se `agent-viz.js` não carregar (404/offline), o canvas antigo (ADR-0011) continua funcionando |
| Fora do escopo | Lógica de áudio, token, sala, telefonia, Egress, HTTPS/iOS |

## 2. Onde está o gráfico hoje (mapa do código, HEAD `7e9950b`)

| O quê | Onde |
|---|---|
| Servidor de UI + token (o que roda no container `livekit-test-web`, porta 8091) | `call-ingress/server.js` — serve **apenas** `/`, `/index.html`, `/manifest.json`, `/sw.js`, `/token`, `/health`, `/room`, `/logs` |
| Página | `client-web/index.html` (875 linhas, um arquivo, sem build) |
| Gráfico atual | `canvas#lkBars` (≈ linha 251) + `drawBars()` (≈ linha 424): 64 barras Canvas 2D, pico amarelo, cor por estado |
| Loop de pintura | `paintStage()` (≈ linha 480) → `requestAnimationFrame` |
| Fontes de áudio | `localAnalyser`, `remoteAnalysers{}` (Web Audio `AnalyserNode`, `fftSize` 256) |
| "Falando" local | monitor a cada 300 ms: `rms > 0.03` → `localSpeaking` (**sem retenção**) |
| "Ouvindo" remoto | `lastActive` com retenção de 1500 ms |
| Accordion | `<details id="configAccordion">` ≈ linha 262, título "Configurações avançadas" |
| Decisão registrada | `adr/0011-visualizador-analogico-duplex.md` |
| Cliente LiveKit | `livekit-client@2.11.0` UMD via unpkg (global `LivekitClient`) |
| Servidor alternativo (dev) | `client-web/server.py` — `SimpleHTTPRequestHandler`, já serve estáticos sozinho |

## 3. Achados que mudam a execução (leia antes de codar)

**3.1 CRÍTICO — o servidor não serve arquivos novos.** `call-ingress/server.js` só tem rotas explícitas. Sem a rota nova (seção 6.2), `agent-viz.js`/`.css` dão 404 e a página **cai silenciosamente no gráfico antigo** — parece que "nada mudou". Os testes de backend (Fase 3) existem para pegar exatamente isso.

**3.2 `tools/check_livekit.py` exige exatamente 11 ADRs.** Adicionar o ADR-0012 sem atualizar a contagem quebra a verificação (erro comprovado: `adr/ tem 11 arquivos, esperado 12` antes do ajuste; `erros: 0` depois).

**3.3 SEGURANÇA — segredo de API em arquivos versionados.** O secret do LiveKit aparece em texto claro em: `TESTING.md`, `HOMOLOGATION.md`, `.env.example`, `test-token.test.js` e como valor *default* em `call-ingress/server.js` (`process.env.LIVEKIT_API_SECRET || '...'`). **Não replicar** em nenhum arquivo novo. Recomendação (fora deste escopo, mas urgente): **rotacionar o secret** no servidor LiveKit e comunicar à Segurança da Informação; depois remover os valores do repositório e do histórico. Os testes deste plano leem `LIVEKIT_API_SECRET` do ambiente.

**3.4 WebGL × ADR-0011.** O ADR-0011 rejeitou shader/WebGL por desempenho no celular/VPS. Wave e Aura **são shaders WebGL**. Por isso há um ADR-0012 (rascunho em `artefatos/adr/`) e um **gate de aparelho real** na Fase 5. Se Wave/Aura reprovarem no celular, reduza o picklist a Bar e Radial (remova as duas `<option>` e os dois `case` — o resto não muda).

**3.5 Bundle compilado contra livekit-client 2.23, executado com 2.11.0.** O bundle **não** embute o `livekit-client`; usa o global da página (2.11.0). Foi **testado com a 2.11.0 real** (UMD do npm), sem erros. Se alguém subir a versão do UMD na página, rode a Fase 4 de novo.

**3.6 O "falando" local oscila.** `rms > 0.03` a cada 300 ms sem retenção. Sem a retenção de 700 ms no marcador, a bolinha `mic` pisca entre palavras. Já tratado no código (`TAG_HOLD_MS`), com teste.

**3.7 Bar oficial ≠ Bar atual.** O oficial tem **5 barras** e **não** tem a linha de pico amarela. É uma troca visual deliberada; o gráfico antigo continua como fallback técnico (não como opção do picklist).

## 4. Estrutura final de arquivos

```
Salesforce_Copilot_LiveKit/
├─ adr/0012-visualizadores-oficiais-livekit.md        (NOVO)  ← artefatos/adr/
├─ call-ingress/server.js                              (ALTERADO: +rota dos assets)
├─ tools/check_livekit.py                              (ALTERADO: 11 → 12 ADRs)
├─ tests/                                              (NOVO)  ← artefatos/tests/
│   ├─ viz-backend.test.js     (Node puro, sem navegador)
│   ├─ viz-e2e.js              (Playwright, sem SFU)
│   └─ viz-e2e-sfu.js          (Playwright + SFU real)
└─ client-web/
    ├─ index.html                                      (ALTERADO: picklist + bolinha + drawViz)
    ├─ agent-viz.js  / agent-viz.css                   (GERADOS pelo build, COMMITADOS)
    └─ viz/                                            (NOVO)  ← artefatos/viz/
        ├─ package.json, vite.config.ts, fetch-official.mjs
        └─ src/ bridge.tsx, bridge.css, lib/utils.ts
            └─ components/ e hooks/  (baixados por `npm run fetch`, commitados, NÃO editar)
```

## 5. Plano de execução em fases

| Fase | O que fazer | Comando / ação | Critério de saída |
|---|---|---|---|
| **0 — Baseline** | Branch nova e conferir que o repo está verde antes de mexer | `git checkout -b feat/viz-oficiais` · `python3 tools/check_livekit.py` · `node --check call-ingress/server.js` | `erros: 0`; sintaxe OK; anote o HEAD |
| **1 — Bundle** | Criar `client-web/viz/`, baixar fontes oficiais, compilar | `mkdir client-web/viz` (copiar `artefatos/viz/*`) · `cd client-web/viz && npm install && npm run fetch && npm run build` | gera `client-web/agent-viz.js` (~390 KB) e `.css` (~7,5 KB); **`client-web/` não foi esvaziado** (`emptyOutDir:false`); hashes de `fetch` batem com a seção 9 |
| **2 — Patches** | Aplicar os 3 patches + ADR | `patch -p1 < artefatos/patches/01-index.html.patch` (idem 02, 03) · copiar `adr/0012-*.md` | `patch` sem rejeição; `python3 tools/check_livekit.py` → `erros: 0` |
| **3 — Testes de BACKEND** (antes de qualquer teste real) | ver seção 8, camadas L0–L2 | `node tests/viz-backend.test.js` com o servidor no ar | 24/24 PASS |
| **4 — Testes de INTERFACE headless** | L3 (sem SFU) e L4 (com SFU real) | `node tests/viz-e2e.js` · `node tests/viz-e2e-sfu.js` | todos PASS, 3 rodadas seguidas sem falha |
| **5 — Teste REAL** | smartphone + VPS, roteiro do `TESTING.md` + checklist da seção 8.5 | manual | checklist 100% marcado, **inclusive desempenho de Wave/Aura no celular** |
| **6 — Entrega** | Commit, PR, rollback documentado | ver seção 10 | CI/checks do repo verdes; PR com resultados colados |

## 6. DE → PARA (código real)

> Os patches completos estão em `artefatos/patches/`. Os blocos abaixo mostram, para cada ponto de edição, o código **atual** e como deve **ficar**.

### 6.1 `client-web/index.html`

#### 6.1.1 `<head>` — carregar o bundle (depois do livekit-client)

**DE (atual):**

```html
<script src="https://unpkg.com/livekit-client@2.11.0/dist/livekit-client.umd.js"></script>
```

**PARA (novo):**

```html
<script src="https://unpkg.com/livekit-client@2.11.0/dist/livekit-client.umd.js"></script>
<link rel="stylesheet" href="agent-viz.css?v=1"/>
<script src="agent-viz.js?v=1" defer></script>
```


#### 6.1.2 Corpo — container do visualizador + bolinha/texto (canvas antigo fica como fallback)

**DE (atual):**

```html
  <canvas id="lkBars" height="120"></canvas>
</div>
```

**PARA (novo):**

```html
  <canvas id="lkBars" height="120"></canvas>
  <div id="lkViz" style="color:#fff;display:none;height:240px;align-items:center;justify-content:center;overflow:hidden"></div>
  <div id="lkTag" aria-live="off" style="display:flex;align-items:center;justify-content:center;gap:6px;margin-top:6px;height:16px;font-size:.7rem;color:#52525b;letter-spacing:.02em">
    <span id="lkDot" style="width:7px;height:7px;border-radius:50%;background:#3f3f46;transition:background .15s"></span><span id="lkTagTxt"></span>
  </div>
</div>
```


#### 6.1.3 Accordion "Configurações avançadas" — picklist (Bar padrão)

**DE (atual):**

```html
  <summary style="cursor:pointer;font-weight:600;list-style:none">Configurações avançadas</summary>
  <div class="row">
    <label for="wsUrl">WS URL:</label>
```

**PARA (novo):**

```html
  <summary style="cursor:pointer;font-weight:600;list-style:none">Configurações avançadas</summary>
  <div class="row">
    <label for="vizType">Tipo do gráfico de áudio:</label>
    <select id="vizType" title="Visual do medidor de áudio">
      <option value="bar" selected>Bar</option>
      <option value="radial">Radial</option>
      <option value="wave">Wave</option>
      <option value="aura">Aura</option>
    </select>
  </div>
  <div class="row">
    <label for="wsUrl">WS URL:</label>
```


#### 6.1.4 JS — seletor, `drawViz`, marcador `updateTag` (inserido antes de `paintStage`)

**DE (atual):**

```js
// Agulhas removidas
function paintStage() {
```

**PARA (novo):**

```js
// ---------- Seletor de visual (Bar | Radial | Wave | Aura) + marcador mic/fone ----------
const vizSel = document.getElementById('vizType');
const lkViz = document.getElementById('lkViz');
let vizMode = 'bar', vizHandle = null, _lastViz = 0;
try {
  const saved = localStorage.getItem('vizType');
  if (saved && [...vizSel.options].some(o => o.value === saved)) vizMode = saved;
} catch (e) { /* localStorage indisponível: segue com o padrão */ }
vizSel.value = vizMode;
vizSel.addEventListener('change', () => {
  vizMode = vizSel.value;
  try { localStorage.setItem('vizType', vizMode); } catch (e) {}
});
function pickAnalyser(talking, hearing) {
  if (talking && localAnalyser) return localAnalyser.analyser;
  if (hearing.length && remoteAnalysers[hearing[0]]) return remoteAnalysers[hearing[0]].analyser;
  return null;
}
function drawViz(talking, hearing) {
  // Sem o bundle (offline/bloqueado/404): mantém o gráfico antigo (ADR-0011)
  if (!window.AgentVizBridge) {
    lkBars.style.display = ''; lkViz.style.display = 'none';
    drawBars(lkBars, localAnalyser, remoteAnalysers, talking, hearing);
    return;
  }
  const now = performance.now();
  if (now - _lastViz < 33) return;            // ~30 fps: metade do custo de render do React
  _lastViz = now;
  lkBars.style.display = 'none'; lkViz.style.display = 'flex';
  vizHandle ??= window.AgentVizBridge.mount(lkViz);
  const an = pickAnalyser(talking, hearing);
  const active = !!an && (talking || hearing.length > 0);
  let bands = [0, 0, 0, 0, 0], volume = 0;
  if (an) {
    const f = new Uint8Array(an.frequencyBinCount); an.getByteFrequencyData(f);
    const per = Math.floor(f.length * 0.5 / 5) || 1;   // 5 faixas sobre a metade grave/média do espectro (voz)
    bands = bands.map((_, i) => {
      let m = 0; for (let k = i * per; k < (i + 1) * per; k++) m = Math.max(m, f[k] || 0);
      return Math.min(1, m / 255 * 1.2);
    });
    volume = Math.min(1, bands.reduce((a, b) => a + b, 0) / 5 * 1.5);
  }
  vizHandle.update({ mode: vizMode, state: !room ? 'disconnected' : active ? 'speaking' : 'listening', bands, volume });
}
// Marcador discreto: bolinha + texto. Única marcação de cor da tela (os gráficos usam as cores oficiais).
const TAG = { mic: ['#22c55e', 'mic'], fone: ['#ef4444', 'fone'], both: ['#facc15', 'mic | fone'], idle: ['#3f3f46', ''] };
const lkDot = document.getElementById('lkDot'), lkTagTxt = document.getElementById('lkTagTxt');
let _tagKey = '', _lastTalk = 0;
const TAG_HOLD_MS = 700;                      // o "falando" local não tem retenção (limiar RMS a cada 300 ms): evita a bolinha piscar entre palavras
function updateTag(talking, hearing) {
  const now = performance.now();
  if (talking) _lastTalk = now;
  const micOn = talking || (now - _lastTalk < TAG_HOLD_MS);
  const key = micOn && hearing.length ? 'both' : micOn ? 'mic' : hearing.length ? 'fone' : 'idle';
  if (key === _tagKey) return;                // só mexe no DOM quando o estado muda
  _tagKey = key; lkDot.style.background = TAG[key][0]; lkTagTxt.textContent = TAG[key][1];
}
// Agulhas removidas
function paintStage() {
```


#### 6.1.5 JS — `paintStage()`: trocar a chamada direta de `drawBars`

**DE (atual):**

```js
  drawBars(lkBars, localAnalyser, remoteAnalysers, talking, hearing);
  requestAnimationFrame(paintStage);
```

**PARA (novo):**

```js
  updateTag(talking, hearing);
  drawViz(talking, hearing);
  requestAnimationFrame(paintStage);
```


#### 6.1.6 Rodapé — versão (para confirmar que o navegador pegou o HTML novo)

**DE (atual):**

```html
versão: 2026-11-02-single (se não
```

**PARA (novo):**

```html
versão: 2026-11-02-viz (se não
```


### 6.2 `call-ingress/server.js`

#### 6.2.1 `call-ingress/server.js` — servir `agent-viz.js` e `agent-viz.css` (inserir imediatamente antes da rota `/token`)

**DE (atual):**

```js
  if (parsed.pathname === '/token') {
    try {
      const callId
```

**PARA (novo):**

```js
  // Assets do visualizador (bundle gerado por client-web/viz). Lista FECHADA: sem path traversal.
  const VIZ_ASSETS = {
    '/agent-viz.js': 'application/javascript; charset=utf-8',
    '/agent-viz.css': 'text/css; charset=utf-8',
  };
  if (Object.hasOwn(VIZ_ASSETS, parsed.pathname)) {
    try {
      const file = path.join(__dirname, '..', 'client-web', path.basename(parsed.pathname));
      res.writeHead(200, { 'Content-Type': VIZ_ASSETS[parsed.pathname], 'Cache-Control': 'no-cache' });
      res.end(fs.readFileSync(file));
    } catch (e) {
      res.writeHead(404);
      res.end();
    }
    return;
  }

  if (parsed.pathname === '/token') {
    try {
      const callId
```


### 6.3 `tools/check_livekit.py`

#### 6.3.1 `tools/check_livekit.py` — contagem de ADRs 11 → 12

**DE (atual):**

```python
# 2. adr/ tem 11 arquivos
adr_files = sorted(glob.glob(os.path.join(ADR_DIR, "*.md")))
if len(adr_files) != 11:
    errors.append(f"adr/ tem {len(adr_files)} arquivos, esperado 11")
```

**PARA (novo):**

```python
# 2. adr/ tem 12 arquivos (0012 = visualizador oficial LiveKit, substitui parcialmente o 0011)
adr_files = sorted(glob.glob(os.path.join(ADR_DIR, "*.md")))
if len(adr_files) != 12:
    errors.append(f"adr/ tem {len(adr_files)} arquivos, esperado 12")
if not adr_files:
    errors.append("adr/ vazio ou ausente")
```


### 6.4 Observação opcional (não incluída nos patches)

A linha `<p class="hint">mic  fone</p>` (cabeçalho da página) parece ter perdido os ícones e fica redundante com a bolinha nova. **Decisão pendente do dono** — não remover sem confirmação.

## 7. Arquivos novos (conteúdo integral — idêntico ao homologado)

### 7.1 `client-web/viz/package.json`
```json
{
  "name": "agent-viz-bundle",
  "private": true,
  "type": "module",
  "description": "Bundle dos visualizadores oficiais LiveKit Agents UI (Bar/Radial/Wave/Aura) para o client-web",
  "scripts": {
    "fetch": "node fetch-official.mjs",
    "build": "vite build"
  },
  "dependencies": {
    "@livekit/components-react": "2.9.24",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "livekit-client": "2.23.0",
    "motion": "14.9.0",
    "react": "19.3.1",
    "react-dom": "19.3.1",
    "tailwind-merge": "3.7.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "4.3.3",
    "@vitejs/plugin-react": "4.7.0",
    "tailwindcss": "4.3.3",
    "typescript": "5.9.3",
    "vite": "6.4.5"
  }
}
```

### 7.2 `client-web/viz/vite.config.ts`
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

// Saída: client-web/agent-viz.js e client-web/agent-viz.css (um nível acima de viz/).
// livekit-client NÃO entra no bundle: usa o global `LivekitClient` que a página já carrega (UMD 2.11.0).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: { 'process.env.NODE_ENV': '"production"' },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  build: {
    outDir: '..',
    emptyOutDir: false, // CRÍTICO: nunca limpar client-web/
    cssCodeSplit: false,
    lib: { entry: 'src/bridge.tsx', formats: ['iife'], name: 'AgentVizBundle', fileName: () => 'agent-viz.js' },
    rollupOptions: {
      external: ['livekit-client'],
      output: { globals: { 'livekit-client': 'LivekitClient' }, assetFileNames: 'agent-viz.[ext]' },
    },
  },
});
```

### 7.3 `client-web/viz/fetch-official.mjs`
```js
// Baixa o código OFICIAL dos componentes do registry shadcn do LiveKit (sem alteração) para src/.
// Uso: npm run fetch   (Node >= 18)
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';

const BASE = 'https://livekit.com/ui/r/';
const ITEMS = ['agent-audio-visualizer-bar', 'agent-audio-visualizer-radial',
               'agent-audio-visualizer-wave', 'agent-audio-visualizer-aura', 'react-shader-toy'];

for (const name of ITEMS) {
  const res = await fetch(`${BASE}${name}.json`, { redirect: 'follow' });
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  const reg = await res.json();
  for (const f of reg.files) {
    const out = join('src', f.path);              // ex.: src/components/agents-ui/agent-audio-visualizer-bar.tsx
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, f.content);
    console.log(createHash('sha256').update(f.content).digest('hex').slice(0, 16), out);
  }
}
```

### 7.4 `client-web/viz/src/bridge.tsx`
```tsx
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { AgentState } from '@livekit/components-react';
import { AgentAudioVisualizerBar } from '@/components/agents-ui/agent-audio-visualizer-bar';
import { AgentAudioVisualizerRadial } from '@/components/agents-ui/agent-audio-visualizer-radial';
import { AgentAudioVisualizerWave } from '@/components/agents-ui/agent-audio-visualizer-wave';
import { AgentAudioVisualizerAura } from '@/components/agents-ui/agent-audio-visualizer-aura';
import './bridge.css';

export type VizMode = 'bar' | 'radial' | 'wave' | 'aura';
export interface VizProps {
  mode: VizMode;
  state: AgentState;   // 'disconnected' | 'listening' | 'speaking' ...
  bands: number[];     // 5 valores 0..1 (Bar/Radial)
  volume: number;      // 0..1 (Wave/Aura)
}

// Sem `color`: cada componente usa a cor padrão oficial
// (Bar/Radial = currentColor → branco via CSS do container; Wave/Aura = #1FD5F9).
function View({ p }: { p: VizProps }) {
  const common = { state: p.state };
  switch (p.mode) {
    case 'radial': return <AgentAudioVisualizerRadial size="lg" volumeBands={p.bands} {...common} />;
    case 'wave':   return <AgentAudioVisualizerWave size="md" volume={p.volume} {...common} />;
    case 'aura':   return <AgentAudioVisualizerAura size="md" volume={p.volume} {...common} />;
    default:       return <AgentAudioVisualizerBar size="lg" barCount={5} volumeBands={p.bands} {...common} />;
  }
}

// Ponte para a página (JS puro): mount() uma vez, update() a cada frame.
// Não toca no áudio nem no LiveKit — recebe só números já calculados pela página.
(window as any).AgentVizBridge = {
  mount(el: HTMLElement) {
    const root: Root = createRoot(el);
    return {
      update(p: VizProps) { root.render(<View p={p} />); },
      destroy() { root.unmount(); },
    };
  },
};
```

### 7.5 `client-web/viz/src/bridge.css`
```css
/* Tailwind SEM preflight: não altera nenhum estilo global da página existente. */
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);
@source "./components";
```

### 7.6 `client-web/viz/src/lib/utils.ts`
```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Equivalente ao `cn` do shadcn, exigido pelos componentes oficiais (import '@/lib/utils').
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 7.7 `adr/0012-visualizadores-oficiais-livekit.md`
```markdown
# ADR-0012: Visualizadores oficiais LiveKit (Bar, Radial, Wave, Aura) com seletor e marcador mic/fone

## Status
Proposto (rascunho — requer revisão humana). Substitui parcialmente o ADR-0011 (visual do medidor);
mantém do ADR-0011 a derivação de estado por `localSpeaking` e `remoteAnalysers` e o gráfico antigo como fallback.

## Contexto
O ADR-0011 adotou barras em Canvas 2D e rejeitou WebGL/shader por desempenho em celular e VPS.
Pedido: usar os visualizadores oficiais do LiveKit Agents UI (Bar, Radial, Wave, Aura), escolhíveis em
"Configurações avançadas", com Bar como padrão, e indicar a origem do áudio por uma bolinha discreta.

## Decisão
* Código oficial dos componentes, sem alteração, empacotado em `client-web/viz` (ver `viz/`) → `client-web/agent-viz.js|css`.
* A página alimenta os componentes com o volume que já calcula (`volumeBands` no Bar/Radial, `volume` no Wave/Aura); nenhuma mudança no fluxo de áudio/LiveKit.
* Gráficos mantêm as cores oficiais (Bar/Radial brancos; Wave/Aura #1FD5F9). A única marcação de cor é a bolinha:
  verde `mic`, vermelho `fone`, amarelo `mic | fone`, cinza (sem texto) em silêncio. Retenção de 700 ms no `mic`.
* Escolha do tipo persistida em `localStorage` (`vizType`); padrão `bar`.
* Fallback: se `agent-viz.js` não carregar, o canvas antigo (ADR-0011) continua.
* `livekit-client` não é embutido: usa o UMD 2.11.0 já carregado pela página.

## Consequências
+ Visual igual à documentação oficial do LiveKit; troca de tipo sem recarregar.
+ Fallback preserva o comportamento atual.
- Wave e Aura usam WebGL (shader): risco de desempenho em celular — homologar em aparelho real; se reprovar, restringir o picklist a Bar e Radial.
- Passa a existir um artefato gerado (`agent-viz.js`, ~390 KB / ~125 KB gzip) e uma etapa de build (Node).
- O Bar oficial tem 5 barras e não tem a linha de pico amarela do ADR-0011.

## Referências
ADR-0011, ADR-0010, client-web/index.html (drawViz, updateTag), call-ingress/server.js (assets do visualizador)
```

## 8. Estratégia de testes (do mais barato ao mais caro)

Princípio: **nada vai para o celular antes de passar L0–L4.** Cada camada isola uma classe de erro.

| Camada | O que prova | Precisa de | Comando | Foi executada? |
|---|---|---|---|---|
| **L0 Estático** | sintaxe, consistência de docs, bundle gerado | Node, Python | `node --check call-ingress/server.js` · `python3 tools/check_livekit.py` · `ls -la client-web/agent-viz.*` | **Sim** — `erros: 0`; js 389 596 B, css 7 518 B |
| **L1 Servidor HTTP** (backend) | rotas novas servem os assets; nada vaza; rotas antigas intactas; token válido | só o `call-ingress` no ar | `BASE_URL=http://localhost:8091 node tests/viz-backend.test.js` | **Sim — 24/24 PASS** |
| **L2 SFU** (backend) | LiveKit cria/lista/remove sala | SFU no ar | `LIVEKIT_URL=ws://localhost:7880 LIVEKIT_API_KEY=… LIVEKIT_API_SECRET=… node test-homologation.js` (já existe no repo) | **Não** (sem SFU no sandbox) — rodar no ambiente real |
| **L3 Interface sem SFU** | picklist, 4 tipos renderizam, padrão Bar, cor oficial, persistência, bolinha nos 4 estados, retenção, fallback | Playwright + Chromium | `LK_UMD=<umd 2.11.0> BASE_URL=http://localhost:8091 node tests/viz-e2e.js` | **Sim — 19/19 PASS, 3 rodadas seguidas**, com `livekit-client` 2.11.0 real |
| **L4 Ponta a ponta com SFU** | 2 navegadores reais na mesma sala: A publica mic → A mostra `mic`, B mostra `fone` | SFU + `call-ingress` + Playwright | `BASE_URL=http://localhost:8091 node tests/viz-e2e-sfu.js` | **NÃO executada por mim** (o sandbox bloqueou rodar o binário do servidor LiveKit). Só passou checagem de sintaxe. **Tratar como não homologada.** |
| **L5 Real** | celular + VPS, microfone verdadeiro, WebGL no aparelho | Android com a flag do `TESTING.md` | roteiro 8.5 | **Não** |

### 8.1 Preparar o ambiente de teste (sem segredos no código)

```bash
# no servidor/VPS (valores vêm do ambiente, NUNCA commitar)
export LIVEKIT_URL=ws://localhost:7880
export LIVEKIT_API_KEY=<chave>
export LIVEKIT_API_SECRET=<secret — rotacionado, ver achado 3.3>
export PORT=8091
npm install                       # raiz: livekit-server-sdk, dotenv
node call-ingress/server.js &     # sobe UI + token + assets
curl -s http://localhost:8091/health   # → {"status":"ok"}
```

### 8.2 L1 — o que `viz-backend.test.js` verifica (24 asserções)

- `/health`, `/sw.js`, `/manifest.json` continuam 200 (regressão).
- `/` traz `#vizType` com `bar` selecionado, as 4 opções, `#lkDot`/`#lkTagTxt`, referência a `agent-viz.js|css`, e o `livekit-client` UMD vem **antes** do bundle.
- `/agent-viz.js?v=1`: 200, `Content-Type` javascript, tamanho plausível (200 KB–1,5 MB), expõe `AgentVizBridge`, **não** embute `livekit-client`.
- `/agent-viz.css?v=1`: 200, `text/css`, sem `box-sizing` nem seletores globais (`html/body/button/input/select`) — não altera a página.
- **Segurança:** `/agent-viz.js/../../.env`, `/%2e%2e/.env`, `/agent-viz.js%2f..%2fserver.js`, `/viz/package.json`, `/viz/src/bridge.tsx`, `/../package.json` → todos **404**.
- `/token?callId=viztest&identity=viz-bot` → JWT de 3 partes, sala `call-viztest`, `canPublish` e `canSubscribe`.

### 8.3 L3 — o que `viz-e2e.js` verifica (19 asserções)

Bundle carregou · padrão Bar · canvas antigo oculto · Bar com 5 barras e **branco** · Radial/Wave/Aura/Bar renderizam · escolha salva e lembrada após recarregar · bolinha/texto nos 4 estados com as cores exatas (`rgb(63,63,70)` vazio · `rgb(34,197,94)` mic · `rgb(239,68,68)` fone · `rgb(250,204,21)` mic \| fone) · retenção (`mic` a 250 ms, vazio após 1,5 s) · **zero erros de JS/console** · fallback com `agent-viz.js` bloqueado (canvas antigo visível, zero erros).

Como o teste não tem SFU, ele injeta fontes de áudio sintéticas **nas mesmas variáveis que a página usa** (`localAnalyser`, `remoteAnalysers`, `localSpeaking`). Isso valida a camada nova, **não** a captura real de microfone/WebRTC — por isso existem L4 e L5.

### 8.4 L4 — procedimento (a executar pelo opencode)

```bash
npm i -D playwright && npx playwright install chromium
BASE_URL=http://localhost:8091 node tests/viz-e2e-sfu.js
# esperado: PASS "A (celular) viu mic" · PASS "B (ouvinte) viu fone" · PASS "sem erros de JS"
```
Se falhar por **limiar de fala** (o microfone falso do Chromium dá bipes curtos e `rms > 0.03` pode não disparar), isso é limitação do teste, não do código: registre e siga para L5. Se falhar por **erro de JS** ou **bundle 404**, é bug: corrija antes de seguir.

### 8.5 L5 — checklist de teste real (smartphone Android + VPS)

Seguir `TESTING.md` §2 (flag `unsafely-treat-insecure-origin-as-secure` no Android; iOS exige HTTPS — pendência já conhecida) e marcar:

- [ ] `http://<IP>:8091/agent-viz.js` abre no **celular** (200, não 404) — pré-check de rede.
- [ ] Página abre sem tela branca; versão no rodapé mostra `2026-11-02-viz` (se não, `Ctrl+Shift+R`).
- [ ] Accordion abre; picklist mostra Bar/Radial/Wave/Aura; **padrão = Bar**.
- [ ] Falar no celular: bolinha **verde** `mic`; Bar **branco** reage à voz.
- [ ] Som chegando da outra ponta: bolinha **vermelha** `fone`.
- [ ] Os dois ao mesmo tempo: bolinha **amarela** `mic | fone`.
- [ ] Silêncio: bolinha cinza sem texto.
- [ ] Trocar para Radial, Wave, Aura **durante a chamada**: troca imediata, sem recarregar, sem travar o áudio.
- [ ] **Desempenho (gate do ADR-0012):** com Wave e Aura por ~2 min, o celular não esquenta de forma anormal, a UI não engasga, e o **áudio da chamada não corta**. Reprovou → restringir a Bar/Radial.
- [ ] Recarregar a página: tipo escolhido é lembrado.
- [ ] Console (`chrome://inspect`) sem erros vermelhos.
- [ ] Bloquear `agent-viz.js` (ou desligar o rewrite) → volta o gráfico antigo, sem quebrar a chamada.

## 9. Integridade das fontes oficiais (sha256, 16 primeiros caracteres)

Gerado em 2026-11-02 pelo `npm run fetch`. Se os hashes mudarem, o LiveKit atualizou o registry: **não aceite em silêncio** — rode L3 e confira visualmente.

```
6e80154fb3e69256  src/components/agents-ui/agent-audio-visualizer-aura.tsx
77bef3b4ba84412b  src/components/agents-ui/agent-audio-visualizer-bar.tsx
d3bcf70a1fb83d7c  src/components/agents-ui/agent-audio-visualizer-radial.tsx
daf1fa9df5d42c58  src/components/agents-ui/agent-audio-visualizer-wave.tsx
eb8efb252e7908e2  src/components/agents-ui/react-shader-toy.tsx
664e87be6523b660  src/hooks/agents-ui/use-agent-audio-visualizer-aura.ts
634ccbee073652a8  src/hooks/agents-ui/use-agent-audio-visualizer-bar.ts
d60888c2c7ef144f  src/hooks/agents-ui/use-agent-audio-visualizer-radial.ts
db83bd092ec88bc4  src/hooks/agents-ui/use-agent-audio-visualizer-wave.ts
```
Versões fixadas no `package.json`: react 19.3.1 · react-dom 19.3.1 · @livekit/components-react 2.9.24 · livekit-client 2.23.0 (só tipos; em runtime usa o UMD 2.11.0 da página) · motion 14.9.0 · tailwindcss 4.3.3 · vite 6.4.5.

## 10. Entrega, rollback e riscos

**Commit sugerido (3 commits):** (1) `viz/` + `agent-viz.js|css`; (2) patches (`index.html`, `server.js`, `check_livekit.py`) + ADR-0012; (3) `tests/`.
**PR:** colar a saída de L0, L1, L3 (e L4 quando executado) na descrição.

**Rollback (do mais leve ao mais completo):**
1. *Sem deploy:* o fallback já devolve o gráfico antigo se `agent-viz.js` sumir/404.
2. *Reverter a UI:* `git revert` do commit (2) — `index.html` volta ao canvas antigo; o resto fica inerte.
3. *Remover tudo:* `git revert` dos 3 commits.

| Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|
| Wave/Aura (WebGL) pesados no celular | média (não medido) | médio | gate L5; restringir a Bar/Radial |
| Registry do LiveKit mudar o código | baixa | médio | fontes commitadas + hashes (seção 9) |
| `unpkg` fora do ar (UMD do livekit-client) | baixa | alto (já existe hoje) | fora do escopo; sugerir hospedar o UMD localmente |
| Segredo do LiveKit exposto no repo | **já ocorre** | alto | rotacionar + Segurança da Informação (achado 3.3) |
| Licença dos componentes LiveKit | desconhecido | médio | **não verificada** — conferir (provável Apache-2.0) antes de produção |
| Render React a ~30 fps no celular | desconhecido | baixo | já limitado a ~33 ms; medir em L5 |

**Premissa que, se falsa, muda a conclusão:** que o celular alvo aguenta WebGL com fluidez enquanto a chamada roda. É a única coisa que os testes headless **não** conseguem provar.

---
*Rascunho gerado para revisão humana. Validação executada em sandbox (Chromium headless + servidor `call-ingress` local com secret descartável); **não** houve chamada LiveKit real nem teste em aparelho.*
