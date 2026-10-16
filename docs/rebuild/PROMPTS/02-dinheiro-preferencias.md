# P02: Dinheiro exato e preferências

## Objetivo e capacidades

Permitir configurar moeda e unidade para futuros registros e usar valores monetários/odds exatos em qualquer consumidor, sem float ou conversão implícita.

IDs: CFG-02. Esta é uma tarefa futura; não execute outros prompts junto por conveniência.

## Contexto obrigatório

Trabalhe no Oddiary PWA já inicializado. Releia AGENTS.md, REVIEW.md, README.md, IMPLEMENTATION.md, docs/operations.md, docs/pwa.md e docs/rebuild/{INVENTORY,ROADMAP,OPEN_QUESTIONS}.md. Confira Git, alterações pendentes, PR/CI e implementação prévia das dependências antes de editar. Preserve trabalho alheio e crie branch curta da main atualizada, sem supor merge operacional. Engenharia e stack vigentes são as do novo projeto.

Os caminhos da fonte abaixo são relativos a ../oddiary; leia os arquivos reais antes de reutilizar regras. Caminhos de testes novos propostos nesta tarefa são entregáveis a criar, não testes já existentes.

Leia docs/domain/money-and-precision.md, app/Modules/Shared/Money/{Money,Currency,MoneyCast,DecimalInput}.php, Shared/Odds/{Odds,OddsCast}.php, app/Http/Requests/Betting/BettingPreferencesRequest.php, BettingPreferencesController.php e tests/Unit/Shared/{Money,Odds}/, tests/Feature/Betting/{PreferencesTest,MoneyCastTest,DecimalInputTest}.php da fonte. No novo, releia a identidade de P01 e suas migrations/guards.

## Dependências e decisões

P01 concluído; Q02 e Q06 respondidas para moeda/entrada decimal. Não resolver essas divergências por preferência do agente.

Leia as respostas registradas das perguntas citadas. Se não houver resposta para comportamento central, pergunte somente isso e não fixe regra irreversível. Avance no que for independente, sem declarar a tarefa completa. Nenhuma divergência entre código e documentação é resolvida automaticamente por este prompt.

## Escopo, comportamento, dados e segurança

Implemente primitivas apenas com consumidores atuais: preferências e cálculos usados pelos testes. Money carrega moeda, NUMERIC(20,8), odds NUMERIC(16,8), transporte decimal string; valores de negócio não passam por float. Precisão intermediária/arredondamento seguem Q06 e precisam casos explícitos. Não crie FX ou abstrações de taxa sem uso.

Adicione moeda-base/unidade nullable ao usuário e contratos GET/PATCH settings/betting, sem UI definitiva. Moedas expostas seguem Q02, distinguindo capacidade do tipo e opções do produto. Unidade deve ser estritamente positiva em qualquer representação aceita; ausência é null. Mensagens de validação ficam localizáveis, sem inventar mecanismo de tradução concorrente ao futuro P07.

A gramática aprovada deve aceitar exemplos como 1.300,50 quando previsto, rejeitar texto arbitrário/nota científica/overflow conforme decisão e traduzir falha em erro de campo. Não copiar remoção indiscriminada de caracteres como se fosse regra aprovada. Atualize Deptrac somente com a fronteira real das primitivas. Não criar bets, UI, moedas novas ou migration remota.

## TDD e verificações

Proponha tests/Unit/Money/MoneyTest.php e tests/Feature/Preferences/BettingPreferencesTest.php. RED: soma exata 0.10+0.20=0.30; moeda divergente rejeitada; divisão zero; escalas máximas; odds abaixo de 1; zero 0.00000000 não vira unidade válida; inputs locais válidos/inválidos; ausência preserva null. Teste cast/JSON e persistência real em PostgreSQL sem depender de arredondamento silencioso.

Local: make test-backend ARGS=tests/Unit/Money/MoneyTest.php e o Feature afetado, um comando por vez; make check. Ampliar include de cobertura para lógica nova real, sem testes de JSX. CI: make quality. Mutation só seletiva se já viável, sem instalar por formalidade.

Registre RED com causa esperada, GREEN do mesmo teste e REFACTOR sem mudar comportamento. Seletividade segue REVIEW.md: teste afetado no ciclo, validação relacionada depois, gates aprofundados no CI conforme risco. Não rode suite/E2E/mutation completos em cada iteração nem relaxe gate para passar. Bibliotecas novas exigem uso concreto e locks; atualize métricas/includes/fronteiras na medida do código real, sem abstrações vazias.

## Critérios de aceite

Valores/casts/contratos exatos provados, moeda e gramática correspondem às respostas registradas, usuário A não altera B. Preferência não dá autorização para reescrever histórico. Documentar o contrato para P05/P12 e a ausência de FX.

## Limites operacionais e entrega

Edite apenas o novo repositório; ../oddiary permanece somente leitura, sem comandos que escrevam ali. Não copie .env, credenciais, dumps ou dados reais. Migrações desta tarefa, se previstas, só em banco local/efêmero inequivocamente identificado e autorizado pelo escopo; nunca Supabase produtivo. Não altere Cloud/Supabase/domínio/secrets, execute reset remoto ou deploy sem checkpoint específico com recurso, impacto, backup e recuperação.

Respeite branches/PR/CI e revisão independente. Commit/push/PR somente quando autorizados pelo pedido que iniciou a execução; use make publish quando publicação for autorizada, sem autoaprovação ou bypass. Este arquivo não autoriza executar os próximos prompts ou integrar produção.

Entregue código/tests/contratos e documentação canônica afetada, registre decisões aceitas e evidências por ID. Relatório: comportamento, arquivos, migrations/dependências, RED/GREEN, comandos/resultados reais, CI/PR somente se efetivos, riscos e pendências. Não declare UI/rede/dispositivo/provedor ou produção verificados com base apenas em configuração/fake.
