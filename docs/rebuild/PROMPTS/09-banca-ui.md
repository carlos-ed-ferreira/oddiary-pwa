# P09: Movimentos e reconciliação na experiência

## Objetivo e capacidades

Tornar saldos compreensíveis e permitir registrar/excluir movimentos e reconciliar o disponível que a casa mostra.

IDs: BNK-01, BNK-02, BNK-03, UX-01. Esta é uma tarefa futura; não execute outros prompts junto por conveniência.

## Contexto obrigatório

Trabalhe no Oddiary PWA já inicializado. Releia AGENTS.md, REVIEW.md, README.md, IMPLEMENTATION.md, docs/operations.md, docs/pwa.md e docs/rebuild/{INVENTORY,ROADMAP,OPEN_QUESTIONS}.md. Confira Git, alterações pendentes, PR/CI e implementação prévia das dependências antes de editar. Preserve trabalho alheio e crie branch curta da main atualizada, sem supor merge operacional. Engenharia e stack vigentes são as do novo projeto.

Os caminhos da fonte abaixo são relativos a ../oddiary; leia os arquivos reais antes de reutilizar regras. Caminhos de testes novos propostos nesta tarefa são entregáveis a criar, não testes já existentes.

Leia na fonte pages/transactions/index.tsx, components/betting/{account-balances,transaction-dialog,reconcile-dialog,money-amount,confirm-action}.tsx, TransactionController/ReconciliationController e tests BankrollController/AccountBalanceCalculator/journal. Releia contrato temporal de P06 e decisões registradas.

## Dependências e decisões

P06/P07; Q03/Q07 aceitas para timestamp/corte e consistência. Referência visual aprovada, caso contrário AGUARDA REFERÊNCIA VISUAL.

Leia as respostas registradas das perguntas citadas. Se não houver resposta para comportamento central, pergunte somente isso e não fixe regra irreversível. Avance no que for independente, sem declarar a tarefa completa. Nenhuma divergência entre código e documentação é resolvida automaticamente por este prompt.

## Escopo, comportamento, dados e segurança

Apresente banca/exposição/disponível por conta/moeda e lista de movimentos com sinal, kind, data e nota; paginação e lista própria, sem somar moedas. Registrar quatro kinds, excluir com modal; não criar endpoint de edição sem escopo aprovado. Arquivadas seguem Q04.

Datas/timestamps do formulário devem ter o significado aprovado, sem transformar inadvertidamente movimento posterior em meia-noite anterior ao checkpoint. Reconciliação mostra esperado/exposição, solicita disponível observado e nota e explica diferença; servidor calcula banca resultante. Não pedir saldo inicial abstrato nem reescrever checkpoint.

Feedback de gravação é confirmado pelo servidor. Falha preserva entrada, retry não duplica movimento/checkpoint conforme P06. Não enfileirar financeiro offline; mostrar indisponibilidade de rede de modo recuperável. Não implementar histórico/undo adicional, transferências, bônus, FX ou novos cálculos financeiros no frontend. Layout livre, mobile pode usar lista/timeline com informação equivalente.

## TDD e verificações

Proponha tests/e2e/bankroll.spec.ts. RED de jornada: depósito aumenta disponível, open bet compromete stake, reconciliação esperado/observado produz valor do backend; saque e ajustes com direção correta, delete cancelado/confirmado. Testar evento no mesmo dia do checkpoint conforme Q07, falha de rede e retry sem duplicação. Fixtures próprias por teste e usuário, sem dados reais.

Local: teste Feature do comportamento alterado se houver regressão; make check; make assets; make test-e2e ARGS=tests/e2e/bankroll.spec.ts, desktop/mobile e axe. CI: make quality. Não repetir E2E inteiro a cada ajuste de texto.

Registre RED com causa esperada, GREEN do mesmo teste e REFACTOR sem mudar comportamento. Seletividade segue REVIEW.md: teste afetado no ciclo, validação relacionada depois, gates aprofundados no CI conforme risco. Não rode suite/E2E/mutation completos em cada iteração nem relaxe gate para passar. Bibliotecas novas exigem uso concreto e locks; atualize métricas/includes/fronteiras na medida do código real, sem abstrações vazias.

## Critérios de aceite

Usuário consegue explicar de onde vem disponível e confirmar efeitos; formulário não perde entrada em falha; dados e timestamps batem com P06. Acessibilidade, idioma/tema e toque testados; sem suporte offline financeiro prometido.

## Limites operacionais e entrega

Edite apenas o novo repositório; ../oddiary permanece somente leitura, sem comandos que escrevam ali. Não copie .env, credenciais, dumps ou dados reais. Migrações desta tarefa, se previstas, só em banco local/efêmero inequivocamente identificado e autorizado pelo escopo; nunca Supabase produtivo. Não altere Cloud/Supabase/domínio/secrets, execute reset remoto ou deploy sem checkpoint específico com recurso, impacto, backup e recuperação.

Respeite branches/PR/CI e revisão independente. Commit/push/PR somente quando autorizados pelo pedido que iniciou a execução; use make publish quando publicação for autorizada, sem autoaprovação ou bypass. Este arquivo não autoriza executar os próximos prompts ou integrar produção.

Entregue código/tests/contratos e documentação canônica afetada, registre decisões aceitas e evidências por ID. Relatório: comportamento, arquivos, migrations/dependências, RED/GREEN, comandos/resultados reais, CI/PR somente se efetivos, riscos e pendências. Não declare UI/rede/dispositivo/provedor ou produção verificados com base apenas em configuração/fake.
