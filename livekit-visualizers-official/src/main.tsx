import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LocalAudioTrack, createLocalAudioTrack } from 'livekit-client';
import type { AgentState } from '@livekit/components-react';
import { AgentAudioVisualizerBar } from '@/components/agents-ui/agent-audio-visualizer-bar';
import { AgentAudioVisualizerRadial } from '@/components/agents-ui/agent-audio-visualizer-radial';
import { AgentAudioVisualizerWave } from '@/components/agents-ui/agent-audio-visualizer-wave';
import { AgentAudioVisualizerAura } from '@/components/agents-ui/agent-audio-visualizer-aura';
import './index.css';

type Mode = 'bar' | 'radial' | 'wave' | 'aura';
const STATES: [AgentState, string][] = [
  ['connecting','Conectando'],['initializing','Iniciando'],['listening','Ouvindo'],['thinking','Pensando'],['speaking','Falando'],
];

// som de teste: osciladores com modulação de amplitude, virando um LocalAudioTrack do LiveKit
function demoTrack() {
  const ac = new AudioContext(), out = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain();
  [140, 420, 900].forEach(f => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(out); o.start(); });
  out.gain.value = .15; lfo.frequency.value = 3; lg.gain.value = .15; lfo.connect(lg).connect(out.gain); lfo.start();
  const dest = ac.createMediaStreamDestination(); out.connect(dest); out.connect(ac.destination);
  return new LocalAudioTrack(dest.stream.getAudioTracks()[0], undefined, false, ac);
}

function App() {
  const [mode, setMode] = useState<Mode>('aura');
  const [state, setState] = useState<AgentState>('speaking');
  const [track, setTrack] = useState<LocalAudioTrack>();
  const [msg, setMsg] = useState('sem áudio');
  const btn = (on: boolean) => `px-3 py-2 rounded-lg border text-sm ${on ? 'bg-white text-black border-white' : 'border-neutral-700 text-neutral-200'}`;
  const props = { state, audioTrack: track } as const;
  return (
    <div className="min-h-screen flex flex-col items-center gap-4 p-4">
      <div className="w-full max-w-[480px] aspect-square flex items-center justify-center rounded-2xl bg-neutral-950 border border-neutral-800 text-white overflow-hidden">
        {mode === 'bar' && <AgentAudioVisualizerBar size="lg" barCount={5} {...props} />}
        {mode === 'radial' && <AgentAudioVisualizerRadial size="lg" {...props} />}
        {mode === 'wave' && <AgentAudioVisualizerWave size="lg" {...props} />}
        {mode === 'aura' && <AgentAudioVisualizerAura size="lg" {...props} />}
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {(['bar','radial','wave','aura'] as Mode[]).map(m => <button key={m} className={btn(m===mode)} onClick={() => setMode(m)}>{m[0].toUpperCase()+m.slice(1)}</button>)}
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {STATES.map(([s,l]) => <button key={s} className={btn(s===state)} onClick={() => setState(s)}>{l}</button>)}
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        <button className={btn(false)} onClick={async () => {
          try { track?.stop(); setTrack(await createLocalAudioTrack({ echoCancellation: true, noiseSuppression: true })); setMsg('microfone ativo'); }
          catch (e: any) { setMsg('erro: ' + e.message); }
        }}>🎤 Microfone</button>
        <button className={btn(false)} onClick={() => { track?.stop(); setTrack(demoTrack()); setMsg('som de teste'); }}>🔊 Som de teste</button>
      </div>
      <small id="st" className="text-neutral-400">{msg} · o áudio só anima no estado "Falando"</small>
    </div>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
