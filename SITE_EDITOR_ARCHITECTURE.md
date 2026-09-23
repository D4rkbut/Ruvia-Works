# Ruvia Sites — arquitetura do editor V5.4

## Objetivo

O editor não deve crescer como uma sequência de `if(plan === ...)` ou como um formulário único para todos os blocos.

A separação usada na V5.4 é:

```text
Site
  Draft
    Block
      content     -> o que é dito / itens
      dataSource  -> de onde vêm os dados
      config      -> composição específica do tipo de bloco
      design      -> superfície da seção

Site entitlement
  capabilities   -> quais ferramentas de edição estão liberadas
```

O renderer público continua orientado a dados. Nenhum bloco executa HTML ou JavaScript arbitrário.

## Editores especializados

Cada bloco continua usando o mesmo envelope (`content`, `config`, `design`, `dataSource`), mas pode possuir ferramentas próprias.

Exemplos atuais:

- Hero: composição, proporção entre texto/imagem, corte, escala de título, CTAs e tratamento visual;
- Produtos: grade, colunas, card, imagem, preço, disponibilidade, CTA e apresentação individual por produto;
- Serviços: grade/lista, duração, preço, numeração, CTA e apresentação individual por serviço;
- Galeria: coleção visual editável, proporção, corte, mosaico/colagem/faixa;
- Equipe: coleção editável de pessoas com foto, função e bio;
- Depoimentos: coleção editável e composição de destaque;
- FAQ: coleção de perguntas/respostas e composições diferentes;
- Agenda/Reserva: fonte estática ou Business, serviços/recursos e layout do formulário;
- Compositor: elementos independentes em grade controlada;
- Horários e Rodapé: coleções estruturadas, não somente texto separado por pipes.

Isso permite aprofundar um bloco sem alterar o formato básico do Site.

## Coleções estruturadas

V5.4 começa a substituir campos legados do tipo:

```text
Nome | descrição | preço
```

por arrays estruturados com IDs estáveis.

Exemplo:

```json
{
  "itemsData": [
    {
      "id": "...",
      "name": "Produto",
      "description": "...",
      "price": "R$ 90",
      "imageUrl": "...",
      "category": "...",
      "link": "..."
    }
  ]
}
```

O renderer mantém fallback para o formato antigo, portanto drafts existentes continuam funcionando. Assim que um item legado é editado pelo editor visual, ele passa a ser salvo na coleção estruturada.

## Dados conectados sem duplicação

Quando um bloco usa `dataSource.mode = "business"`, Produto/Serviço continua pertencendo ao Business.

Customizações específicas do Site são guardadas como **presentation overrides** em `block.config.itemOverrides`:

```text
Business Product
  nome/preço/estoque reais
        +
Site block override
  título público
  descrição pública
  imagem alternativa
  badge
  destaque
  CTA
  ocultar preço/descrição
```

Isso não cria outro Produto e não altera o cadastro privado.

## Capabilities e planos

O editor pergunta por capabilities, e não pelo nome do plano.

Registro atual:

```text
SITE_EDITOR_FEATURES
SITE_PLAN_CAPABILITIES
SITE_BLOCK_REQUIRED_FEATURE
```

Exemplos de capabilities:

- `products.advanced`
- `services.advanced`
- `hero.advanced`
- `gallery.advanced`
- `section.backgroundMedia`
- `responsive.advanced`
- `composer.basic`
- `composer.advanced`
- `booking.public`
- `publish.customDomain`

Um recurso visual usa:

```text
capabilities.can("products.advanced")
```

em vez de:

```text
plan === "pro"
```

Isso permite mudar preços, nomes e combinações de planos no futuro sem reescrever os blocos.

## Fonte confiável de entitlement

Existe o nó:

```text
siteEntitlements/{siteId}
```

Membros do Site podem ler. O cliente **não pode escrever** pelas Database Rules.

No futuro, billing/backend/Admin SDK grava algo semelhante a:

```json
{
  "enforce": true,
  "planId": "pro",
  "features": {
    "composer.advanced": false,
    "publish.customDomain": true
  }
}
```

Enquanto `enforce` não estiver ativo, a V5.4 mantém todas as ferramentas liberadas para desenvolvimento.

`sites/{siteId}/settings/editorAccess` existe apenas como fallback de desenvolvimento/migração e não deve virar a fonte de segurança de billing.

## Segurança de plano

Ocultar controles no React é UX, não segurança.

Quando cobrança real for ativada, ações que geram valor controlado por plano (por exemplo domínio próprio, publicação de recursos premium ou limites) devem também ser validadas no backend/Cloud Functions.

O Admin SDK pode ler `siteEntitlements` e rejeitar a operação mesmo que alguém altere o frontend.

## Como adicionar uma ferramenta premium futura

1. Registre a capability em `SITE_EDITOR_FEATURES`.
2. Inclua a capability nos planos desejados em `SITE_PLAN_CAPABILITIES`.
3. Envolva o controle com `SiteFeatureGate` ou consulte `capabilities.can(key)`.
4. Se a funcionalidade puder afetar segurança/custo, valide a mesma capability no backend.
5. Não condicione o renderer ao nome literal do plano.

## Como adicionar um novo editor de bloco

O novo bloco deve manter:

```text
content
config
design
dataSource
```

Use `content` para dados semânticos, `config` para decisões próprias daquele bloco e `design` apenas para superfície/seção compartilhada.

Se o bloco tiver lista de entidades, prefira `SiteCollectionEditor` ou uma especialização equivalente em vez de textarea delimitado por caracteres.

## Limites além de features

O resolvedor também aceita `limits`, separado de capabilities booleanas. Isso permite que um plano futuro defina, por exemplo:

```json
{
  "limits": {
    "blocks.max": 30,
    "sites.max": 5,
    "collection.items.max": 100
  }
}
```

A API do editor é `capabilities.limit(key, fallback)`. Nenhum limite comercial está em enforcement nesta versão; a estrutura apenas evita ter de espalhar números de plano pelo código quando billing existir.

---

# V6.0 — camada Ruvia Code

O editor agora possui uma camada programável acima do Compositor:

```text
Blocos rápidos
  -> Compositor
  -> Code Section
  -> Full Page Code
```

Um bloco `code` continua pertencendo ao array normal de `draft.blocks`, portanto pode ser ordenado, duplicado e combinado com qualquer bloco visual.

A página inteira em código fica em:

```text
draft.codePage
  enabled
  hidePlatformHeader
  html
  css
  dataJson
  dataSource
```

Desligar `codePage.enabled` não apaga os blocos visuais.

Capabilities adicionadas:

```text
code.section
code.fullPage
code.customCss
code.dataBindings
code.advancedQueries
code.ruviaActions
```

Consulte `RUVIA_CODE.md` para sintaxe, contexto de dados e segurança.

## V7 — Runtime criativo isolado

Ruvia Code passa a ter quatro fontes autorais por projeto/seção:

```text
html
css
script
dataJson
```

`script` nunca é executado no contexto do painel. O renderer público cria um iframe sandbox sem `allow-same-origin` e injeta somente a projeção pública retornada por `buildCodeData()`.

O bridge do host é allowlisted. O runtime não recebe referências Firebase/Auth.

Novas capabilities:

```text
code.javascript
code.canvas
code.runtimeConsole
code.workers
```

Antes de publicar, `validateRuviaCodeDraft()` valida sintaxe básica e orçamento de tamanho dos artefatos de Code.


## V7.2 — Code IDE
O editor Ruvia Code usa Monaco para oferecer syntax highlighting, IntelliSense, autocomplete, snippets, fechamento automático, bracket pairs, folding e sugestões específicas da API Ruvia. Há fallback para o editor simples caso o runtime do Monaco não carregue.
