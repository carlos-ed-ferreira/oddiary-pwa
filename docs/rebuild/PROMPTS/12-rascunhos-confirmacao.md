# P12: Rascunhos e confirmação íntegra

## Objetivo e capacidades

Rever propostas por usuário e confirmar lote sem efeito duplicado ou alteração econômica antes de consentimento.

IDs: BET-01, CAT-01, CAT-02, CFG-02, IMP-05, IMP-06, IMP-07, IMP-08. Esta é uma tarefa futura; não execute outros prompts junto por conveniência.

## Contexto obrigatório

Trabalhe no Oddiary PWA já inicializado. Releia AGENTS.md, REVIEW.md, README.md, IMPLEMENTATION.md, docs/operations.md, docs/pwa.md e docs/rebuild/{INVENTORY,ROADMAP,OPEN_QUESTIONS}.md. Confira Git, alterações pendentes, PR/CI e implementação prévia das dependências antes de editar. Preserve trabalho alheio e crie branch curta da main atualizada, sem supor merge operacional. Engenharia e stack vigentes são as do novo projeto.

Os caminhos da fonte abaixo são relativos a ../oddiary; leia os arquivos reais antes de reutilizar regras. Caminhos de testes novos propostos nesta tarefa são entregáveis a criar, não testes já existentes.

Leia na fonte Import/Actions/{ParseImportBatch,DraftBuilder,AssignBookmakerAccount,CatalogPromotion,ConfirmImportBatch}.php, Import/Models/, BetFingerprint.php, controllers Import/ImportDraft, requests ImportDraft/ImportAccount e testes BetImport/ImportController/ImportFailure. Compare D08/D09 e constraints/migrations de batches/drafts/bets.

## Dependências e decisões

P03/P05/P11; Q05/Q08/Q09 aprovadas para resolução, dedup/estados/retenção; Q02 para snapshot. Banco PostgreSQL isolado.

Leia as respostas registradas das perguntas citadas. Se não houver resposta para comportamento central, pergunte somente isso e não fixe regra irreversível. Avance no que for independente, sem declarar a tarefa completa. Nenhuma divergência entre código e documentação é resolvida automaticamente por este prompt.

## Escopo, comportamento, dados e segurança

Crie batches/drafts mínimos com estados pending/ready/failed/confirmed, proposal/resolution/rejections e referências. Nenhuma leitura/preview cria bets ou promove global. Ownership em batch/draft/conta/tipo e cada destino de catálogo; dados de usuário vindos do cliente não escolhem owner/moeda.

Implemente edição include/skip e correções segundo contrato aprovado, revalidando campos, resolução, fingerprint e duplicados quando afetam identidade. Fechamento após confirmar, possibilidade de reabrir/editar e retenção seguem Q09, não copiar ausência de guard do legado. Completar data/seleção/preço de included é obrigatório; skipped incompleto não impede válidos. Sem aceitar IDs privados alheios ou moeda incompatível no snapshot.

Escolher conta depois reatribui moeda/fingerprint/dedup sem IA; preservar indicação de casa de leitura. Releitura explícita com texto retido e sem batch confirmado, tratamento de correções/falhas conforme Q09. Finalização verifica estado sob consistência transacional, candidatos privados e CreateBet com snapshot por moeda; replay e confirmações concorrentes não duplicam efeito.

Dedup heurística conta/ref ou fingerprint por legs ordenadas/parâmetros não é idempotência de operação. Q08 determina bilhetes idênticos legítimos; não criar unique global do hash por conveniência. Revalidar no commit para dados editados/novas apostas entre preview e confirm. Limpar batch text/excerpt e demais dados conforme retenção aceita, sem prometer limpar proposal se não implementado. Sem UI ou operação produtiva.

## TDD e verificações

Proponha tests/Feature/Import/ConfirmationTest.php. RED: preview sem bets/catálogo global; alheio 403; include/skip e faltas; editar selection/date/stake recalc identity; IDs de terceiros recusados; conta escolhida depois atualiza moeda/dedup sem chamar IA; batch fechado não muda; retry retorna resultado estável. Duas conexões confirmando mesmo lote e dois lotes concorrentes sobre mesma ref não duplicam; caso sem ref segue Q08. Falha em leg/candidato desfaz todo lote; snapshot moeda diferente não vira unidade sem conversão. Confirmação de failed/pending e lote sem included tem resultado aprovado explícito, nunca falso sucesso.

Local: make test-backend ARGS=tests/Feature/Import/ConfirmationTest.php com PostgreSQL efêmero; make check e regressões financeiras relacionadas. CI: make quality. Testes concorrentes em processos/DB isolados, sem suites simultâneas sobre schema compartilhado.

Registre RED com causa esperada, GREEN do mesmo teste e REFACTOR sem mudar comportamento. Seletividade segue REVIEW.md: teste afetado no ciclo, validação relacionada depois, gates aprofundados no CI conforme risco. Não rode suite/E2E/mutation completos em cada iteração nem relaxe gate para passar. Bibliotecas novas exigem uso concreto e locks; atualize métricas/includes/fronteiras na medida do código real, sem abstrações vazias.

## Critérios de aceite

Confirmação atômica/idempotente, ausência de writes antes dela, correções refletidas no resultado e estado final protegido segundo decisão. Mostrar evidência de concorrência e limitações do fingerprint; sem retenção ou recuperação inventadas.

## Limites operacionais e entrega

Edite apenas o novo repositório; ../oddiary permanece somente leitura, sem comandos que escrevam ali. Não copie .env, credenciais, dumps ou dados reais. Migrações desta tarefa, se previstas, só em banco local/efêmero inequivocamente identificado e autorizado pelo escopo; nunca Supabase produtivo. Não altere Cloud/Supabase/domínio/secrets, execute reset remoto ou deploy sem checkpoint específico com recurso, impacto, backup e recuperação.

Respeite branches/PR/CI e revisão independente. Commit/push/PR somente quando autorizados pelo pedido que iniciou a execução; use make publish quando publicação for autorizada, sem autoaprovação ou bypass. Este arquivo não autoriza executar os próximos prompts ou integrar produção.

Entregue código/tests/contratos e documentação canônica afetada, registre decisões aceitas e evidências por ID. Relatório: comportamento, arquivos, migrations/dependências, RED/GREEN, comandos/resultados reais, CI/PR somente se efetivos, riscos e pendências. Não declare UI/rede/dispositivo/provedor ou produção verificados com base apenas em configuração/fake.
