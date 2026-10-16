# P16: Perfil e segurança avançada

## Objetivo e capacidades

Permitir gerir perfil/senha, TOTP/recovery e passkeys, com confirmação recente, origem válida e exclusão de conta com efeito compreendido.

IDs: IDN-02, IDN-03, IDN-04, IDN-05, UX-01. Esta é uma tarefa futura; não execute outros prompts junto por conveniência.

## Contexto obrigatório

Trabalhe no Oddiary PWA já inicializado. Releia AGENTS.md, REVIEW.md, README.md, IMPLEMENTATION.md, docs/operations.md, docs/pwa.md e docs/rebuild/{INVENTORY,ROADMAP,OPEN_QUESTIONS}.md. Confira Git, alterações pendentes, PR/CI e implementação prévia das dependências antes de editar. Preserve trabalho alheio e crie branch curta da main atualizada, sem supor merge operacional. Engenharia e stack vigentes são as do novo projeto.

Os caminhos da fonte abaixo são relativos a ../oddiary; leia os arquivos reais antes de reutilizar regras. Caminhos de testes novos propostos nesta tarefa são entregáveis a criar, não testes já existentes.

Leia na fonte Settings/ProfileController.php, SecurityController.php, Requests/Settings/, config/fortify.php, Models/User.php, migrations de users/passkeys, pages/settings/{profile,security}.tsx, components de 2FA/passkeys, tests Feature/Auth/{TwoFactorChallenge,PasswordConfirmation,EmailVerification}Test.php e Settings/{ProfileUpdate,Security}Test.php. Consulte os contratos do pacote na versão efetivamente instalada; não presumir E2E WebAuthn existente.

## Dependências e decisões

P01/P07 e Q13 para exclusão/identidade; referência visual aprovada ou AGUARDA REFERÊNCIA VISUAL. Não migrar contas/passkeys reais nesta etapa.

Leia as respostas registradas das perguntas citadas. Se não houver resposta para comportamento central, pergunte somente isso e não fixe regra irreversível. Avance no que for independente, sem declarar a tarefa completa. Nenhuma divergência entre código e documentação é resolvida automaticamente por este prompt.

## Escopo, comportamento, dados e segurança

Perfil altera nome/e-mail único, limpa verificação quando e-mail muda e aplica Q01 às áreas restritas; senha nova confirmada requer senha atual e rate6/min. Regras de senha produtivas devem ser explícitas/revisadas e testadas sem consulta externa acidental.

2FA: habilitar/confirmar/desabilitar com confirmação recente; segredo/recovery só no escopo necessário e sem logs/props gerais/cache. Login exige desafio antes da sessão definitiva, rate5/min e recovery code consumido adequadamente. Passkeys: options/registro/login/confirmação/exclusão com challenge, RP/origin e ownership corretos; fallback senha quando navegador não suporta. Avaliar pacotes Fortify/passkeys da fonte somente se consumidor atual justificar, preservando stack/locks.

Exclusão requer senha e modal com alcance aprovado Q13; verificar cascata completa e sessão/CSRF invalidados. Não criar soft delete/retention policy ou invalidar credenciais antigas implicitamente. APP_URL e PASSKEYS_USER_HANDLE_SECRET são requisitos, nunca valores transportados. Não trocar domínio/APP_KEY/secrets reais. UI inteira localizada, sem herdar literais auth ingleses. Sem recuperação via suporte humano fictício ou gerenciador administrativo novo.

## TDD e verificações

Proponha tests/Feature/Identity/SecurityTest.php e tests/e2e/security.spec.ts. RED: e-mail igual/diferente e unicidade, senha errada e nova confirmada, exclusão falha/sucesso/cascata em fixtures; 2FA confirmação obrigatória, TOTP inválido, recovery consumido/replay; passkey outro usuário, challenge expirado/replay, origin/RP incorreto, registro/login/exclusão. Testes HTTP e autenticador virtual de Chromium não substituem dispositivo físico; testar fallback/cancelamento WebAuthn.

Local: make test-backend ARGS=tests/Feature/Identity/SecurityTest.php; make check; make assets; make test-e2e ARGS=tests/e2e/security.spec.ts, com axe/mobile/idiomas. CI: make quality e fakes de mail/qualquer verificação externa. Nunca imprimir segredo TOTP/código/token nos relatórios.

Registre RED com causa esperada, GREEN do mesmo teste e REFACTOR sem mudar comportamento. Seletividade segue REVIEW.md: teste afetado no ciclo, validação relacionada depois, gates aprofundados no CI conforme risco. Não rode suite/E2E/mutation completos em cada iteração nem relaxe gate para passar. Bibliotecas novas exigem uso concreto e locks; atualize métricas/includes/fronteiras na medida do código real, sem abstrações vazias.

## Critérios de aceite

Fluxos de segurança completos e negativos comprovados, confirmação independente do botão, nenhum segredo exposto e exclusão com alcance aprovado. Registrar limites de dispositivos/passkeys/migração e deixar produção intacta.

## Limites operacionais e entrega

Edite apenas o novo repositório; ../oddiary permanece somente leitura, sem comandos que escrevam ali. Não copie .env, credenciais, dumps ou dados reais. Migrações desta tarefa, se previstas, só em banco local/efêmero inequivocamente identificado e autorizado pelo escopo; nunca Supabase produtivo. Não altere Cloud/Supabase/domínio/secrets, execute reset remoto ou deploy sem checkpoint específico com recurso, impacto, backup e recuperação.

Respeite branches/PR/CI e revisão independente. Commit/push/PR somente quando autorizados pelo pedido que iniciou a execução; use make publish quando publicação for autorizada, sem autoaprovação ou bypass. Este arquivo não autoriza executar os próximos prompts ou integrar produção.

Entregue código/tests/contratos e documentação canônica afetada, registre decisões aceitas e evidências por ID. Relatório: comportamento, arquivos, migrations/dependências, RED/GREEN, comandos/resultados reais, CI/PR somente se efetivos, riscos e pendências. Não declare UI/rede/dispositivo/provedor ou produção verificados com base apenas em configuração/fake.
