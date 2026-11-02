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
