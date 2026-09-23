# Ruvia SaaS V6.0 — Ruvia Code

Ruvia é uma plataforma SaaS multiempresa com gestão interna, Booking e uma camada pública de Sites.

## Destaque desta versão

V6.0 adiciona **Ruvia Code**: uma camada programável para criar Sites totalmente autorais sem perder os dados e ações da plataforma.

Existem agora quatro níveis de criação:

```text
Blocos rápidos
Compositor
Code Section
Full Page Code
```

Ruvia Code oferece:

- HTML + CSS próprios;
- `{{ bindings }}`;
- `{% for %}`;
- `{% if %}`;
- filtros de formatação/consulta;
- dados públicos sanitizados do Business;
- Produtos, Serviços e Recursos selecionáveis;
- JSON local por seção/página;
- componentes seguros de WhatsApp, Contato, Booking, Produtos e Serviços;
- `ruvia-action` e `ruvia-form` para markup totalmente customizado;
- preview no próprio editor;
- execução em `iframe sandbox`, sem JavaScript arbitrário;
- capabilities preparadas para planos futuros.

Consulte **`RUVIA_CODE.md`** para a linguagem completa e exemplos.

## Princípio estrutural

```text
User != Business != Site != Module
```

No Site:

```text
Draft
  theme
  blocks
  codePage
```

No editor visual:

```text
Block
  content
  dataSource
  config
  design
```

## Documentação

- `RUVIA_CODE.md`
- `PUBLIC_SITES.md`
- `SITE_EDITOR_ARCHITECTURE.md`
- `DESIGN_SYSTEM.md`
- `ARCHITECTURE.md`
- `FIREBASE_SETUP.md`
- `BOOKING_MODULE.md`

## Rodar localmente

Evite abrir por `file://`. Sirva a pasta por HTTP:

```bash
python -m http.server 8080
```

Abra:

```text
http://localhost:8080
```

## Firebase

Frontend:

- Firebase Authentication;
- Realtime Database;
- Storage.

Publique as rules:

```bash
firebase deploy --only database,storage
```

Cloud Functions continuam opcionais para confirmação automática de Booking público:

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

## Segurança

- visitante lê apenas `publicSites`;
- Ruvia Code nunca recebe acesso direto a `businesses/{businessId}`;
- bindings de Business são materializados no snapshot público com campos permitidos;
- JavaScript do usuário não é executado;
- `siteEntitlements` é somente leitura para o cliente;
- billing real deve validar capabilities premium também no backend.


## V6.1 — Documentação viva

No Site Editor, use **Docs** para abrir o manual interativo de Ruvia Code. A própria documentação é construída com Ruvia Code.


## V7.0 — Secure Creative Runtime

Ruvia Code agora suporta JavaScript isolado, Canvas/WebGL, animações, Workers, console de runtime e SDK seguro. Consulte `RUVIA_CODE.md`, `RUVIA_CODE_RUNTIME.md` e `CHANGELOG_V7_0.md`.


## V7.2 — Code IDE
O editor Ruvia Code usa Monaco para oferecer syntax highlighting, IntelliSense, autocomplete, snippets, fechamento automático, bracket pairs, folding e sugestões específicas da API Ruvia. Há fallback para o editor simples caso o runtime do Monaco não carregue.


## V7.3 — Viewport Runtime
Full Page Ruvia Code agora usa viewport real dentro do sandbox. Isso corrige `vh/dvh`, fixed/sticky, Canvas fullscreen e páginas longas. Code Sections mantêm auto-height.


## V7.4
Visual refresh do app principal para alinhar a experiência da Ruvia com a identidade do site de documentação do Ruvia Code.
