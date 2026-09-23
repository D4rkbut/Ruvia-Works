# Firebase Setup — Ruvia V5

Projeto configurado no frontend:

```text
ruvia-stacksdata
```

## 1. Authentication

Ative Email/Password em Firebase Authentication.

## 2. Realtime Database

Crie o Realtime Database e confirme se `databaseURL` em `index.html` corresponde à região criada.

Publique:

```text
database.rules.json
```

A V5 adiciona:

```text
sites
siteMemberships
publicSites
publicRequests
```

`publicSites` é leitura pública. `businesses` e `sites` privados continuam protegidos por membership.

## 3. Storage

Ative Firebase Storage.

Publique:

```text
storage.rules
```

Uploads de Sites:

```text
sites/{siteId}/{uid}/...
```

Regras atuais:

- leitura pública das imagens;
- escrita somente autenticada no próprio UID;
- somente `image/*`;
- máximo 5 MB.

## 4. Cloud Functions — opcional, recomendada para auto-confirmação

A confirmação automática de Agenda não pode ser feita com segurança no cliente público.

Código:

```text
functions/index.js
```

Instale dependências e faça deploy:

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

Ou publique tudo:

```bash
firebase deploy
```

A Function `autoConfirmPublicBooking` observa:

```text
/publicRequests/{siteId}/{requestId}
```

e somente cria Appointment quando o Site privado tem `publicBooking.autoConfirm = true` e a disponibilidade real do Business permite.

## 5. Regras e deploy pela CLI

`firebase.json` já referencia os arquivos corretos.

```bash
firebase login
firebase use ruvia-stacksdata
firebase deploy --only database,storage
```

Functions exigem plano Firebase compatível com Cloud Functions.

## 6. Hospedagem

A aplicação precisa de fallback SPA para `/s/{slug}`.

Netlify usa `_redirects` incluso.

Vercel usa `vercel.json` incluso.

## Segurança

Não transforme `publicSites` em espelho do Business.

O Publish atual usa uma whitelist lógica no frontend e as regras impedem visitante de ler Business privado. Qualquer nova integração dinâmica deve continuar publicando somente dados necessários.

### Autorização Site -> Business

Ao conectar um Site, a Ruvia grava `linkedByUid`. As Database Rules exigem que esse UID esteja ativo no Business escolhido. A Function de auto-confirmação verifica novamente a mesma relação antes de acessar a Agenda privada.

### Solicitações públicas

`publicRequests` aceita anonimamente apenas criação de `contact` e `booking_request` em Sites publicados. Campos textuais possuem limites básicos nas Rules. Para operação em escala maior, considere Firebase App Check/rate limiting como camada anti-spam adicional.

## Entitlements do editor de Sites (V5.4)

As regras desta versão incluem `siteEntitlements/{siteId}`. O usuário membro pode ler seus entitlements, mas nenhum cliente pode escrever nesse nó.

Ao ativar planos pagos no futuro, grave entitlements somente através de backend confiável/Admin SDK (por exemplo Cloud Function acionada pelo provedor de billing).

Depois de atualizar para V5.4, publique novamente `database.rules.json`.

## V6.0 / Ruvia Code

Ruvia Code não cria um novo caminho privado no Firebase. HTML/CSS ficam dentro do Draft do Site e a publicação continua em `publicSites/{slug}`.

Nenhuma rule adicional é necessária apenas para o runtime de código. `siteEntitlements/{siteId}` continua sendo a fonte reservada para capabilities quando billing for ativado.

Importante: quando recursos pagos entrarem em enforcement real, a validação de capability durante Publish deve ocorrer também em backend/Cloud Function; esconder a ferramenta no React não é barreira de cobrança.
