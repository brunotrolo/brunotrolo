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
