# Ruvia V7.0 — Secure Creative Runtime

## Ruvia Code Runtime v2

- JavaScript próprio por Code Section e Full Page Code.
- Nova aba JavaScript no editor.
- Console do sandbox com `console.log`, warnings, erros e Promise rejections.
- Botão para reiniciar o runtime.
- Canvas 2D, WebGL/WebGL2, `requestAnimationFrame`, Web Animations, pointer/keyboard/touch e AudioContext.
- Workers por `blob:` e OffscreenCanvas conforme suporte do navegador.
- CSP do sandbox endurecida.
- iframe sem `allow-same-origin`.
- rede externa bloqueada por padrão (`fetch`, XHR, WebSocket, EventSource, WebTransport, WebRTC, sendBeacon).
- sem Firebase, Auth, cookies ou referências privadas no frame.
- `Ruvia.data` com projeção pública congelada.
- SDK `Ruvia.ready`, `Ruvia.motion`, `Ruvia.canvas`, `Ruvia.utils`, `Ruvia.state` e `Ruvia.actions`.
- bridge passa a validar tipos, protocolos, payloads e limites de tamanho.
- links externos passam pelo host.
- forms continuam criando Public Requests sem expor Firebase.
- CSS criativo continua suportando hover, keyframes, transitions, transforms, masks, filters e layout moderno.
- presets novos: Hero interativo, Canvas partículas e Mini game.
- capabilities novas: `code.javascript`, `code.canvas`, `code.runtimeConsole`, `code.workers`.
- Draft schema 5.
- Public snapshot schema 6.
- botão Docs agora aponta para `/s/ruvia-code-docs`, para a documentação existir como Site normal criado em Ruvia Code.
