# P08: Diário e configuração pessoal

## Objetivo e capacidades

Registrar/corrigir/revisar apostas pelo usuário e gerir configuração pessoal com contexto suficiente, sem depender da IA.

IDs: ACC-01, ACC-02, BET-01, BET-02, BET-03, BET-04, CFG-02, TYP-01, UX-01. Esta é uma tarefa futura; não execute outros prompts junto por conveniência.

## Contexto obrigatório

Trabalhe no Oddiary PWA já inicializado. Releia AGENTS.md, REVIEW.md, README.md, IMPLEMENTATION.md, docs/operations.md, docs/pwa.md e docs/rebuild/{INVENTORY,ROADMAP,OPEN_QUESTIONS}.md. Confira Git, alterações pendentes, PR/CI e implementação prévia das dependências antes de editar. Preserve trabalho alheio e crie branch curta da main atualizada, sem supor merge operacional. Engenharia e stack vigentes são as do novo projeto.

Os caminhos da fonte abaixo são relativos a ../oddiary; leia os arquivos reais antes de reutilizar regras. Caminhos de testes novos propostos nesta tarefa são entregáveis a criar, não testes já existentes.

Leia na fonte app/Modules/Betting/Bets/BetListQuery.php, requests BetIndex/Bet, Http/Support/BetPresenter.php, pages/bets/index.tsx, pages/settings/{betting,bookmakers,bet-types}.tsx, components/betting/{bet-form,bet-dialog,bet-filters,bets-list,bets-table}.tsx e tests BetListQuery/BetController/BetLegs/journal. Releia os contratos novos de P02/P03/P05; código novo é a fonte de implementação.

## Dependências e decisões

P03/P05/P07, decisões Q04/Q06/Q07 e referência visual aceita. AGUARDA REFERÊNCIA VISUAL se P07 não a tiver validado.

Leia as respostas registradas das perguntas citadas. Se não houver resposta para comportamento central, pergunte somente isso e não fixe regra irreversível. Avance no que for independente, sem declarar a tarefa completa. Nenhuma divergência entre código e documentação é resolvida automaticamente por este prompt.

## Escopo, comportamento, dados e segurança

Implemente a query/GET diário e UI sobre os contratos aprovados, com eager loading e paginação default25, HTTP 5..100. Busca em seleção/ref/notas, filtros conta/tipo/status/datas, whitelist de ordenação, abertos sempre primeiro e id desc no empate; URL preserva filtros/página, limpar é visível. Intervalo inválido deve ter regra explícita, sem query inesperada.

Formulário permite uma ou várias legs, total odds explícito quando necessário, stake única, tipo opcional, impacto claro, nota/referência; snapshot não editável. Moeda/retorno/P&L são inequívocos, campos decimais preservam texto e erros. Cancelar não grava; excluir exige modal e ownership backend; falha de rede conserva entrada sem confirmar sucesso.

Disponibilize preferências, casas e tipos pelos contratos existentes, mostrando arquivo/restauração e efeito da unidade futura. Backend de editar/ordenar/arquivar tipo não comprova UI antiga correspondente: implemente tais controles só se aceitos como escopo; caso contrário registre adiamento da apresentação, mantendo contrato testado. Não inventar criação contextual embutida em todos os seletores.

Composição mobile adaptativa deve manter informação/ações sem tabela desktop espremida. Reuse tokens/componentes de P07. Excluir multi-select, batch, edição de célula, virtualização, navegação copiada e migração de dados.

## TDD e verificações

Proponha tests/Feature/Bets/JournalQueryTest.php e tests/e2e/journal.spec.ts. RED query: escopo por usuário, busca/ordem abertos/whitelist, paginação/URL, parâmetros inválidos e relações com query count estável. E2E: criar single/múltipla, corrigir data/retorno, tipo opcional, vírgula, erro de campo, cancelar/delete confirmado, estado vazio/filtro sem resultados e falha de envio sem perder texto. Cobrir preferências/conta/tipo nos caminhos tocados.

Local: make test-backend ARGS=tests/Feature/Bets/JournalQueryTest.php; Vitest só de lógica nova relevante; make check; make assets; make test-e2e ARGS=tests/e2e/journal.spec.ts em desktop/mobile com axe e idiomas/temas distribuídos. CI: make quality.

Registre RED com causa esperada, GREEN do mesmo teste e REFACTOR sem mudar comportamento. Seletividade segue REVIEW.md: teste afetado no ciclo, validação relacionada depois, gates aprofundados no CI conforme risco. Não rode suite/E2E/mutation completos em cada iteração nem relaxe gate para passar. Bibliotecas novas exigem uso concreto e locks; atualize métricas/includes/fronteiras na medida do código real, sem abstrações vazias.

## Critérios de aceite

Tarefas manuais completas sem IA, lista/URL/paginação coerentes, ausência de vazamento entre usuários, edição/exclusão com efeitos aprovados e acessibilidade mobile comprovada. Nenhum valor financeiro calculado como autoridade em JS.

## Limites operacionais e entrega

Edite apenas o novo repositório; ../oddiary permanece somente leitura, sem comandos que escrevam ali. Não copie .env, credenciais, dumps ou dados reais. Migrações desta tarefa, se previstas, só em banco local/efêmero inequivocamente identificado e autorizado pelo escopo; nunca Supabase produtivo. Não altere Cloud/Supabase/domínio/secrets, execute reset remoto ou deploy sem checkpoint específico com recurso, impacto, backup e recuperação.

Respeite branches/PR/CI e revisão independente. Commit/push/PR somente quando autorizados pelo pedido que iniciou a execução; use make publish quando publicação for autorizada, sem autoaprovação ou bypass. Este arquivo não autoriza executar os próximos prompts ou integrar produção.

Entregue código/tests/contratos e documentação canônica afetada, registre decisões aceitas e evidências por ID. Relatório: comportamento, arquivos, migrations/dependências, RED/GREEN, comandos/resultados reais, CI/PR somente se efetivos, riscos e pendências. Não declare UI/rede/dispositivo/provedor ou produção verificados com base apenas em configuração/fake.
