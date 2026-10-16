# P05: Bilhetes, seleções e liquidação

## Objetivo e capacidades

Gravar e corrigir um bilhete simples ou múltiplo como uma única operação financeira, com resultados exatos e proteção de propriedade.

IDs: BET-01, BET-02, BET-03, CAT-01, CAT-03. Esta é uma tarefa futura; não execute outros prompts junto por conveniência.

## Contexto obrigatório

Trabalhe no Oddiary PWA já inicializado. Releia AGENTS.md, REVIEW.md, README.md, IMPLEMENTATION.md, docs/operations.md, docs/pwa.md e docs/rebuild/{INVENTORY,ROADMAP,OPEN_QUESTIONS}.md. Confira Git, alterações pendentes, PR/CI e implementação prévia das dependências antes de editar. Preserve trabalho alheio e crie branch curta da main atualizada, sem supor merge operacional. Engenharia e stack vigentes são as do novo projeto.

Os caminhos da fonte abaixo são relativos a ../oddiary; leia os arquivos reais antes de reutilizar regras. Caminhos de testes novos propostos nesta tarefa são entregáveis a criar, não testes já existentes.

Leia app/Modules/Betting/Bets/{BetData,BetLegData,SettlementOutcome,SettledAt,CombinedOdds,BetFingerprint}.php, Actions/, Models/, app/Http/{Controllers/Betting/BetController,Requests/Betting/BetRequest,Concerns/ValidatesSettlementAmount,Support/BetPresenter}.php e testes BetLegs/BetController/BetData/SettlementOutcome da fonte. Leia todas as migrations de bets/legs, não copie o schema inicial já superado.

## Dependências e decisões

P02/P03/P04; Q06 para precisão e Q07 para edição temporal/proveniência. Não inventar semântica de transição ambígua.

Leia as respostas registradas das perguntas citadas. Se não houver resposta para comportamento central, pergunte somente isso e não fixe regra irreversível. Avance no que for independente, sem declarar a tarefa completa. Nenhuma divergência entre código e documentação é resolvida automaticamente por este prompt.

## Escopo, comportamento, dados e segurança

Crie bets/legs diretamente no formato necessário atual, sem migrations históricas de conversão. 1..30 legs, data/seleção por leg, odds da leg nullable. Odds total explícita vence produto; alguma leg sem preço exige odds total. Data analítica do bilhete é a maior data das legs. Uma stake por bilhete, mesmo atravessando dias/esportes; sem resultado/stake por leg.

Status open/won/lost/void/cashed_out com SettlementOutcome: open retorno null, won explícito ou stake×odds, lost zero, void stake, cashout explícito inclusive zero; P&L gerado no DB. Valor/odds/escala/overflow passam por validação controlada, não 500 por entrada conhecida. Constraints complementam domínio sem alegar invariantes que não implementam.

POST/PATCH/DELETE bets conforme inventário, conta/tipo próprios e catálogo global/próprio/contextual; writes de bilhete e legs na mesma transação. Snapshot de unidade por moeda e imutável na edição. Settled_at e reabertura seguem Q07; manter source/proveniência conforme decisão, sem apagar texto importado silenciosamente. Delete só do dono e legs cascata. Sem UI, analytics/banca calculados aqui, batch actions ou API paralela.

## TDD e verificações

Proponha tests/Feature/Bets/WriteSlipTest.php e Unit de SettlementOutcome/CombinedOdds. RED: single=1 leg; múltipla stake 100 não vira 200; odds 1.36×1.25 versus total 1.7045 explícito; preço ausente rejeitado; última data; estados/retornos contraditórios; zero/odds<1/overflow e limites 30/31; ownership forjado; snapshot null/antigo preservado; falha de leg desfaz tudo; atualização substitui legs; delete mantém outros usuários. Registrar transições liquidados/reaberto e precisão de 3+ legs segundo Q06/Q07.

Local: make test-backend ARGS=tests/Feature/Bets/WriteSlipTest.php e Unit selecionado; make check. PostgreSQL verifica generated/constraints/unique parcial de referência. CI: make quality. Mutation seletiva em cálculos somente se ferramenta viável, sem ampliar para toda suíte por ciclo.

Registre RED com causa esperada, GREEN do mesmo teste e REFACTOR sem mudar comportamento. Seletividade segue REVIEW.md: teste afetado no ciclo, validação relacionada depois, gates aprofundados no CI conforme risco. Não rode suite/E2E/mutation completos em cada iteração nem relaxe gate para passar. Bibliotecas novas exigem uso concreto e locks; atualize métricas/includes/fronteiras na medida do código real, sem abstrações vazias.

## Critérios de aceite

Bilhete atômico com retorno/P&L/snapshot/data exatos, autorização negativa e erro recuperável; contrato de edição/proveniência aprovado. Não alegar deduplicação heurística/idempotência global de import antes de P12.

## Limites operacionais e entrega

Edite apenas o novo repositório; ../oddiary permanece somente leitura, sem comandos que escrevam ali. Não copie .env, credenciais, dumps ou dados reais. Migrações desta tarefa, se previstas, só em banco local/efêmero inequivocamente identificado e autorizado pelo escopo; nunca Supabase produtivo. Não altere Cloud/Supabase/domínio/secrets, execute reset remoto ou deploy sem checkpoint específico com recurso, impacto, backup e recuperação.

Respeite branches/PR/CI e revisão independente. Commit/push/PR somente quando autorizados pelo pedido que iniciou a execução; use make publish quando publicação for autorizada, sem autoaprovação ou bypass. Este arquivo não autoriza executar os próximos prompts ou integrar produção.

Entregue código/tests/contratos e documentação canônica afetada, registre decisões aceitas e evidências por ID. Relatório: comportamento, arquivos, migrations/dependências, RED/GREEN, comandos/resultados reais, CI/PR somente se efetivos, riscos e pendências. Não declare UI/rede/dispositivo/provedor ou produção verificados com base apenas em configuração/fake.
