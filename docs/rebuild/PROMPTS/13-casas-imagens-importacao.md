# P13: Formatos de casas e imagens

## Objetivo e capacidades

Aceitar texto/screenshot de casas conhecidas e aplicar diferenças de wording sem duplicar stake ou armazenar screenshots desnecessariamente.

IDs: CAT-03, DAT-01, IMP-01, IMP-02, IMP-03, IMP-04, IMP-08. Esta é uma tarefa futura; não execute outros prompts junto por conveniência.

## Contexto obrigatório

Trabalhe no Oddiary PWA já inicializado. Releia AGENTS.md, REVIEW.md, README.md, IMPLEMENTATION.md, docs/operations.md, docs/pwa.md e docs/rebuild/{INVENTORY,ROADMAP,OPEN_QUESTIONS}.md. Confira Git, alterações pendentes, PR/CI e implementação prévia das dependências antes de editar. Preserve trabalho alheio e crie branch curta da main atualizada, sem supor merge operacional. Engenharia e stack vigentes são as do novo projeto.

Os caminhos da fonte abaixo são relativos a ../oddiary; leia os arquivos reais antes de reutilizar regras. Caminhos de testes novos propostos nesta tarefa são entregáveis a criar, não testes já existentes.

Leia na fonte Parsing/{BookmakerImportRules,GenericBookmakerImportRule,BetBoomImportRule,SuperbetImportRule,PinnacleImportRule}.php, Agent screenshot instructions, Http/Support/Screenshots.php, Requests/Betting/ImportRequest.php, database/seeders/BookmakerSeeder.php, docker/app/php.ini e testes unitários por casa/RealBookmakerPaste/ImportController.

## Dependências e decisões

P11/P12; Q03/Q08/Q09 e R03 aceitas. Sem acesso ao provedor necessário para testes; configuração real exige canal seguro.

Leia as respostas registradas das perguntas citadas. Se não houver resposta para comportamento central, pergunte somente isso e não fixe regra irreversível. Avance no que for independente, sem declarar a tarefa completa. Nenhuma divergência entre código e documentação é resolvida automaticamente por este prompt.

## Escopo, comportamento, dados e segurança

Implemente adapters determinísticos por fonte e guidance confiável revisada: generic não adivinha casa; BetBoom repara marcador; Superbet precedência de ganho potencial sobre oferta cashout e marcadores definidos, ao vivo/data conforme Q03; Pinnacle data após @ e retorno=risco+lucro exato. BetBoom não consta nos seeds atuais: não alegar que default de catálogo já o inclui. Mudança de guidance não dá autorização para UI de edição de instruções por usuário.

POST import aceita texto10..20000 e/ou até10 PNG/JPG/WebP até8192KB. Validar MIME/conteúdo/tamanho no servidor, manter ordem dos anexos e tratar payload grande de forma controlada. Confirmar limites de upload/post/memória no runtime local de teste, sem mudar Cloud ou inflar capacidade produtiva por hipótese. Não basta request declarar 8MB para dizer que o runtime suporta.

Adaptar UploadedFile na borda HTTP; não persistir screenshot nem URL pública/bucket. Não prometer que upload temporário nunca toca disco. Schema de IA mantém um slip por conjunto de legs, overlap/recortes tratados como fonte não confiável e revisão/dedup determinísticos finais. Chamada síncrona com timeout e limite de recursos explícitos; se não for viável, apresentar alternativa/decisão antes de criar fila/worker. Nunca reler screenshot-only sem reenvio, nem gastar chamada automaticamente. Sem conexão a API de casa, OCR separado ou consulta real não autorizada.

## TDD e verificações

Proponha tests/Feature/Import/SourcesTest.php e Unit/Import/HouseRulesTest.php. RED com fontes fictícias: potencial versus Sacado, prêmio/void/lost, hoje controlado; Pinnacle risco600+lucro416.40=retorno1016.40, loss−300+risco300=zero, data do evento distinta do timestamp; BetBoom e nomes desconhecidos. Upload: texto/imagem/ambos/nenhum, 10/11, 8MB/fronteira maior, tipo disfarçado, ordem e ausência de persistência da aplicação. Fake IA verifica anexos, timeout/falha e nenhum contato externo; não presumir OCR real a partir de fake.

Local: make test-backend ARGS=tests/Feature/Import/SourcesTest.php, Unit selecionado; make check; make docker-check apenas se runtime mudou. CI: make quality. Documentar diferença entre teste HTTP fake e limites efetivamente aferidos no processo de upload.

Registre RED com causa esperada, GREEN do mesmo teste e REFACTOR sem mudar comportamento. Seletividade segue REVIEW.md: teste afetado no ciclo, validação relacionada depois, gates aprofundados no CI conforme risco. Não rode suite/E2E/mutation completos em cada iteração nem relaxe gate para passar. Bibliotecas novas exigem uso concreto e locks; atualize métricas/includes/fronteiras na medida do código real, sem abstrações vazias.

## Critérios de aceite

Regras específicas com regressões, limites reais distinguidos de configuração, anexos sem persistência de aplicação e sem dados privados nos logs. Não declarar qualidade de leitura de imagem/modelo real testada só por fake.

## Limites operacionais e entrega

Edite apenas o novo repositório; ../oddiary permanece somente leitura, sem comandos que escrevam ali. Não copie .env, credenciais, dumps ou dados reais. Migrações desta tarefa, se previstas, só em banco local/efêmero inequivocamente identificado e autorizado pelo escopo; nunca Supabase produtivo. Não altere Cloud/Supabase/domínio/secrets, execute reset remoto ou deploy sem checkpoint específico com recurso, impacto, backup e recuperação.

Respeite branches/PR/CI e revisão independente. Commit/push/PR somente quando autorizados pelo pedido que iniciou a execução; use make publish quando publicação for autorizada, sem autoaprovação ou bypass. Este arquivo não autoriza executar os próximos prompts ou integrar produção.

Entregue código/tests/contratos e documentação canônica afetada, registre decisões aceitas e evidências por ID. Relatório: comportamento, arquivos, migrations/dependências, RED/GREEN, comandos/resultados reais, CI/PR somente se efetivos, riscos e pendências. Não declare UI/rede/dispositivo/provedor ou produção verificados com base apenas em configuração/fake.
