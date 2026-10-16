# P04: Catálogo contextual e normalização

## Objetivo e capacidades

Reusar significado de esporte/competição/evento/mercado e registrar candidatos privados sem transformar cada variação de texto em entidade global.

IDs: CAT-01, CAT-02, CAT-03. Esta é uma tarefa futura; não execute outros prompts junto por conveniência.

## Contexto obrigatório

Trabalhe no Oddiary PWA já inicializado. Releia AGENTS.md, REVIEW.md, README.md, IMPLEMENTATION.md, docs/operations.md, docs/pwa.md e docs/rebuild/{INVENTORY,ROADMAP,OPEN_QUESTIONS}.md. Confira Git, alterações pendentes, PR/CI e implementação prévia das dependências antes de editar. Preserve trabalho alheio e crie branch curta da main atualizada, sem supor merge operacional. Engenharia e stack vigentes são as do novo projeto.

Os caminhos da fonte abaixo são relativos a ../oddiary; leia os arquivos reais antes de reutilizar regras. Caminhos de testes novos propostos nesta tarefa são entregáveis a criar, não testes já existentes.

Leia docs/domain/betting-catalog.md, app/Modules/Catalog/{Models,Resolution,Normalization}/, app/Http/Support/CatalogFromLabels.php e testes Feature/Catalog, Unit/Catalog/MarketSegmentTest.php da fonte. Confronte lookup de evento/aliases com scheduled_on e constraints das migrations; veja D06.

## Dependências e decisões

P01; Q05 aprovada para evento/alias/ambiguidades. Reusar normalização de P03 se já existir, sem criar dependência circular.

Leia as respostas registradas das perguntas citadas. Se não houver resposta para comportamento central, pergunte somente isso e não fixe regra irreversível. Avance no que for independente, sem declarar a tarefa completa. Nenhuma divergência entre código e documentação é resolvida automaticamente por este prompt.

## Escopo, comportamento, dados e segurança

Implemente resolução determinística por identificador/alias/slug no contexto aprovado, seguida de candidato com alternativas limitadas. Globais e próprios visíveis; entidades de outro usuário e aliases apontando a alvo fora de escopo devem ser rejeitados. Alias não pode ignorar o contexto de esporte/data aprovado em Q05. Eventos recorrentes devem seguir a decisão, não reutilizar o primeiro por acaso.

Crie apenas tabelas/relações necessárias a bets/import; Participant/pivot, parent de competição e verified_at podem ficar adiados se sem consumidor, documentando o suporte estrutural identificado. Use NULLS NOT DISTINCT no PostgreSQL quando o contrato de unicidade o exigir. Writer privado e alias devem ser atômicos, sem promover global automaticamente.

Extraia mapa do mercado para segment map:n em variantes PT/EN/ordinal; se remover deixar rótulo vazio, preservar wording. Manter seleção separada e não universalizar mapas para todo esporte. Diferencie MarketSegment do manual e limpeza de contagem de opções no import; comportamento adicional unificado precisa decisão, não dedução. Sem CRUD administrativo, moderação, lookup externo, novo catálogo universal ou UI.

## TDD e verificações

Proponha tests/Feature/Catalog/ResolutionTest.php e tests/Unit/Catalog/MarketSegmentTest.php. RED: global/próprio/alheio, alias/slug, candidatos e limite de 5 alternativas, concorrência de criação, mesmo nome em datas/contextos diferentes conforme Q05, alias a alvo privado alheio, nulos opcionais; mapa em wording/ordinal/inglês e rótulo somente Mapa 2. Verificar ausência de criação global.

Local: make test-backend ARGS=tests/Feature/Catalog/ResolutionTest.php e Unit afetado; make check. Banco real efêmero para NULLS NOT DISTINCT/relacionamentos. CI: make quality, fronteiras Deptrac atualizadas ao código real.

Registre RED com causa esperada, GREEN do mesmo teste e REFACTOR sem mudar comportamento. Seletividade segue REVIEW.md: teste afetado no ciclo, validação relacionada depois, gates aprofundados no CI conforme risco. Não rode suite/E2E/mutation completos em cada iteração nem relaxe gate para passar. Bibliotecas novas exigem uso concreto e locks; atualize métricas/includes/fronteiras na medida do código real, sem abstrações vazias.

## Critérios de aceite

Resolução explicável e escopada, writer privado atômico e regras de evento aprovadas; casos ambíguos não inventam certeza. Documentar quais estruturas estão adiadas e os contratos que P05/P12 poderão consumir.

## Limites operacionais e entrega

Edite apenas o novo repositório; ../oddiary permanece somente leitura, sem comandos que escrevam ali. Não copie .env, credenciais, dumps ou dados reais. Migrações desta tarefa, se previstas, só em banco local/efêmero inequivocamente identificado e autorizado pelo escopo; nunca Supabase produtivo. Não altere Cloud/Supabase/domínio/secrets, execute reset remoto ou deploy sem checkpoint específico com recurso, impacto, backup e recuperação.

Respeite branches/PR/CI e revisão independente. Commit/push/PR somente quando autorizados pelo pedido que iniciou a execução; use make publish quando publicação for autorizada, sem autoaprovação ou bypass. Este arquivo não autoriza executar os próximos prompts ou integrar produção.

Entregue código/tests/contratos e documentação canônica afetada, registre decisões aceitas e evidências por ID. Relatório: comportamento, arquivos, migrations/dependências, RED/GREEN, comandos/resultados reais, CI/PR somente se efetivos, riscos e pendências. Não declare UI/rede/dispositivo/provedor ou produção verificados com base apenas em configuração/fake.
