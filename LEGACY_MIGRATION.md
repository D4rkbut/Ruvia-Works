# Migração do sistema antigo

A Ruvia V3 continua reconhecendo o backup JSON produzido pela OmniStack/Juh Boutique.

A migração é por arquivo exportado, nunca por acesso ao Firebase antigo.

O importador converte clientes, produtos, vendas, cobranças, pagamentos, créditos, estoque, histórico e configurações antigas. Dados de Agenda não existem no backup legado e começam vazios.

Por segurança, importação legado é destinada a um negócio sem dados operacionais, evitando duplicação acidental.

Backups novos usam:
```json
{
  "app": "Ruvia",
  "schemaVersion": 3
}
```

## V7 — Ruvia Code

Drafts antigos continuam compatíveis. `script` ausente é interpretado como string vazia.

- Draft schema atual: 5.
- Public snapshot atual: 6.
- Full Page Code desabilitado não publica mais HTML/CSS/JS inativos; o código permanece somente no Draft privado.
