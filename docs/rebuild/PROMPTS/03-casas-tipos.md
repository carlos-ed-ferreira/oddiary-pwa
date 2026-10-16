# P03: Casas e tipos pessoais

## Objetivo e capacidades

Configurar contas das casas e classificações pessoais opcionais, isoladas por usuário, para que diário e banca tenham referências confiáveis.

IDs: ACC-01, ACC-02, DAT-01, TYP-01. Esta é uma tarefa futura; não execute outros prompts junto por conveniência.

## Contexto obrigatório

Trabalhe no Oddiary PWA já inicializado. Releia AGENTS.md, REVIEW.md, README.md, IMPLEMENTATION.md, docs/operations.md, docs/pwa.md e docs/rebuild/{INVENTORY,ROADMAP,OPEN_QUESTIONS}.md. Confira Git, alterações pendentes, PR/CI e implementação prévia das dependências antes de editar. Preserve trabalho alheio e crie branch curta da main atualizada, sem supor merge operacional. Engenharia e stack vigentes são as do novo projeto.

Os caminhos da fonte abaixo são relativos a ../oddiary; leia os arquivos reais antes de reutilizar regras. Caminhos de testes novos propostos nesta tarefa são entregáveis a criar, não testes já existentes.

Leia app/Http/Controllers/Betting/{BookmakerAccountController,BetTypeController}.php, Requests/Betting/{BookmakerAccountRequest,ArchiveAccountRequest,BetTypeRequest}.php, Http/Support/BettingOptions.php, Modules/Betting/Bankroll/Models/Bookmaker*.php, Bets/Models/BetType.php, database/seeders/{DatabaseSeeder,BookmakerSeeder}.php e testes BankrollController/BetTypeController/BettingOptions/Seeders da fonte.

## Dependências e decisões

P02 e Q04 sobre arquivo; Q02 para moedas. Banco de teste isolado de P01 disponível.

Leia as respostas registradas das perguntas citadas. Se não houver resposta para comportamento central, pergunte somente isso e não fixe regra irreversível. Avance no que for independente, sem declarar a tarefa completa. Nenhuma divergência entre código e documentação é resolvida automaticamente por este prompt.

## Escopo, comportamento, dados e segurança

Crie schema mínimo bookmakers/accounts/bet_types com ownership e unicidade por contexto. Casa global e privada são distintas; vincular por ID exige global ou própria, não só exists. Conta única por usuário/casa; moeda vem de Q02, não pode perder contexto. Nome customizado até 60, slug normalizado, repetição idempotente; tratar colisão de concorrência em erro controlado/reuso.

Tipos têm nome único por usuário, até 60, descrição até 160, posição 0..999, arquivo opcional. CRUD backend permitido não implica introduzir UI de edição/ordenação que não foi demonstrada; isso fica no aceite de P08. Tipo é opcional e pessoal, sem semântica de mercado ou risco fixo.

Implemente endpoints previstos e policies/queries escopadas; listar contas ativas primeiro e ordem alfabética; arquivo preserva histórico. Novos writes em arquivadas seguem Q04. Sem DELETE de conta da casa ou mudança de moeda por dedução. Se semear casas globais, usar catálogo mínimo revisado e seeder idempotente, sem usuários, bets ou saldo. Não expor import_guidance para edição por usuário; não instalar UI kit.

## TDD e verificações

Proponha tests/Feature/Configuration/AccountsAndTypesTest.php. RED: mesmos nomes para usuários diferentes; repetição de vínculo; ID de casa privada alheia recusado; tipo de terceiro não alterado; arquivo/restauração sem remover registros; política Q04 em writes; seleção não inclui casa já vinculada, inclusive arquivada; deletes de tipo deixam referência nullable em integração quando P05 existir. Adicione regressão específica D05.

Local: make test-backend ARGS=tests/Feature/Configuration/AccountsAndTypesTest.php; make check. PostgreSQL testa unicidade com null/global e constraints. CI: make quality. Não afirmar teste de bets inexistente como executado; acrescentar o caso consumidor no P05.

Registre RED com causa esperada, GREEN do mesmo teste e REFACTOR sem mudar comportamento. Seletividade segue REVIEW.md: teste afetado no ciclo, validação relacionada depois, gates aprofundados no CI conforme risco. Não rode suite/E2E/mutation completos em cada iteração nem relaxe gate para passar. Bibliotecas novas exigem uso concreto e locks; atualize métricas/includes/fronteiras na medida do código real, sem abstrações vazias.

## Critérios de aceite

Contratos de contas/tipos com autorização negativa, unicidade e arquivo aprovados; sem contaminar globais nem criar credencial seed. Listas limitadas quando crescimento justificar, sem N+1. Registrar ausência de UI definitiva até P08.

## Limites operacionais e entrega

Edite apenas o novo repositório; ../oddiary permanece somente leitura, sem comandos que escrevam ali. Não copie .env, credenciais, dumps ou dados reais. Migrações desta tarefa, se previstas, só em banco local/efêmero inequivocamente identificado e autorizado pelo escopo; nunca Supabase produtivo. Não altere Cloud/Supabase/domínio/secrets, execute reset remoto ou deploy sem checkpoint específico com recurso, impacto, backup e recuperação.

Respeite branches/PR/CI e revisão independente. Commit/push/PR somente quando autorizados pelo pedido que iniciou a execução; use make publish quando publicação for autorizada, sem autoaprovação ou bypass. Este arquivo não autoriza executar os próximos prompts ou integrar produção.

Entregue código/tests/contratos e documentação canônica afetada, registre decisões aceitas e evidências por ID. Relatório: comportamento, arquivos, migrations/dependências, RED/GREEN, comandos/resultados reais, CI/PR somente se efetivos, riscos e pendências. Não declare UI/rede/dispositivo/provedor ou produção verificados com base apenas em configuração/fake.
