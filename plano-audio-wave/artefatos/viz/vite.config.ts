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
