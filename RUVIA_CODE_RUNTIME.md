# Arquitetura de segurança — Ruvia Code Runtime v2

## Princípio

O código autorado recebe poder sobre **seu próprio frame**, não sobre a aplicação Ruvia.

## Fronteira de confiança

```text
[Host Ruvia]
Auth / Firebase / Business privado / billing / entitlements
       |
       | apenas snapshot público + mensagens allowlisted
       v
[Sandbox Ruvia Code]
HTML / CSS / JS / Canvas / WebGL / Workers
```

## Sandbox

O iframe não usa `allow-same-origin` e não recebe credenciais da aplicação.

Permissões atuais:

```text
allow-scripts
allow-pointer-lock
```

Permissions Policy do iframe permite recursos criativos específicos como fullscreen/gamepad/autoplay, sujeitos ao navegador.

## CSP

O documento gerado usa CSP restritiva:

- `default-src 'none'`;
- scripts somente inline do runtime e código do projeto;
- WASM permitido por `wasm-unsafe-eval`;
- Workers somente por `blob:`;
- `connect-src 'none'`;
- `frame-src 'none'`;
- `object-src 'none'`;
- `form-action 'none'`;
- imagens/mídia apenas `data:`, `blob:` e Storage oficial Ruvia.

## APIs de rede endurecidas

O bootstrap também bloqueia em runtime:

- `fetch`;
- XHR;
- WebSocket;
- EventSource;
- WebTransport;
- WebRTC;
- sendBeacon;
- `window.open` direto.

Abrir uma URL externa deve passar por `Ruvia.actions.open()`, que é validado pelo host.

## Bridge

O host só reconhece mensagens com `frameId` correto e origem de `contentWindow` do iframe correspondente.

Tipos reconhecidos:

```text
height
console
action
form
```

Ações reconhecidas:

```text
whatsapp
copy
external
```

Forms reconhecidos:

```text
contact
booking_request
```

Payloads são filtrados por chaves conhecidas e truncados por tamanho.

## Dados

Somente `buildCodeData()` entra no runtime.

Nunca enviar ao frame um objeto bruto vindo de `businesses/{businessId}`.

## Limitação honesta

Sandbox não transforma código de terceiros em código confiável. O objetivo principal é impedir que um projeto Ruvia Code alcance segredos e superfícies privadas da plataforma.

Código malicioso ainda pode tentar abusar de CPU/memória dentro do próprio frame. O editor oferece reinício do runtime, mas loops síncronos infinitos continuam sendo um risco inerente ao JavaScript arbitrário em página. Para código não confiável de terceiros, uma futura camada Worker/instrumentada seria mais apropriada.


## Viewport de página inteira (V7.3)
Code Pages executam em um iframe de viewport real (`100dvh`) com rolagem interna. O host não expande mais o iframe para o `scrollHeight` total da página. Isso preserva a semântica nativa de `vh`, `dvh`, `fixed`, `sticky` e experiências Canvas/WebGL fullscreen. Code Sections continuam medindo e reportando altura ao host.
