# Próximos módulos

A Ruvia já possui Core, Vendas, Estoque, Financeiro e Agenda/Comparecimento.

Próximos candidatos devem surgir de demanda real:

## Orders
Pedidos, estados, retirada/entrega, itens e origem do pedido.

## Service Operations
Orçamentos, ordens de serviço, etapas, materiais e entrega.

## Storefront
Página pública do negócio, catálogo/serviços e, futuramente, entrada de pedidos ou horários externos.

## Billing
Assinaturas da própria Ruvia, limites e entitlements validados por backend/Cloud Functions/webhooks.

Todo módulo novo deve:
1. pertencer ao Business;
2. poder coexistir com os demais;
3. reutilizar Core/Clientes em vez de duplicar pessoas;
4. integrar Financeiro através de `sourceType/sourceId` quando houver cobrança;
5. não depender do segmento para funcionar.

## Liberação por plano

Novas ferramentas de Sites devem declarar capabilities próprias em vez de consultar nomes de planos. Isso permite, por exemplo, liberar no futuro:

- editor avançado de catálogo;
- animações avançadas;
- mais limites de Sites;
- domínio próprio;
- componentes premium;
- publicação de formulários/automação;
- recursos de colaboração.

Consulte `SITE_EDITOR_ARCHITECTURE.md`.

## Ruvia Code e módulos futuros

Novos módulos públicos podem expor dados/ações para Ruvia Code sem entregar acesso ao banco privado. O padrão deve ser:

```text
módulo privado
 -> projeção pública segura no Publish
 -> Code Context / componente Ruvia
```

Futuros exemplos: Orders, Quote Requests, Rentals e Payments podem adicionar componentes como `ruvia-order-form` ou contextos de leitura, mantendo a mesma sandbox.

## Evolução futura do Ruvia Code

- proxy de APIs externas com allowlist, quotas e capabilities, em vez de liberar `fetch` irrestrito;
- registry de bibliotecas aprovadas e empacotadas pelo host (ex.: engines gráficas), sem CDN arbitrária;
- modo Worker estrito para experiências Canvas de código não confiável;
- armazenamento persistente por Site com namespace/quota e bridge própria;
- múltiplos arquivos/módulos no Code Workspace;
- versionamento e rollback de código publicado.
