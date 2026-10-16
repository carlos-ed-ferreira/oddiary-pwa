# P15: Ativação opcional e retomada

## Objetivo e capacidades

Ajudar uma conta provisionada a escolher casas, importar/revisar abertos e reconciliar, sem obrigar setup ou IA.

IDs: ACC-01, BNK-03, ONB-01, UX-01. Esta é uma tarefa futura; não execute outros prompts junto por conveniência.

## Contexto obrigatório

Trabalhe no Oddiary PWA já inicializado. Releia AGENTS.md, REVIEW.md, README.md, IMPLEMENTATION.md, docs/operations.md, docs/pwa.md e docs/rebuild/{INVENTORY,ROADMAP,OPEN_QUESTIONS}.md. Confira Git, alterações pendentes, PR/CI e implementação prévia das dependências antes de editar. Preserve trabalho alheio e crie branch curta da main atualizada, sem supor merge operacional. Engenharia e stack vigentes são as do novo projeto.

Os caminhos da fonte abaixo são relativos a ../oddiary; leia os arquivos reais antes de reutilizar regras. Caminhos de testes novos propostos nesta tarefa são entregáveis a criar, não testes já existentes.

Leia na fonte docs/product/onboarding.md, OnboardingController.php, Middleware/RequireOnboarding.php, pages/onboarding/index.tsx e testes Feature/Betting/PreferencesTest.php e DashboardTest.php. Compare show que marca completo imediatamente, return de import e limite100 open, com o contrato Q12 aprovado.

## Dependências e decisões

P08/P09/P14; Q12 respondida antes de criar marcador/guard. Referência visual aprovada ou AGUARDA REFERÊNCIA VISUAL.

Leia as respostas registradas das perguntas citadas. Se não houver resposta para comportamento central, pergunte somente isso e não fixe regra irreversível. Avance no que for independente, sem declarar a tarefa completa. Nenhuma divergência entre código e documentação é resolvida automaticamente por este prompt.

## Escopo, comportamento, dados e segurança

Implemente a semântica aceita de visto/concluído/retomar e quais rotas são guardadas. Não gravar conclusão em GET ou adicionar estado persistido de wizard por conveniência: qualquer escolha deve corresponder à resposta. Pular/sair não trava acesso futuro às tarefas.

Reutilize endpoints de conta/import/bet/reconcile já existentes, sem writes especiais ou regras financeiras duplicadas. Revisar abertos antes de saldo observado; distinguir o que efetivamente compõe exposição tracked do histórico que não afeta banca. Se quantidade excede limite, indicar/paginar ou direcionar ao diário sem esconder exposição; não criar arbitrariamente limite universal.

Importação pode falhar ou estar indisponível; ainda deve haver caminho manual e continuar depois. Retorno da importação/reload/back precisa seguir Q12 sem perder dados já gravados ou fingir transação de wizard. Criar migrations apenas se a decisão realmente exigir, banco local isolado. Não copiar ordem visual, número de passos ou tabs como requisito de layout.

## TDD e verificações

Proponha tests/Feature/Onboarding/FlowTest.php e tests/e2e/onboarding.spec.ts. RED: primeira visita/retorno conforme semântica, skip tudo, sair/reload/back, casa já existe, import indisponível/falha/retorno, histórico open não confundido com exposição tracked, revisar/corrigir antes de reconciliar, usuário alheio invisível. Dados gravados continuam após abandonar, sem duplicar ao retomar. Testar quantidade acima do limite da lista.

Local: make test-backend ARGS=tests/Feature/Onboarding/FlowTest.php; make check; make assets; make test-e2e ARGS=tests/e2e/onboarding.spec.ts com mobile/touch, teclado e axe. CI: make quality. Não acionar provedor real em ativação de teste.

Registre RED com causa esperada, GREEN do mesmo teste e REFACTOR sem mudar comportamento. Seletividade segue REVIEW.md: teste afetado no ciclo, validação relacionada depois, gates aprofundados no CI conforme risco. Não rode suite/E2E/mutation completos em cada iteração nem relaxe gate para passar. Bibliotecas novas exigem uso concreto e locks; atualize métricas/includes/fronteiras na medida do código real, sem abstrações vazias.

## Critérios de aceite

Conta entra no produto sem setup compulsório, retorno e marcador obedecem decisão explícita, reconciliação usa a exposição real e endpoints comuns. Nenhum layout definitivo implementado sem referência.

## Limites operacionais e entrega

Edite apenas o novo repositório; ../oddiary permanece somente leitura, sem comandos que escrevam ali. Não copie .env, credenciais, dumps ou dados reais. Migrações desta tarefa, se previstas, só em banco local/efêmero inequivocamente identificado e autorizado pelo escopo; nunca Supabase produtivo. Não altere Cloud/Supabase/domínio/secrets, execute reset remoto ou deploy sem checkpoint específico com recurso, impacto, backup e recuperação.

Respeite branches/PR/CI e revisão independente. Commit/push/PR somente quando autorizados pelo pedido que iniciou a execução; use make publish quando publicação for autorizada, sem autoaprovação ou bypass. Este arquivo não autoriza executar os próximos prompts ou integrar produção.

Entregue código/tests/contratos e documentação canônica afetada, registre decisões aceitas e evidências por ID. Relatório: comportamento, arquivos, migrations/dependências, RED/GREEN, comandos/resultados reais, CI/PR somente se efetivos, riscos e pendências. Não declare UI/rede/dispositivo/provedor ou produção verificados com base apenas em configuração/fake.
