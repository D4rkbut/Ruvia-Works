# Ruvia — sistema visual V4

## Personalidade
A Ruvia deve transmitir quatro ideias simultâneas:

- **pertencimento** — o negócio do cliente é o protagonista;
- **capacidade** — o produto parece sólido o suficiente para operar um negócio real;
- **precisão** — hierarquia, alinhamento e estados são claros;
- **calma** — nada parece agressivo, gamer, futurista demais ou ansioso.

A direção pode ser resumida como **confiante, afiada e tranquila**.

## Assinatura da plataforma
A identidade da plataforma não depende da cor escolhida pelo negócio.

- `--ruvia-brand`: cor institucional fixa da Ruvia;
- `--rose`: cor de destaque do negócio ativo, customizável;
- logo/foto da empresa ocupa os pontos de pertencimento;
- a marca Ruvia domina apenas login, onboarding e contextos institucionais.

## Geometria
A forma recorrente da interface é um retângulo suave com um canto de ancoragem mais fechado:

- cards: `24px 24px 24px 8px`;
- botões: `14px 14px 14px 5px`;
- inputs: `15px 15px 15px 6px`;
- superfícies importantes seguem a mesma lógica.

O objetivo é fugir tanto do card totalmente arredondado de SaaS genérico quanto do brutalismo duro.

## Símbolo
O novo símbolo representa vários fluxos entrando em uma estrutura comum sem se transformarem em um nó. Ele se relaciona com a promessa:

> Seu negócio em um só fluxo, sem virar um nó.

## Tipografia
- **Sora**: títulos, números de destaque, palavra-marca e hierarquia principal;
- **Manrope**: interface, formulários, textos e dados.

Sora traz precisão; Manrope mantém leitura confortável.

## Home
A home começa pela empresa, não pela plataforma.

O bloco `BusinessFlowHero` mostra:
- nome do negócio;
- data;
- indicadores dos módulos ativos;
- contexto diário.

Só aparecem indicadores de módulos realmente ativos.

## Navegação
A navegação inferior virou um dock flutuante em vez de uma barra colada à tela. O item ativo ocupa uma pequena superfície própria e recebe um nó de cor de destaque.

## Modais / sheets
- mobile: sheet vindo de baixo;
- desktop: drawer lateral direito;
- fundo com blur discreto;
- mesma geometria de ancoragem da marca.

## Cor personalizada
A personalização do negócio continua funcionando.

A cor escolhida pela empresa afeta:
- ações primárias;
- foco de inputs;
- estados ativos;
- detalhes do painel;
- parte da composição do hero.

Ela não substitui `--ruvia-brand`, porque precisamos manter reconhecimento da plataforma.

## O que evitar
- glassmorphism em todas as superfícies;
- neon;
- glow decorativo forte;
- gradientes aleatórios;
- cards idênticos em grade sem hierarquia;
- excesso de arredondamento;
- animações elásticas demais;
- visual de ERP corporativo azul/cinza;
- visual gamer/cyber;
- ícones decorativos sem função.

## Princípio
A Ruvia deve parecer poderosa porque é organizada e segura, não porque grita.

---

## Ruvia Sites / Public

O editor pertence visualmente à Ruvia; o site publicado pertence visualmente ao cliente.

Isso significa:

- controles, navegação, editor e Inbox seguem o Design System da Ruvia;
- o Canvas público usa tokens próprios do Site;
- a cor do Business não é imposta ao Site;
- presets são pontos de partida, não identidade obrigatória;
- trocar preset visual não apaga conteúdo;
- páginas públicas não devem carregar elementos institucionais da Ruvia como decoração principal.

A personalidade da plataforma permanece calma, firme e precisa. A personalidade do site deve poder variar muito mais.

## Sites / Public — liberdade sem perder sistema

O editor público utiliza o mesmo princípio da Ruvia: decisões fortes, porém controladas. O cliente pode variar tema, densidade, tipografia, superfícies, tratamento de imagens, largura, formas, animação e composição por bloco sem receber um canvas caótico.

Os Sites não devem carregar a identidade visual da Ruvia como se fossem páginas institucionais da plataforma. A Ruvia aparece no editor; a página publicada pertence visualmente ao cliente.


## Sites: identidade do cliente antes da identidade da plataforma

Ruvia Sites não deve produzir sete versões do mesmo layout com cores diferentes. A identidade da Ruvia aparece no editor; o site publicado pertence visualmente ao cliente.

Regras:

1. templates precisam mudar composição e hierarquia, não apenas tokens;
2. preview nunca pode ser comprimido para caber ao lado do inspetor — ele recebe um canvas próprio;
3. tipografia do site público deve responder ao container do site (`cqw`), não ao viewport do painel;
4. header, Hero, grids, cards e ritmos podem mudar por template;
5. trocar template preserva conteúdo;
6. nenhum template deve depender de JavaScript arbitrário do usuário.

## Site editor: freedom without arbitrary code

Ruvia Sites uses two layers: quick semantic blocks for speed and the Compositor for authored layouts. The Compositor is a structured element tree, not raw HTML. New public designs should prefer meaningful hierarchy, responsive grids, controlled overlap/composition, and business identity over generic card repetition.

## V5.4 — profundidade por seção

Um bloco não deve receber opções apenas para aumentar a quantidade de controles. Ferramentas de edição precisam refletir a natureza daquela seção.

- Produtos controlam mídia, preço, badges, disponibilidade, CTA, grade e destaque por item.
- Galeria controla composição e tratamento de imagem.
- FAQ controla leitura e distribuição de perguntas.
- Equipe trabalha foto, função e bio.
- Hero trabalha hierarquia, proporção e ação.
- Compositor permanece a saída para layouts que não cabem num bloco semântico pronto.

A regra visual é: **blocos rápidos oferecem um bom padrão; editores próprios permitem quebrar esse padrão de forma intencional.**

## Ruvia Code

Código customizado não deve abandonar o sistema visual automaticamente. O runtime expõe tokens CSS do tema (`--site-bg`, `--site-ink`, `--site-accent`, `--site-display`, etc.) para que composições autorais possam continuar coerentes com a identidade configurada do cliente.

Isso é uma opção, não uma limitação: o desenvolvedor ainda pode definir seus próprios estilos dentro do frame isolado.
