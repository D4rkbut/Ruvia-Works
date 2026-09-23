# Ruvia V7.3 — Viewport Runtime

## Correções
- Full Page Ruvia Code não usa mais auto-height baseado no scrollHeight do documento.
- Páginas inteiras agora executam em um iframe com viewport real (`100dvh`) e rolagem interna do sandbox.
- `vh`, `dvh`, `position: fixed`, `sticky`, Canvas fullscreen e layouts viewport-based deixam de interpretar a altura total do site como viewport.
- Code Sections continuam usando auto-height por `ResizeObserver`.
- Quando o cabeçalho automático da plataforma está ativo, o iframe desconta a altura do header.

## Motivo
Antes, uma página com 14.000px de conteúdo fazia o iframe ter ~14.000px de altura. Dentro dele, `100vh` virava ~14.000px. Isso podia empurrar conteúdo vários milhares de pixels para baixo e quebrar experiências fullscreen.
