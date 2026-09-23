# Arquitetura da Ruvia — V5

## Princípio

```text
User != Business != Site != Module
```

Uma conta representa uma pessoa. Ela pode participar de vários negócios e vários projetos de site, com papéis independentes.

## Negócios

```text
users/{uid}
memberships/{uid}/{businessId}
businesses/{businessId}/
  profile/
  members/
  modules/
  subscription/
  settings/
  core/clients/
  commerce/
    products/
    sales/
    stockMovements/
  finance/
    charges/
    payments/
    credits/
  scheduling/
    appointments/
    services/
    resources/
    blocks/
    settings/
  activity/history/
```

Módulos atuais do Business:

- `sales`
- `inventory`
- `finance`
- `booking`

Clientes continuam no Core.

## Sites

Sites não ficam dentro de Business.

```text
siteMemberships/{uid}/{siteId}
sites/{siteId}/
  profile/
  members/
  settings/
  draft/
  publication/
publicSites/{slug}/
publicRequests/{siteId}/{requestId}
```

`profile.linkedBusinessId` pode ser `null`.

Um Business pode alimentar vários Sites. Um Site pode existir sem Business e ser conectado no futuro.

Veja `PUBLIC_SITES.md`.

## Fronteira público / privado

Visitantes nunca recebem leitura em `businesses` ou `sites`.

Somente `publicSites/{slug}` possui leitura pública.

Publicação materializa um snapshot sanitizado contendo apenas conteúdo visual e dados explicitamente selecionados para publicação.

Solicitações externas escrevem somente em `publicRequests`.

## Firebase Storage

Imagens do editor ficam no Storage. Regras em `storage.rules`.

## Cloud Functions

`functions/autoConfirmPublicBooking` é o único caminho de confirmação automática de Booking público, pois precisa ler estado privado e gravar Appointment com privilégio de servidor.

A Ruvia funciona sem a Function: solicitações entram na Inbox e são aceitas manualmente.

## Dados no frontend

O painel de gestão mantém arrays em memória por compatibilidade com o produto original. `RuviaCloud` converte entidades do Business para mapas no Realtime Database.

Sites possuem Draft próprio e não usam o cache local do Business.

## Evolução

Novas interações públicas devem usar o mesmo padrão:

```text
Site block
 -> public request
 -> operação privada
```

Exemplos futuros:

- Orders
- Quote Requests
- Service Operations
- Rentals
- Payments

## Conexões autorizadas

`linkedBusinessId` nunca é considerado suficiente sozinho. `profile.linkedByUid` registra quem autorizou a conexão, as Rules verificam sua membership no Business e automações administrativas repetem essa checagem no servidor.

## Entitlements de Sites (V5.4)

Recursos de edição não dependem diretamente de nomes de planos. O frontend resolve capabilities através de `resolveSiteCapabilities(site)`.

```text
siteEntitlements/{siteId}
```

é a fonte preparada para billing confiável. Database Rules permitem leitura aos membros do Site e proíbem escrita pelo cliente. Futuramente somente backend/Admin SDK deverá atualizar esse nó.

Enquanto billing não está ativo, `enforce:false` mantém todos os recursos do editor liberados.

Consulte `SITE_EDITOR_ARCHITECTURE.md`.

## Ruvia Code (V6.0)

Ruvia Sites ganhou uma camada programável sem alterar a separação `User != Business != Site`.

O código do Site nunca consulta Firebase privado diretamente. Dados conectados passam por uma projeção pública durante o Publish e são consumidos pelo renderer sandboxado.

```text
Business privado
      ↓ Publish
safe Code Context
      ↓
publicSites
      ↓
Ruvia Template Engine
      ↓
iframe sandbox
```

Consulte `RUVIA_CODE.md` e `SITE_EDITOR_ARCHITECTURE.md`.

## Secure Creative Runtime

Ruvia Code V7 separa o host privilegiado do código autorado:

```text
Ruvia Host (confiável)
  -> snapshot público
  -> bridge allowlist
  -> iframe sandbox / origem opaca
       -> HTML
       -> CSS
       -> JavaScript
       -> Canvas / WebGL / Workers
```

O runtime autorado não recebe Firebase, Auth, cookies nem acesso ao DOM do host. Rede direta permanece bloqueada por padrão.
