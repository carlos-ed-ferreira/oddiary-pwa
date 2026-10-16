# P11: Extração e normalização genérica de import

## Objetivo e capacidades

Transformar fonte não confiável em propostas legíveis e rejeições específicas, com IA como assistente e sem writes financeiros.

IDs: CAT-03, IMP-02, IMP-03, IMP-08. Esta é uma tarefa futura; não execute outros prompts junto por conveniência.

## Contexto obrigatório

Trabalhe no Oddiary PWA já inicializado. Releia AGENTS.md, REVIEW.md, README.md, IMPLEMENTATION.md, docs/operations.md, docs/pwa.md e docs/rebuild/{INVENTORY,ROADMAP,OPEN_QUESTIONS}.md. Confira Git, alterações pendentes, PR/CI e implementação prévia das dependências antes de editar. Preserve trabalho alheio e crie branch curta da main atualizada, sem supor merge operacional. Engenharia e stack vigentes são as do novo projeto.

Os caminhos da fonte abaixo são relativos a ../oddiary; leia os arquivos reais antes de reutilizar regras. Caminhos de testes novos propostos nesta tarefa são entregáveis a criar, não testes já existentes.

Leia na fonte docs/domain/ai-normalization.md, config/ai.php, Import/Agents/BetImportAgent.php, Parsing/{BetSlipParser,AnswerPayload,AnswerNormalizer,ParsedAnswer,ParsedBet,ParsedSelection,Selections,MarketWording}.php, ImportFailed.php e testes de Agent/Normalizer/Parser/AnswerPayload/RealBookmakerPaste. Releia Money/Odds e schema de bilhetes implementados.

## Dependências e decisões

P02/P04/P05; Q03/Q06/Q08 e decisão R03 para datas/gramática/referências/fixtures. Não requer token real.

Leia as respostas registradas das perguntas citadas. Se não houver resposta para comportamento central, pergunte somente isso e não fixe regra irreversível. Avance no que for independente, sem declarar a tarefa completa. Nenhuma divergência entre código e documentação é resolvida automaticamente por este prompt.

## Escopo, comportamento, dados e segurança

Adicione Laravel AI SDK no consumidor (fonte usa 0.11.0), com compatibilidade/lock e sem alterar framework. Adapter/provider apenas na fronteira necessária; fake por padrão nos testes, bloquear chamadas externas acidentais. Configuração somente por nomes OPENAI_API_KEY, OPENAI_TEXT_MODEL, OPENAI_URL, secrets server-side. Timeout explícito (60s observado), falha mapeada; store=false não é promessa universal de retenção.

Schema de um slip por aposta, selections obrigatórias e sem BetType; nenhum cálculo financeiro delegado ao modelo. Aceitar envelope até200/legs até30, decimais/datas/statuses/limites validados após normalização. Ausências de data/seleção permanecem null para revisão, não inventadas; status ausente segue regra aprovada e desconhecido rejeitado. Ano/fuso/ref curtas seguem Q03/Q08, não heurística universal silenciosa.

Extrair texto de todos os blocos candidatos do provedor e reconhecer refusal. Entrada inválida gera rejeição posição/campos preservando as válidas; envelope vazio/inválido/todas rejeitadas e provider são estados distintos. Extração genérica não persiste bets/catálogo, screenshots, batches ou diagnóstico privado no navegador. Regras por casa e upload são P13; sem buscas externas/filas/IA direta no DB.

## TDD e verificações

Proponha tests/Unit/Import/ParserTest.php e fixtures fictícias. RED: structured output sem BetType, simples/múltipla/bet builder, total explícito versus odds de leg, imagem futura não altera unidade slip; JSON em bloco posterior a reasoning, refusal, envelope vazio/inválido, 200/201, 30/31, parcial válido, falta de data/seleção, prêmio projetado não vira retorno, status desconhecido, moeda/decimal/ano/refs conforme decisões. Não copiar valores de histórico real.

Local: make test-backend ARGS=tests/Unit/Import/ParserTest.php; make check; auditoria Composer se dependência mudar. CI: make quality, sem token/provider de produção. Não chamar SDK real para verificar testes.

Registre RED com causa esperada, GREEN do mesmo teste e REFACTOR sem mudar comportamento. Seletividade segue REVIEW.md: teste afetado no ciclo, validação relacionada depois, gates aprofundados no CI conforme risco. Não rode suite/E2E/mutation completos em cada iteração nem relaxe gate para passar. Bibliotecas novas exigem uso concreto e locks; atualize métricas/includes/fronteiras na medida do código real, sem abstrações vazias.

## Critérios de aceite

Parser e normalizador retornam propostas/rejeições com contrato explícito, cálculos determinísticos e falhas distintas sem segredos; sem persistência econômica ou chamada real. Registrar quais hipóteses dependem de fixtures/formato e que IA real não foi validada.

## Limites operacionais e entrega

Edite apenas o novo repositório; ../oddiary permanece somente leitura, sem comandos que escrevam ali. Não copie .env, credenciais, dumps ou dados reais. Migrações desta tarefa, se previstas, só em banco local/efêmero inequivocamente identificado e autorizado pelo escopo; nunca Supabase produtivo. Não altere Cloud/Supabase/domínio/secrets, execute reset remoto ou deploy sem checkpoint específico com recurso, impacto, backup e recuperação.

Respeite branches/PR/CI e revisão independente. Commit/push/PR somente quando autorizados pelo pedido que iniciou a execução; use make publish quando publicação for autorizada, sem autoaprovação ou bypass. Este arquivo não autoriza executar os próximos prompts ou integrar produção.

Entregue código/tests/contratos e documentação canônica afetada, registre decisões aceitas e evidências por ID. Relatório: comportamento, arquivos, migrations/dependências, RED/GREEN, comandos/resultados reais, CI/PR somente se efetivos, riscos e pendências. Não declare UI/rede/dispositivo/provedor ou produção verificados com base apenas em configuração/fake.
