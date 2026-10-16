# P07: Referência visual e acesso utilizável

## Objetivo e capacidades

Entregar acesso funcional, idioma/tema e padrões compartilhados mínimos usados em fluxos reais de identidade. Não criar design system vazio ou copiar a navegação da referência.

IDs: CFG-01, IDN-01, IDN-02, PUB-01, UX-01. Esta é uma tarefa futura; não execute outros prompts junto por conveniência.

## Contexto obrigatório

Trabalhe no Oddiary PWA já inicializado. Releia AGENTS.md, REVIEW.md, README.md, IMPLEMENTATION.md, docs/operations.md, docs/pwa.md e docs/rebuild/{INVENTORY,ROADMAP,OPEN_QUESTIONS}.md. Confira Git, alterações pendentes, PR/CI e implementação prévia das dependências antes de editar. Preserve trabalho alheio e crie branch curta da main atualizada, sem supor merge operacional. Engenharia e stack vigentes são as do novo projeto.

Os caminhos da fonte abaixo são relativos a ../oddiary; leia os arquivos reais antes de reutilizar regras. Caminhos de testes novos propostos nesta tarefa são entregáveis a criar, não testes já existentes.

Releia docs/pwa.md, recursos/rotas de P01/P02 e a referência visual cujo caminho o responsável fornecer. Na fonte, leia resources/js/pages/auth/, welcome.tsx, lib/i18n/, locales/, hooks/use-appearance.tsx, components/form/, locale-switcher.tsx e testes Localization/frontend i18n/landing. Os docs/design antigos são somente evidência funcional/acessibilidade, não identidade a transplantar.

## Dependências e decisões

P01/P02; V01 fornecida/analisada e decisões R01/R02 aprovadas ou rejeitadas explicitamente. AGUARDA REFERÊNCIA VISUAL.

Leia as respostas registradas das perguntas citadas. Se não houver resposta para comportamento central, pergunte somente isso e não fixe regra irreversível. Avance no que for independente, sem declarar a tarefa completa. Nenhuma divergência entre código e documentação é resolvida automaticamente por este prompt.

## Escopo, comportamento, dados e segurança

Se a referência não estiver acessível, documente AGUARDA REFERÊNCIA VISUAL e não implemente telas definitivas nem substitutos de produto. Após análise aprovada, extraia cores/tipografia/componentes/estados para tokens mínimos em uso; navegação e composição atendem tarefas, não abas herdadas.

Habilite páginas funcionais login/reset/verificar/confirmar senha e welcome/acesso coerentes com P01. Formulários próprios noValidate com erro por campo, loading/erro/sucesso e prevenção de double submit, sem alert/confirm. Compartilhe apenas campos de identidade necessários, nunca modelo inteiro com segredos.

Implemente pt-BR/en em dicionários, formatação monetária string e datas sem alterar dia por fuso. Locale cookie/Accept-Language/default e light/dark/system por dispositivo; tratar cookie inválido/storage indisponível sem quebrar acesso. Mecanismo de parity e meta de toque seguem respostas R01/R02. Não migrar literais ingleses como padrão aceito. Não criar páginas de bets/banca ainda inexistentes só para preencher menus; acesso pode orientar estado realmente disponível.

## TDD e verificações

Proponha tests/frontend/i18n/locale.test.ts e tests/e2e/identity.spec.ts. RED de lógica: locale inválido/fallback, placeholders, preferência de sistema/storage indisponível e formato de data sem deslocamento. E2E com usuário sintético isolado: login inválido/válido/logout, reset fake, verificação conforme Q01, foco/teclado/erro local, idiomas e temas. Não usar mail real. Validar mobile/touch e desktop em combinação proporcional, axe zero serious/critical; não testar só snapshots de JSX.

Local: make test-frontend ARGS=tests/frontend/i18n/locale.test.ts; make check; make assets; make test-e2e ARGS=tests/e2e/identity.spec.ts; smoke PWA afetado. Adequar include de Vitest para .tsx só quando houver teste componente concreto e dependência justificada. CI: make quality.

Registre RED com causa esperada, GREEN do mesmo teste e REFACTOR sem mudar comportamento. Seletividade segue REVIEW.md: teste afetado no ciclo, validação relacionada depois, gates aprofundados no CI conforme risco. Não rode suite/E2E/mutation completos em cada iteração nem relaxe gate para passar. Bibliotecas novas exigem uso concreto e locks; atualize métricas/includes/fronteiras na medida do código real, sem abstrações vazias.

## Critérios de aceite

Referência identificada e análise registrada; acesso real sem páginas vazias/links quebrados; ambos idiomas/temas, teclado/toque e erros validados. PWA técnico/no-store preservados. Sem claim de instalação física ou offline de identidade.

## Limites operacionais e entrega

Edite apenas o novo repositório; ../oddiary permanece somente leitura, sem comandos que escrevam ali. Não copie .env, credenciais, dumps ou dados reais. Migrações desta tarefa, se previstas, só em banco local/efêmero inequivocamente identificado e autorizado pelo escopo; nunca Supabase produtivo. Não altere Cloud/Supabase/domínio/secrets, execute reset remoto ou deploy sem checkpoint específico com recurso, impacto, backup e recuperação.

Respeite branches/PR/CI e revisão independente. Commit/push/PR somente quando autorizados pelo pedido que iniciou a execução; use make publish quando publicação for autorizada, sem autoaprovação ou bypass. Este arquivo não autoriza executar os próximos prompts ou integrar produção.

Entregue código/tests/contratos e documentação canônica afetada, registre decisões aceitas e evidências por ID. Relatório: comportamento, arquivos, migrations/dependências, RED/GREEN, comandos/resultados reais, CI/PR somente se efetivos, riscos e pendências. Não declare UI/rede/dispositivo/provedor ou produção verificados com base apenas em configuração/fake.
