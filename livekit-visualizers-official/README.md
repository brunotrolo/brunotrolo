# LiveKit Agents UI – visualizadores oficiais (Bar, Radial, Wave, Aura)

Código **oficial** dos componentes, baixado sem alteração do registry shadcn do LiveKit
(`https://livekit.com/ui/r/agent-audio-visualizer-{bar,radial,wave,aura}.json` + `react-shader-toy`).
Licença dos componentes: ver repositório LiveKit (Apache-2.0) — manter atribuição.

- `src/components/agents-ui/*` e `src/hooks/agents-ui/*`: cópia fiel (não editar para manter idêntico).
- `src/main.tsx`: página de teste (troca modo/estado, microfone ou som de teste).
- `demo-standalone.html`: build único, abre direto no navegador.

## Usar no seu projeto (React)
```bash
pnpm dlx shadcn@latest add @agents-ui/agent-audio-visualizer-aura   # ou -bar / -radial / -wave
```
```tsx
<AgentAudioVisualizerAura size="lg" state={agentState} audioTrack={agentAudioTrack} />
```
Bar/Radial usam `currentColor` (branco em tema escuro) ou a prop `color="#hex"`.
Wave/Aura usam `#1FD5F9` por padrão. Áudio só anima em `state="speaking"`.

## Rebuild
`npm ci && npx vite build` → `dist/index.html`
