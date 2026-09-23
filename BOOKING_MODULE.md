# Ruvia Agenda e Comparecimento

O módulo `booking` é um motor genérico de presença agendada. Ele não assume um nicho específico.

## Conceitos

### Compromisso (`appointments`)
Um comparecimento previsto em uma data e horário. Pode representar consulta, sessão, reserva, atendimento, aula, reunião, visita, uso de espaço etc.

Campos principais:
- cliente cadastrado ou nome/contato avulso;
- tipo de atendimento/serviço opcional;
- um ou mais recursos reservados;
- data, início, duração e fim;
- quantidade de pessoas quando aplicável;
- observações públicas/internas;
- recorrência;
- status de comparecimento.

Status atuais:
- `scheduled` — agendado;
- `confirmed` — confirmado;
- `arrived` — chegou;
- `completed` — concluído;
- `no_show` — não compareceu;
- `cancelled` — cancelado.

### Tipo de atendimento (`bookingServices`)
Define "o que" será marcado. Exemplos: consulta inicial, corte, sessão, jantar, visita técnica, aula experimental.

Pode definir:
- duração padrão;
- valor apenas como referência;
- necessidade de recurso;
- quais recursos são compatíveis;
- ativo/inativo.

Não gera cobrança automaticamente.

### Recurso (`bookingResources`)
Qualquer coisa cuja disponibilidade pode limitar um horário:
- profissional;
- sala;
- mesa;
- cabine;
- equipamento;
- box;
- espaço;
- outro.

Um compromisso pode reservar vários recursos ao mesmo tempo.

Cada recurso possui disponibilidade semanal e um de dois modos:

**Exclusivo** — qualquer sobreposição bloqueia o horário. Bom para profissional, mesa, sala reservada, equipamento único.

**Por capacidade** — permite reservas simultâneas enquanto a soma de participantes não superar a capacidade. Bom para turma, espaço coletivo, evento ou atividade compartilhada.

### Configuração (`bookingSettings`)
Permite ao negócio mudar a linguagem sem mudar o modelo.

Exemplos:
- clínica: Agenda / Consulta / Tipo de atendimento / Profissional ou sala / Paciente;
- restaurante: Reservas / Reserva / Tipo de reserva / Mesa ou ambiente / Responsável;
- estética: Agenda / Agendamento / Procedimento / Profissional ou cabine / Cliente;
- educação: Agenda / Aula ou encontro / Modalidade / Professor ou sala / Aluno ou responsável.

Também controla:
- duração padrão;
- intervalo da grade;
- exibição de quantidade de participantes;
- exigência de cliente previamente cadastrado.

## Colisões

Antes de gravar, a Ruvia valida cada recurso selecionado:
1. se o recurso está ativo;
2. se o dia/horário cabe na disponibilidade semanal;
3. se a quantidade não excede a capacidade;
4. se há sobreposição exclusiva;
5. ou, em modo por capacidade, se a soma das reservas simultâneas cabe no recurso.

A validação também é executada para cada ocorrência de uma recorrência.

## Recorrência

A criação suporta:
- semanal;
- a cada duas semanas;
- mensal;
- quantidade configurável de ocorrências.

As ocorrências recebem um `recurrenceGroupId` comum, mas continuam sendo registros independentes para permitir remarcar ou cancelar apenas uma delas.

## Relação com Clientes

Clientes continuam no Core. Um compromisso pode:
- apontar para `clientId`;
- ou usar nome/contato avulso;
- opcionalmente salvar o nome avulso como novo Cliente.

Quando vinculado, os compromissos aparecem no perfil do cliente.

## Relação com Financeiro

Nesta versão o valor do tipo de atendimento é apenas informativo. O módulo Agenda funciona sem Financeiro.

Uma integração futura poderá criar cobranças com `sourceType: "appointment"`, mas isso deve ser opcional e não faz parte da V3.

## Exceções / bloqueios

Além da disponibilidade semanal, `bookingBlocks` registra indisponibilidades específicas por recurso e data. Um bloqueio pode ocupar o dia inteiro ou somente um intervalo. Isso cobre folgas, férias, manutenção, eventos e exceções sem alterar a rotina semanal.

A disponibilidade semanal aceita múltiplos intervalos no mesmo dia, permitindo jornadas como 08:00–12:00 e 13:30–18:00.
