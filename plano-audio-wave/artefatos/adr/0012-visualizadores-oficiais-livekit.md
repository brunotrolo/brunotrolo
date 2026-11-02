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
