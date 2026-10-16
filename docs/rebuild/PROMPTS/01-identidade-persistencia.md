# P01: Identidade e persistência isolada

## Objetivo e capacidades

Disponibilizar autenticação Laravel de contas provisionadas, com sessão, logout, recuperação e confirmação, provada por HTTP/testes. Não há cadastro público. A fatia é backend; as telas de acesso definitivas pertencem a P07.

IDs: DAT-01, IDN-01, IDN-02. Esta é uma tarefa futura; não execute outros prompts junto por conveniência.

## Contexto obrigatório

Trabalhe no Oddiary PWA já inicializado. Releia AGENTS.md, REVIEW.md, README.md, IMPLEMENTATION.md, docs/operations.md, docs/pwa.md e docs/rebuild/{INVENTORY,ROADMAP,OPEN_QUESTIONS}.md. Confira Git, alterações pendentes, PR/CI e implementação prévia das dependências antes de editar. Preserve trabalho alheio e crie branch curta da main atualizada, sem supor merge operacional. Engenharia e stack vigentes são as do novo projeto.

Os caminhos da fonte abaixo são relativos a ../oddiary; leia os arquivos reais antes de reutilizar regras. Caminhos de testes novos propostos nesta tarefa são entregáveis a criar, não testes já existentes.

Leia na fonte config/fortify.php, app/Models/User.php, app/Providers/FortifyServiceProvider.php, app/Actions/Fortify/ResetUserPassword.php, app/Concerns/PasswordValidationRules.php, vendor/laravel/fortify/routes/routes.php e os testes Feature/Auth. Confira D01: verified não basta sem contrato MustVerifyEmail no modelo. Releia no novo projeto phpunit.xml, compose.yaml, compose.ci.yaml, composer.json/lock, Makefile e o workflow CI antes de adaptar persistência.

## Dependências e decisões

Aceite operacional de IMPLEMENTATION.md, atualização da branch documental após merge da PR #1 e resposta Q01. Sem isso, relate o bloqueio; não escolha a política de e-mail por conta própria.

Leia as respostas registradas das perguntas citadas. Se não houver resposta para comportamento central, pergunte somente isso e não fixe regra irreversível. Avance no que for independente, sem declarar a tarefa completa. Nenhuma divergência entre código e documentação é resolvida automaticamente por este prompt.

## Escopo, comportamento, dados e segurança

Adicione Fortify somente como dependência consumida, avaliando a versão 1.38.0 usada pela fonte sem alterar Laravel 13.30.0. Crie users/reset tokens e factories mínimas; não acrescente sessões/cache/jobs em DB sem consumidor. Preserve cookie/sync/array do runtime quando suficientes.

Prepare PostgreSQL 18.6 de integração efêmero e credenciais exclusivas. Configure alvo e guardas explícitas para testes de persistência; DB_URL remoto/host produtivo ou banco de desenvolvimento devem ser recusados antes de qualquer reset. Mantenha testes de unidade sem banco e o smoke técnico sem dependência externa. Atualize suites do phpunit se novos diretórios Unit forem criados; atualize CI/Make apenas no que o novo consumidor exigir, reutilizando comandos e checks existentes.

Implemente login/logout com CSRF, regeneração/invalidação da sessão, remember e limite de 5/minuto por e-mail/IP. Implemente contratos de reset/link assinado/confirmação e a política Q01 aprovada. Use mail/notification fake; nunca envie e-mail real. Provisionamento produtivo permanece fora. Sem UI antes de P07, use os contratos HTTP JSON do Fortify nos testes, sem criar API paralela, páginas vazias ou render de componentes inexistentes. Só habilite views quando páginas funcionais existirem.

Não adicionar domínio de apostas, cadastro público, seed de credencial compartilhada, 2FA/passkeys incompletos nem migrar usuários reais.

## TDD e verificações

Planeje tests/Feature/Identity/AuthenticationTest.php e testes focados de persistência/recuperação. RED: senha inválida mantém guest; conta válida autentica; logout encerra; rate limit retorna 429; GET/POST register não existem; token inválido/expirado e URL assinada adulterada falham; não verificado respeita Q01 em acesso e escrita. Verifique que conta A não recebe reset/identidade de B por parâmetro forjado.

Antes de habilitar migrations de teste, teste o guard de alvo com DSN remoto fictício, sem conexão; depois clean migration no DB efêmero. GREEN com testes individuais, depois regressão do bootstrap. Local: make test-backend ARGS=tests/Feature/Identity/AuthenticationTest.php; make check; make docker-check quando Compose mudar. CI: make quality com serviço de teste isolado, sem secrets de produção.

Registre RED com causa esperada, GREEN do mesmo teste e REFACTOR sem mudar comportamento. Seletividade segue REVIEW.md: teste afetado no ciclo, validação relacionada depois, gates aprofundados no CI conforme risco. Não rode suite/E2E/mutation completos em cada iteração nem relaxe gate para passar. Bibliotecas novas exigem uso concreto e locks; atualize métricas/includes/fronteiras na medida do código real, sem abstrações vazias.

## Critérios de aceite

Login/reset/logout e guard de verificação aprovados por testes; signup ausente; nenhuma view quebrada habilitada; instalação por lock e teste efêmero reproduzíveis. Informar exatamente os drivers e alvos de teste sem credenciais. Nenhum banco real/antigo foi modificado. P07 permanece pendente para UI.

## Limites operacionais e entrega

Edite apenas o novo repositório; ../oddiary permanece somente leitura, sem comandos que escrevam ali. Não copie .env, credenciais, dumps ou dados reais. Migrações desta tarefa, se previstas, só em banco local/efêmero inequivocamente identificado e autorizado pelo escopo; nunca Supabase produtivo. Não altere Cloud/Supabase/domínio/secrets, execute reset remoto ou deploy sem checkpoint específico com recurso, impacto, backup e recuperação.

Respeite branches/PR/CI e revisão independente. Commit/push/PR somente quando autorizados pelo pedido que iniciou a execução; use make publish quando publicação for autorizada, sem autoaprovação ou bypass. Este arquivo não autoriza executar os próximos prompts ou integrar produção.

Entregue código/tests/contratos e documentação canônica afetada, registre decisões aceitas e evidências por ID. Relatório: comportamento, arquivos, migrations/dependências, RED/GREEN, comandos/resultados reais, CI/PR somente se efetivos, riscos e pendências. Não declare UI/rede/dispositivo/provedor ou produção verificados com base apenas em configuração/fake.
