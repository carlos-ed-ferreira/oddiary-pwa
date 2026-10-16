# P17: Qualificação e checkpoint operacional

## Objetivo e capacidades

Comprovar que as fatias funcionam juntas e produzir um checkpoint de publicação identificado, com riscos/recuperação verificáveis, sem publicar por autorização implícita deste prompt.

IDs: ANA-01, ANA-04, BET-04, BNK-01, BNK-02, CFG-01, DAT-01, IDN-01, IDN-02, IDN-03, IDN-04, IDN-05, IMP-07, ONB-01, PUB-01. Esta é uma tarefa futura; não execute outros prompts junto por conveniência.

## Contexto obrigatório

Trabalhe no Oddiary PWA já inicializado. Releia AGENTS.md, REVIEW.md, README.md, IMPLEMENTATION.md, docs/operations.md, docs/pwa.md e docs/rebuild/{INVENTORY,ROADMAP,OPEN_QUESTIONS}.md. Confira Git, alterações pendentes, PR/CI e implementação prévia das dependências antes de editar. Preserve trabalho alheio e crie branch curta da main atualizada, sem supor merge operacional. Engenharia e stack vigentes são as do novo projeto.

Os caminhos da fonte abaixo são relativos a ../oddiary; leia os arquivos reais antes de reutilizar regras. Caminhos de testes novos propostos nesta tarefa são entregáveis a criar, não testes já existentes.

Releia todos os documentos de rebuild, IMPLEMENTATION.md, docs/operations.md e docs/pwa.md; decisões aceitas das etapas, migrations, Makefile/CI, suíte E2E e políticas reais da main. Use o inventário como matriz de evidências, não como afirmação de implementação concluída.

## Dependências e decisões

P10/P14/P15/P16 e todos os demais contratos implementados/aprovados. Referência visual aceita para qualificar UI. Acesso ou aprovação de produção ausente é bloqueio específico, não permissão para executar cutover.

Leia as respostas registradas das perguntas citadas. Se não houver resposta para comportamento central, pergunte somente isso e não fixe regra irreversível. Avance no que for independente, sem declarar a tarefa completa. Nenhuma divergência entre código e documentação é resolvida automaticamente por este prompt.

## Escopo, comportamento, dados e segurança

Faça auditoria de cobertura por capacidade/decisão e registre lacunas. Complete somente regressões de integração justificadas, sem adicionar features adiadas. Jornadas: conta provisionada/login, configurações, single/múltipla/manual, movimento/reconcile, import fake/retry, dashboard e onboarding, segurança avançada. Bancos/testes efêmeros e fixtures sem dados pessoais.

Qualifique PWA/HTTPS no nível permitido: manifest/ícones/worker/build/no-store, navegação offline com erro honesto, cache privado vazio, sessão expirada/logout sem vazamento, abas/atualização sem perda de formulário ou duplicação. Não aumentar escopo SW/IndexedDB/sync/push. Se fizer teste entre builds, documentar procedimento e o que efetivamente foi comprovado; dispositivos físicos e HTTPS produtivo são provas separadas.

Prepare em docs/operations.md o inventário de recursos concretos somente se houver acesso de leitura autorizado: Cloud app/environment/source/runtime/build/health/rollback; Supabase ref/DB/schemas/auth/storage/RLS/Data API/backups; domínio/certificado. Sem acesso, listar exatamente o faltante. Decidir preservação de dados/passkeys com responsável; schema novo não justifica reset prematuro.

Este prompt não permite mudar origem do Cloud, secret, DNS, apagar recurso, rodar migration/reset no Supabase ou fazer deploy. Antes de cada operação futura, pedir aprovação pontual com IDs/alvo exatos, comando/impacto, backup viável/teste de restore e rollback aplicável; se alvo/recuperação não for inequívoco, não executar. Não criar infraestrutura paralela como contorno automático. Fluxo ponta a ponta de merge/deploy só será declarado comprovado após autorização separada e evidências reais.

## TDD e verificações

Local: escolher E2E/journeys afetados, make check, build e testes financeiros/concorrência relevantes; ao final make quality e inspecionar CI real somente quando publicação da branch estiver autorizada. Não executar suite antiga nem provider/produção para obter verde. Sem instalar mutation/performance ferramentas por formalidade; aferição dirigida de regra crítica quando viável, com resultado e custo.

Contrato de rollout precisa ensaio clean migration/restore em alvo local autorizado, contagens/constraints e comparação de resultados sintéticos, sem dump de dados reais no Git. Rollback de código não reverte banco. Smoke de produção futuro deve ser não destrutivo e autorizado, não E2E que cria/exclui usuários ou apostas reais.

Registre RED com causa esperada, GREEN do mesmo teste e REFACTOR sem mudar comportamento. Seletividade segue REVIEW.md: teste afetado no ciclo, validação relacionada depois, gates aprofundados no CI conforme risco. Não rode suite/E2E/mutation completos em cada iteração nem relaxe gate para passar. Bibliotecas novas exigem uso concreto e locks; atualize métricas/includes/fronteiras na medida do código real, sem abstrações vazias.

## Critérios de aceite

Matriz por capacidade com testes/limites e decisões rastreáveis, quality/CI com resultados reais, nenhuma feature adicional. Relatório distingue pronto local, verificado remoto, acesso ausente e aprovação pendente; não chama produção/PWA físico/recuperação de concluídos sem prova.

## Limites operacionais e entrega

Edite apenas o novo repositório; ../oddiary permanece somente leitura, sem comandos que escrevam ali. Não copie .env, credenciais, dumps ou dados reais. Migrações desta tarefa, se previstas, só em banco local/efêmero inequivocamente identificado e autorizado pelo escopo; nunca Supabase produtivo. Não altere Cloud/Supabase/domínio/secrets, execute reset remoto ou deploy sem checkpoint específico com recurso, impacto, backup e recuperação.

Respeite branches/PR/CI e revisão independente. Commit/push/PR somente quando autorizados pelo pedido que iniciou a execução; use make publish quando publicação for autorizada, sem autoaprovação ou bypass. Este arquivo não autoriza executar os próximos prompts ou integrar produção.

Entregue código/tests/contratos e documentação canônica afetada, registre decisões aceitas e evidências por ID. Relatório: comportamento, arquivos, migrations/dependências, RED/GREEN, comandos/resultados reais, CI/PR somente se efetivos, riscos e pendências. Não declare UI/rede/dispositivo/provedor ou produção verificados com base apenas em configuração/fake.
