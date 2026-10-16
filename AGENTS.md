# Desenvolvimento

Consulte README.md para setup e comandos, REVIEW.md para critérios de qualidade e IMPLEMENTATION.md para prioridades. Confira código, configurações e testes antes de introduzir padrões. Atualize a documentação afetada na mesma alteração.

## Código e arquitetura

Use nomes semânticos em inglês, tipos explícitos e responsabilidades coesas. Mantenha baixo acoplamento e dependências direcionais sem ciclos. Reutilize antes de abstrair; introduza DDD, módulos, interfaces e serviços quando houver necessidade concreta. Não fragmente código apenas para satisfazer métricas.

Prefira código autoexplicativo. Comentários devem registrar apenas contratos externos, segurança ou decisões não evidentes indispensáveis.

Laravel é autoridade para autenticação, autorização, validação e invariantes. Preserve CSRF, escaping e isolamento de dados. Analise concorrência, idempotência, transações e falhas de rede conforme o contexto. Evite N+1 e consultas ilimitadas; otimize com evidência. Não crie API interna para conectar Inertia sem consumidor independente.

Dependências precisam de uso concreto, compatibilidade e avaliação de segurança. Mantenha locks e instalação reproduzível.

## Testes e qualidade

Use `make` como interface principal. Comportamento testável segue RED → GREEN → REFACTOR com o menor teste afetado. Bugs reproduzíveis exigem regressão; refatorações usam os testes existentes como rede de segurança.

Selecione testes por arquivos e dependências; amplie para mudanças críticas, transversais ou de impacto incerto. Não rode suíte completa, E2E completo ou mutation testing em cada ciclo. `make check` valida a alteração; `make quality` reúne os gates aprofundados no CI e na verificação local completa. `make publish` exige branch de trabalho commitada e limpa, origin correto e gh autenticado; nunca use push direto à principal ou force-push. Enquanto não houver CI confiável, execute a validação local proporcional antes de concluir.

Mudanças de runtime exigem setup e `make docker-check`. Mudanças de PWA exigem testes do worker e smoke de navegador com assets atuais. Mutation é pontual/periódica em lógica relevante. Não enfraqueça checks para obter sucesso; informe comandos, resultados e limitações reais.

## Interface

Mobile-first adaptativo, com composição mobile específica quando necessária e lógica/contratos compartilhados. Suporte claro/escuro e português/inglês por dicionários. A referência visual orienta cores, tipografia e componentes; a organização das telas segue as tarefas do usuário.

Prefira hierarquia e espaço a bordas, cards aninhados e enfeites. Reutilize tokens e componentes. Garanta semântica acessível, teclado, toque, feedback e acesso a texto truncado. Formulários usam `noValidate`, mensagens acessíveis junto aos campos e validação no servidor. Use toasts e componentes próprios; ações destrutivas usam modal. Não use travessão em documentação ou texto visível.

## Segurança e operação

Não versione credenciais ou dados pessoais nem imprima secrets. Documente variáveis por nome e propósito. Cache e bancos de teste não podem cruzar ambientes.

Operações destrutivas ou mudanças em produção exigem aprovação específica com recurso/ambiente, ação, consequências, backup e recuperação. Nunca presuma políticas remotas ativas sem verificar.

Branches e PRs exigem revisão independente de alterações produzidas por IA, checks obrigatórios e auto-merge somente após gates e aprovações válidos. O plano de configuração está em IMPLEMENTATION.md.

Skills devem conter procedimentos especializados usados de fato, sem duplicar regras permanentes ou comandos determinísticos.
