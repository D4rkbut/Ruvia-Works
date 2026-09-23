# Ruvia Sites / Public — V5

## Princípio

A arquitetura agora possui três entidades independentes:

```text
User != Business != Site
```

- **User** representa uma pessoa autenticada.
- **Business** representa a operação privada de um negócio.
- **Site** representa um projeto publicável.

Um Site pode existir sem Business, e pode ser conectado/desconectado posteriormente sem recriação.

## Árvore Firebase

```text
sites/{siteId}/
  profile/
    name
    slug
    linkedBusinessId
    createdBy
  members/
  settings/
    publicBooking/
      autoConfirm
  draft/
    schemaVersion
    templateId
    theme/
    blocks/
  publication/
    published
    version
    lastPublishedAt
    lastPublishedSlug

siteMemberships/{uid}/{siteId}

publicSites/{slug}/
  siteId
  slug
  version
  publishedAt
  profile/
  theme/
  blocks/
  dynamicData/

publicRequests/{siteId}/{requestId}
```

`publicSites` é deliberadamente separado de `sites` e `businesses`. Visitantes só leem o snapshot sanitizado publicado.

## Draft / Preview / Publish

- O editor altera somente `sites/{siteId}/draft`.
- A prévia usa o Draft local.
- Publicar cria uma nova versão de `publicSites/{slug}`.
- Alterar Draft depois de publicar não modifica imediatamente o site público.
- `publication.version` é incrementado a cada Publish.
- A estrutura já permite guardar snapshots históricos futuramente.

## Editor

O editor usa liberdade controlada por blocos. Cada bloco possui:

```text
content
variant
design
dataSource
```

Blocos atuais:

- Hero
- Texto
- Imagem
- Galeria
- Serviços
- Produtos
- Categorias
- Equipe
- Depoimentos
- FAQ
- Horários
- Localização
- Contato
- WhatsApp
- CTA
- Formulário
- Agenda
- Reserva
- Rodapé
- Composição livre

É possível reorganizar, duplicar, excluir e adicionar blocos.

Não existe campo para JavaScript arbitrário.

## Conteúdo != estrutura != tema != fonte de dados

O Draft mantém essas camadas separadas.

Trocar o preset visual modifica `theme`, sem substituir os blocos nem o conteúdo.

Temas iniciais:

- Minimal / institucional
- Editorial
- Comercial
- Serviços / Agenda
- Menu / alimentação
- Catálogo
- Portfólio

## Site independente

Quando `linkedBusinessId == null`:

- todos os blocos estáticos continuam funcionando;
- Formulário envia `contact` para Public Inbox;
- Agenda/Reserva pode usar opções estáticas;
- WhatsApp, localização, redes, galeria e catálogo estático não dependem de Business.

## Site conectado

Quando existe `linkedBusinessId`, blocos compatíveis podem trocar `dataSource.mode` de `static` para `business`.

### Produtos

O bloco referencia produtos existentes do Business. O editor escolhe quais IDs publicar ou se publica todos.

No Publish é criado um snapshot apenas com campos seguros:

- nome;
- categoria;
- marca;
- descrição;
- preço público;
- disponibilidade resumida das variantes.

Clientes, custo, vendas, financeiro e movimentações não são publicados.

### Serviços / Booking

O bloco Serviços pode consumir `bookingServices`.

Agenda/Reserva pode publicar:

- serviços permitidos;
- recursos/profissionais selecionados;
- vocabulário público do Booking.

A página pública nunca lê `businesses/{businessId}` diretamente.

## Public Requests

Tipos atuais:

```text
contact
booking_request
```

Estrutura preparada para:

```text
order
quote_request
service_request
rental_request
```

A Inbox agrega solicitações de todos os Sites da conta.

### Booking manual

Fluxo:

```text
Visitante
  -> publicRequests
  -> Inbox
  -> Aceitar
  -> carregar Business privado
  -> validar disponibilidade/colisões
  -> Appointment
```

Também é possível:

- propor nova data/horário;
- recusar;
- abrir WhatsApp com mensagem preenchida.

### Confirmação automática

É opcional por Site.

Ela é executada por `functions/autoConfirmPublicBooking`, e não pelo navegador público.

A Function:

1. recebe novo `booking_request`;
2. lê o Site privado;
3. verifica `linkedBusinessId`;
4. lê Booking do Business;
5. valida disponibilidade semanal, bloqueios, capacidade e sobreposição;
6. cria Appointment somente se não houver conflito;
7. atualiza PublicRequest para `accepted`;
8. caso contrário marca `needs_review`.

Sem deploy da Function, confirmação manual continua operacional.

## Imagens

Uploads do editor usam Firebase Storage em:

```text
sites/{siteId}/{uid}/...
```

As imagens são publicamente legíveis porque precisam aparecer nos sites; gravação exige autenticação e limita arquivos a imagens de até 5 MB.

## Rotas públicas

Rotas suportadas:

```text
/s/{slug}
```

Também há fallback técnico:

```text
?site={slug}
```

`_redirects` (Netlify) e `vercel.json` já estão incluídos para SPA fallback.

## Liberdade controlada de design

Além do conteúdo, cada bloco possui controles próprios de composição:

- alinhamento e largura;
- espaçamento vertical;
- fundo;
- forma/raio;
- comportamento no celular (normal, compacto ou oculto);
- animação (tema, fade, entrada suave ou nenhuma);
- variantes específicas para Hero, Galeria, Serviços e Produtos.

O tema controla tokens globais independentes do conteúdo:

- cores;
- fontes;
- raio;
- escala de espaçamento;
- densidade;
- tratamento de imagens;
- estilo das superfícies;
- intensidade de movimento;
- largura máxima.

Os templates iniciais usam combinações estruturais e variantes diferentes no momento da criação. Depois disso, aplicar outro preset de Design troca os tokens visuais sem apagar ou reconstruir o conteúdo existente.

## Autorização da conexão Site -> Business

A conexão privada não é tratada como um simples ID confiável.

Quando um Site é conectado, seu perfil guarda também `linkedByUid`. As Database Rules só aceitam `linkedBusinessId` quando esse usuário possui membership ativa no Business. A Cloud Function de confirmação automática repete essa verificação antes de ler ou escrever na Agenda privada.

Isso impede que a camada pública seja utilizada como atalho entre Businesses isolados.

## Sanitização de dados conectados

A publicação nunca copia o objeto privado de produto/serviço por inteiro.

Produtos públicos recebem apenas dados explicitamente seguros, como nome, categoria, marca, descrição pública, preço, disponibilidade resumida, imagem pública e atributos de variante. Campos de custo, vendas, movimentações, clientes e anotações internas não entram no snapshot.

Serviços públicos recebem apenas nome, duração, preço/descrição pública e os metadados necessários para compatibilidade de recursos. Notas internas não são publicadas.

Links configuráveis passam por uma lista de protocolos seguros; não existe execução de HTML ou JavaScript arbitrário no renderer público.

## Responsividade

O renderer possui composição própria para mobile. Splits, mosaicos, formulários em duas colunas, menus e listas quebram para uma coluna quando necessário. Cada bloco ainda pode ser marcado como compacto ou oculto especificamente no celular.


## V5.1 — Editor e templates estruturais

O editor de Sites funciona em um workspace de tela inteira. Ele não deve ser renderizado dentro da coluna estreita padrão do painel da Ruvia. O inspetor ocupa uma coluna própria e o canvas utiliza toda a área restante.

O preview usa `container-type: inline-size` e unidades `cqw`, então tipografia e layouts respondem ao tamanho real do canvas, e não ao `vw` da janela do painel.

Templates são direções de composição, não skins. Cada template define:

- ordem inicial de blocos;
- variantes de Hero, categorias, produtos, depoimentos e FAQ;
- largura e ritmo das seções;
- comportamento global de header, cards, grids e imagens;
- tokens visuais.

No editor, **Aplicar layout** recompõe a página preservando o conteúdo dos blocos existentes por tipo. Blocos que não fazem parte do novo template não são apagados: são mantidos ao fim da composição. **Só estilo** troca a direção visual sem reorganizar os blocos.

Direções atuais:

- Minimal: sereno, muito respiro, listas discretas e formas leves;
- Editorial: hierarquia tipográfica, imagem grande, bordas finas e ritmo de revista;
- Comercial: cards fortes, categorias rápidas e CTAs de conversão;
- Serviços: conteúdo + solicitação de horário com formulários tratados como parte central da composição;
- Alimentação: contraste quente, hero escuro, cardápio editorial e reserva;
- Catálogo: densidade maior e grade de produtos;
- Portfólio: composição escura/autoral, manifesto e galeria ampla.

## V5.3 — Power Editor

Sites now includes a controlled composition layer in addition to quick blocks. The `Compositor` block can mix headings, text, images, buttons, badges, lists, dividers and spacers in 1–4 column grids, with per-element span, size, colors, surfaces, mobile visibility and ordering. It includes composition recipes and remains data-only: no arbitrary HTML or JavaScript is executed.

All sections also support advanced custom background/text colors and minimum height. Hero, Gallery and Services gained additional composition families. This keeps quick creation approachable while allowing significantly more authored layouts.

## V5.4 — Section Studio / editores especializados

A V5.4 aprofunda o Power Editor sem transformar todos os blocos no mesmo formulário. Cada tipo de seção passa a ter um editor próprio em `Conteúdo / Layout / Estilo` e mantém o envelope comum `content + config + design + dataSource`.

Produtos e Serviços funcionam como mini sistemas de apresentação: grade, densidade, card, mídia, preço, duração, disponibilidade, CTA e overrides por item. Quando os dados vêm do Business, esses overrides alteram somente a apresentação pública e não duplicam nem modificam a entidade privada.

Galeria, Equipe, Depoimentos, FAQ, Categorias, Horários e Rodapé passam a usar coleções estruturadas editáveis com adicionar, duplicar, remover e reordenar. Drafts antigos com texto delimitado continuam compatíveis por fallback.

A camada de capabilities foi preparada para billing futuro. Consulte `SITE_EDITOR_ARCHITECTURE.md`.

---

# Ruvia Code / snapshot público — V6.0

O Draft schema atual é `4` e o snapshot público é `5`.

Um Site publicado pode conter `code` blocks e, opcionalmente, uma `codePage` completa.

```text
publicSites/{slug}/
  codePage/
  codePageData/
  blocks/
  dynamicData/{codeBlockId}/
```

`codePageData` e `dynamicData` são materializados no Publish. O navegador visitante não recebe acesso ao Business privado.

O contexto publicado para código é reduzido a campos públicos permitidos de:

- perfil do Site;
- perfil público do Business;
- Produtos escolhidos;
- Serviços escolhidos;
- Recursos escolhidos;
- JSON local do projeto.

O renderer de Ruvia Code usa iframe sandboxado e um bridge restrito para WhatsApp e `PublicRequest`. JavaScript autorado pelo usuário é removido.

Veja `RUVIA_CODE.md`.

## Snapshot V7 / Ruvia Code Runtime v2

O snapshot público passa para `schemaVersion: 6`.

`codePage` contém:

```text
enabled
hidePlatformHeader
html
css
script
```

Code Sections carregam `script` dentro de `block.content`.

O renderer executa JavaScript somente em iframe sandbox isolado. Dados privados do Business não fazem parte do snapshot nem do contexto do runtime.
