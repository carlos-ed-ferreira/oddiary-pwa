# P06: Ledger e reconciliação da banca

## Objetivo e capacidades

Explicar saldo disponível, exposição e banca por conta, registrando movimentos e checkpoints sem aplicar histórico duas vezes.

IDs: BET-02, BNK-01, BNK-02, BNK-03. Esta é uma tarefa futura; não execute outros prompts junto por conveniência.

## Contexto obrigatório

Trabalhe no Oddiary PWA já inicializado. Releia AGENTS.md, REVIEW.md, README.md, IMPLEMENTATION.md, docs/operations.md, docs/pwa.md e docs/rebuild/{INVENTORY,ROADMAP,OPEN_QUESTIONS}.md. Confira Git, alterações pendentes, PR/CI e implementação prévia das dependências antes de editar. Preserve trabalho alheio e crie branch curta da main atualizada, sem supor merge operacional. Engenharia e stack vigentes são as do novo projeto.

Os caminhos da fonte abaixo são relativos a ../oddiary; leia os arquivos reais antes de reutilizar regras. Caminhos de testes novos propostos nesta tarefa são entregáveis a criar, não testes já existentes.

Leia docs/domain/bankroll.md, app/Modules/Betting/Bankroll/{AccountBalance,AccountBalanceCalculator,TransactionKind}.php, Actions/, Models/, controllers Transaction/Reconciliation, requests e tests AccountBalance/Calculator/BankrollWrites/BankrollController da fonte. Compare TransactionDialog que envia data com o corte estrito por timestamp.

## Dependências e decisões

P05; Q03 e Q07 aprovadas para fuso/corte/edição/empates. A decisão precisa exemplos antes de schema/algoritmo definitivo.

Leia as respostas registradas das perguntas citadas. Se não houver resposta para comportamento central, pergunte somente isso e não fixe regra irreversível. Avance no que for independente, sem declarar a tarefa completa. Nenhuma divergência entre código e documentação é resolvida automaticamente por este prompt.

## Escopo, comportamento, dados e segurança

Movimentos: deposit/withdrawal/positive_adjustment/negative_adjustment, amount positivo, sinal só por kind; occurred_at explícito/default conforme Q07, nota até 255. Listar 25/página por occurred_at/id desc, somente contas próprias; criar/excluir, sem inventar edição. Saldo negativo não é bloqueado hoje; qualquer nova restrição exige decisão.

Banca = último checkpoint + movimentos posteriores + P&L tracked liquidado posterior; exposição = stakes tracked abertos; disponível=banca−exposição. Historical é analítico, não ledger; não inferir por event_date. Sem checkpoint base zero. Agregue conjunto de contas sem N+1, com autorização antes do calculador.

Reconciliação guarda observado, exposição, banca resultante, esperado, diferença, nota e instante; não altera checkpoints anteriores. Use transação e estratégia de consistência/concorrência aprovada; teste corrida de settlement/movimento/captura e empates, sem presumir que DB::transaction sozinho serializa leitura. Defina idempotência de envio da operação separada do valor igual. Sem UI, bônus, locked funds, FX, transferências ou histórico/undo adicional não aprovados.

## TDD e verificações

Proponha tests/Feature/Bankroll/LedgerTest.php. RED: depósito 1000, open tracked stake200 → banca1000/exposição200/disponível800; reconciliar observado750 → banca950/diferença−50; liquidar won com retorno400 → banca/disponível1150, exposição0. Em cenários isolados: loss/void/cashout liberam exposição com efeito correto; historical nunca muda saldo. Último checkpoint desempata por regra aprovada; igualdade no instante e data sem hora têm testes específicos. Cobrir saque maior/negative, exclusão antes/depois de corte, moeda/usuários separados e concorrência real em conexões isoladas.

Local: make test-backend ARGS=tests/Feature/Bankroll/LedgerTest.php; make check; banco PostgreSQL efêmero. CI: make quality e testes concorrentes limitados ao risco, sem banco compartilhado com outras execuções.

Registre RED com causa esperada, GREEN do mesmo teste e REFACTOR sem mudar comportamento. Seletividade segue REVIEW.md: teste afetado no ciclo, validação relacionada depois, gates aprofundados no CI conforme risco. Não rode suite/E2E/mutation completos em cada iteração nem relaxe gate para passar. Bibliotecas novas exigem uso concreto e locks; atualize métricas/includes/fronteiras na medida do código real, sem abstrações vazias.

## Critérios de aceite

Números reproduzíveis e auditáveis, contrato temporal explicitamente aceito, nenhuma mistura event_date/ledger, saldo por moeda, query count limitado e corrida crítica coberta. Documentar limites de correção/recuperação sem prometer rollback de dados.

## Limites operacionais e entrega

Edite apenas o novo repositório; ../oddiary permanece somente leitura, sem comandos que escrevam ali. Não copie .env, credenciais, dumps ou dados reais. Migrações desta tarefa, se previstas, só em banco local/efêmero inequivocamente identificado e autorizado pelo escopo; nunca Supabase produtivo. Não altere Cloud/Supabase/domínio/secrets, execute reset remoto ou deploy sem checkpoint específico com recurso, impacto, backup e recuperação.

Respeite branches/PR/CI e revisão independente. Commit/push/PR somente quando autorizados pelo pedido que iniciou a execução; use make publish quando publicação for autorizada, sem autoaprovação ou bypass. Este arquivo não autoriza executar os próximos prompts ou integrar produção.

Entregue código/tests/contratos e documentação canônica afetada, registre decisões aceitas e evidências por ID. Relatório: comportamento, arquivos, migrations/dependências, RED/GREEN, comandos/resultados reais, CI/PR somente se efetivos, riscos e pendências. Não declare UI/rede/dispositivo/provedor ou produção verificados com base apenas em configuração/fake.
