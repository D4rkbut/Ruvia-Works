# Ruvia Code — V7.0 / Runtime v2

Ruvia Code é a camada programável de Ruvia Sites. A partir da V7 ele deixa de ser apenas HTML + CSS + template e passa a ter um **runtime JavaScript isolado**.

```text
Editor visual
  -> blocos rápidos
  -> Compositor
  -> Ruvia Code Section
  -> Full Page Ruvia Code
       HTML
       CSS
       JavaScript
       Dados
       Console
       API
```

O objetivo é dar liberdade suficiente para experiências muito autorais — Canvas, WebGL, animações, interações, jogos, componentes próprios — sem colocar Auth, Firebase, cookies ou dados privados do Business dentro do código do Site.

## 1. Modelo de segurança

O código do Site roda dentro de um `iframe sandbox` sem `allow-same-origin`.

```text
Aplicação Ruvia / Firebase privado
            |
            | projeção pública + bridge allowlist
            v
+--------------------------------------+
| Ruvia Code sandbox                   |
| HTML / CSS / JavaScript / Canvas     |
| origem opaca                         |
| sem Auth / sem cookies / sem DB      |
| rede externa bloqueada por padrão    |
+--------------------------------------+
```

O sandbox atualmente usa apenas permissões necessárias ao runtime criativo, incluindo scripts e pointer lock. Fullscreen/gamepad/autoplay dependem também das permissões e políticas do navegador.

### O que NÃO entra no sandbox

- token de autenticação;
- objeto Firebase;
- referências do Realtime Database;
- clientes privados;
- vendas;
- financeiro;
- custo de produtos;
- notas internas;
- cookies da aplicação;
- DOM da aplicação Ruvia.

### Rede

O Runtime v2 bloqueia por padrão:

- `fetch`;
- `XMLHttpRequest`;
- `WebSocket`;
- `EventSource`;
- `WebTransport`;
- `RTCPeerConnection` / WebRTC;
- `sendBeacon`;
- imports remotos por CSS;
- scripts remotos;
- submissão normal de forms.

Imagens e mídia do Storage oficial da Ruvia, `data:` e `blob:` podem ser usadas pelo runtime. Ações externas passam pelo bridge.

> Importante: nenhum sistema que permita JavaScript arbitrário pode prometer risco literalmente zero de código ruim. O sandbox protege a plataforma e seus dados privados; código de terceiros ainda deve ser tratado como código não confiável. Não cole scripts desconhecidos.

## 2. HTML / Ruvia Template Language

Bindings:

```html
<h1>{{ business.name }}</h1>
<strong>{{ product.price | currency }}</strong>
```

Loops:

```html
{% for product in products | limit:6 %}
  <article>
    <h3>{{ product.name }}</h3>
  </article>
{% endfor %}
```

Condições:

```html
{% if product.available %}
  <span>Disponível</span>
{% else %}
  <span>Esgotado</span>
{% endif %}
```

Filtros:

```text
| currency
| upper
| lower
| capitalize
| default:"texto"
| length
| date
| json
| limit:6
| reverse
| sort:"name"
| where:"category","Joias"
```

Tags `<script>` continuam proibidas dentro do HTML. JavaScript deve ser colocado na aba própria.

## 3. CSS criativo

CSS continua isolado no frame e agora é explicitamente tratado como parte do runtime criativo.

Suporta normalmente recursos do navegador como:

```text
:hover
:focus-visible
@keyframes
transition
transform
filter
backdrop-filter
clip-path
mask
CSS Grid
Flexbox
container queries
media queries
custom properties
```

Exemplo:

```css
.card {
  transition:
    transform .35s cubic-bezier(.2,.8,.2,1),
    box-shadow .35s ease;
}

.card:hover {
  transform: translateY(-10px) rotate(-1deg);
  box-shadow: 0 30px 80px rgba(0,0,0,.14);
}

@keyframes pulse {
  50% { transform: scale(1.04); }
}

.badge {
  animation: pulse 2.4s ease-in-out infinite;
}
```

`@import`, `javascript:` em CSS, `expression()` e bindings perigosos continuam removidos.

## 4. JavaScript isolado

Use a aba **JavaScript**.

```js
Ruvia.ready(() => {
  const title = document.querySelector('h1');

  title.animate(
    [
      { opacity: 0, transform: 'translateY(24px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ],
    {
      duration: 800,
      easing: 'cubic-bezier(.2,.8,.2,1)',
      fill: 'both'
    }
  );
});
```

Dentro do sandbox você pode usar, conforme suporte do navegador:

- DOM;
- eventos de teclado, mouse, pointer e touch;
- timers;
- `requestAnimationFrame`;
- Web Animations API;
- Canvas 2D;
- WebGL / WebGL2;
- AudioContext;
- ResizeObserver;
- IntersectionObserver;
- MutationObserver;
- Workers via `blob:`;
- OffscreenCanvas;
- WebAssembly (`wasm-unsafe-eval` do CSP do sandbox);
- pointer lock;
- fullscreen quando permitido pelo navegador;
- Gamepad API quando permitido pelo navegador.

## 5. Ruvia.data

O JavaScript recebe somente a projeção pública selecionada no editor.

```js
const {
  site,
  business,
  products,
  services,
  resources,
  data,
  theme
} = Ruvia.data;
```

O objeto é `deepFreeze` antes de ser exposto ao código.

Exemplo:

```js
console.log(Ruvia.data.business.name);
console.log(Ruvia.data.products[0]?.formattedPrice);
```

### HTML x JavaScript

No HTML:

```html
{{ business.name }}
```

No JS:

```js
Ruvia.data.business.name
```

## 6. SDK do Runtime

### Ruvia.ready

```js
Ruvia.ready(() => {
  // DOM pronto
});
```

### Ruvia.motion.reveal

```js
Ruvia.motion.reveal('.card', {
  stagger: 70,
  distance: 24,
  duration: 700,
  threshold: .1
});
```

### Ruvia.motion.magnetic

```js
Ruvia.motion.magnetic('.cta', {
  strength: .18
});
```

### Ruvia.canvas.fit

Ajusta o canvas ao tamanho CSS e DPR do dispositivo.

```js
const surface = Ruvia.canvas.fit('#game', {
  maxDpr: 2
});

const { canvas, ctx } = surface;
```

Para WebGL:

```js
const surface = Ruvia.canvas.fit('#scene', {
  context: 'webgl2'
});
```

### Ruvia.canvas.loop

```js
const stop = Ruvia.canvas.loop(({ time, dt, seconds }) => {
  // update + draw
});

// stop();
```

O `dt` é limitado para evitar saltos gigantes quando a aba perde foco.

### Ruvia.utils

```js
Ruvia.utils.clamp(value, min, max);
Ruvia.utils.lerp(a, b, t);
Ruvia.utils.random(min, max);
Ruvia.utils.map(value, a, b, c, d);
```

### Ruvia.state

Estado em memória do runtime atual:

```js
Ruvia.state.set('score', 10);
Ruvia.state.get('score', 0);
Ruvia.state.has('score');
Ruvia.state.delete('score');
Ruvia.state.clear();
```

Não é armazenamento persistente.

## 7. Ações seguras

O JavaScript não recebe Firebase. Para pedir uma ação real ao host, use `Ruvia.actions`.

### WhatsApp

```js
Ruvia.actions.whatsapp({
  message: 'Olá! Vim pelo site.'
});
```

### Copiar

```js
Ruvia.actions.copy('Texto para copiar');
```

### Abrir URL externa

```js
Ruvia.actions.open('https://exemplo.com');
```

O host valida o protocolo antes de abrir.

### Criar contato

```js
Ruvia.actions.contact({
  clientName: 'Ana',
  phone: '...',
  message: 'Quero orçamento'
});
```

### Criar solicitação de agenda

```js
Ruvia.actions.booking({
  clientName: 'Ana',
  phone: '...',
  serviceId: '...',
  resourceId: '...',
  preferredDate: '2026-09-30',
  startTime: '14:00',
  notes: ''
});
```

O host aceita somente campos conhecidos, aplica limites de tamanho e reusa o fluxo de `PublicRequest`.

## 8. Formulários HTML continuam funcionando

```html
<form ruvia-form="contact">
  <input name="clientName" required>
  <input name="phone" required>
  <textarea name="message"></textarea>
  <button>Enviar</button>
  <small data-ruvia-form-status></small>
</form>
```

O envio normal do navegador é bloqueado. A bridge coleta somente os campos permitidos e cria a solicitação pelo host.

## 9. Canvas / mini game

HTML:

```html
<canvas id="game" tabindex="0"></canvas>
```

CSS:

```css
#game {
  width: 100%;
  height: 480px;
  display: block;
  background: #08110e;
}
```

JS:

```js
Ruvia.ready(() => {
  const { canvas, ctx } = Ruvia.canvas.fit('#game');
  const player = { x: 100, y: 100 };

  Ruvia.canvas.loop(({ dt }) => {
    player.x += .08 * dt;

    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.fillStyle = '#b9ff57';
    ctx.fillRect(player.x, player.y, 30, 30);
  });
});
```

A V7 inclui presets de **Hero interativo**, **Canvas partículas** e **Mini game** para testar o runtime.

## 10. Console

A aba **Console** recebe mensagens do sandbox:

```js
console.log('carregado');
console.warn('atenção');
console.error(error);
```

Erros de `window.onerror` e Promises rejeitadas também são encaminhados.

O editor possui **Reiniciar runtime**, útil depois de alterar estados ou testar interações.

## 11. Capabilities / planos

Novas capabilities:

```text
code.javascript
code.canvas
code.runtimeConsole
code.workers
```

Elas se juntam a:

```text
code.section
code.fullPage
code.customCss
code.dataBindings
code.advancedQueries
code.ruviaActions
```

Os recursos não verificam diretamente nomes de planos. O editor consulta `capabilities.can(feature)`.

## 12. Limites deliberados

Ainda NÃO existe acesso direto a:

- npm/CDN arbitrário;
- scripts remotos;
- APIs externas via `fetch`;
- sockets;
- Firebase;
- Auth;
- DOM do painel Ruvia;
- armazenamento persistente do runtime.

Se no futuro a Ruvia permitir APIs externas, a direção recomendada é um **proxy seguro com allowlist, quotas e capabilities**, e não liberar `fetch` irrestrito dentro do sandbox.

## 13. Publicação

O Draft V7 usa `schemaVersion: 5`.

O snapshot público usa `schemaVersion: 6`.

`script` passa a fazer parte tanto de `Code Section` quanto de `codePage`.

O JavaScript publicado continua entrando apenas no iframe isolado; ele nunca é executado no contexto da aplicação Ruvia.


## V7.2 — Code IDE
O editor Ruvia Code usa Monaco para oferecer syntax highlighting, IntelliSense, autocomplete, snippets, fechamento automático, bracket pairs, folding e sugestões específicas da API Ruvia. Há fallback para o editor simples caso o runtime do Monaco não carregue.
