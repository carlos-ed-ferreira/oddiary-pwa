# P14: Importação e revisão utilizáveis

## Objetivo e capacidades

Enviar texto/imagens, entender propostas/falhas e confirmar somente correções salvas, com experiência mobile recuperável.

IDs: CAT-02, IMP-01, IMP-05, IMP-06, IMP-07, IMP-08, UX-01. Esta é uma tarefa futura; não execute outros prompts junto por conveniência.

## Contexto obrigatório

Trabalhe no Oddiary PWA já inicializado. Releia AGENTS.md, REVIEW.md, README.md, IMPLEMENTATION.md, docs/operations.md, docs/pwa.md e docs/rebuild/{INVENTORY,ROADMAP,OPEN_QUESTIONS}.md. Confira Git, alterações pendentes, PR/CI e implementação prévia das dependências antes de editar. Preserve trabalho alheio e crie branch curta da main atualizada, sem supor merge operacional. Engenharia e stack vigentes são as do novo projeto.

Os caminhos da fonte abaixo são relativos a ../oddiary; leia os arquivos reais antes de reutilizar regras. Caminhos de testes novos propostos nesta tarefa são entregáveis a criar, não testes já existentes.

Leia na fonte pages/imports/{create,show}.tsx, components/betting/import-*.tsx, components/form/image-field.tsx, lib/{images,errors}.ts e testes frontend image-field/images e Feature/Import/ImportControllerTest.php. Releia contratos novos de P12/P13, não a UI antiga como template.

## Dependências e decisões

P07/P12/P13; Q11 e todas as decisões de estado/modo/retentativa correspondentes aceitas. Referência visual validada, caso contrário AGUARDA REFERÊNCIA VISUAL.

Leia as respostas registradas das perguntas citadas. Se não houver resposta para comportamento central, pergunte somente isso e não fixe regra irreversível. Avance no que for independente, sem declarar a tarefa completa. Nenhuma divergência entre código e documentação é resolvida automaticamente por este prompt.

## Escopo, comportamento, dados e segurança

Entrada permite texto, selecionar/colar imagens, ordem/preview/remoção, casa opcional e modo financeiro explícito conforme Q08. Provedor não configurado tem aviso e servidor/cliente coerentes; presença de key não é prova de disponibilidade. Upload/processing e erros são próprios e acessíveis, sem expor payload bruto diagnóstico.

Preview mostra slip/legs, proposta e informação de resolução, novas entidades/ambiguidade conforme Q05, duplicados, rejeições e campos faltantes. Tipo pessoal é ação humana opcional, nunca inferido. Correções e include/skip obedecem Q11; explicitar salvando/salvo/falhou e impedir confirmação com request pendente ou stale. Sem reimplementação de regras financeiras em JS.

Escolher casa sem chamada IA, aviso de leitura genérica/casa diferente e releitura explicitamente confirmada quando substitui correções/custa chamada; screenshot-only explica necessidade de reenvio. Confirmado é estado final segundo Q09, inclusive após reload; back/retry/double submit não duplicam. Rede falha mantém entrada em memória no que for seguro, sem prometer persistência ao fechar app nem guardar screenshots/dados em SW/IndexedDB. Não criar lista geral de imports/novo editor de catálogo sem escopo.

## TDD e verificações

Proponha tests/e2e/import-review.spec.ts com provider fake no backend de teste isolado. RED de comportamento: sem casa pode analisar, não confirmar; campos faltantes editáveis; skip ignora incompleto; duplicados não entram; correção pendente/falha não confirma; releitura explica perda e screenshot-only indisponível; confirma uma vez e reload não reabre. Upload/clipboard/remoção e UI com múltiplas legs em mobile; mensagens de provider/refusal/parcial; nenhum excerpt privado no DOM.

Local: Vitest focado para lógica de imagens/estado se existir; make check; make assets; make test-e2e ARGS=tests/e2e/import-review.spec.ts com axe, pt-BR/en e claro/escuro em matriz proporcional. CI: make quality, sem API key. Não usar um endpoint de fake acessível em produção.

Registre RED com causa esperada, GREEN do mesmo teste e REFACTOR sem mudar comportamento. Seletividade segue REVIEW.md: teste afetado no ciclo, validação relacionada depois, gates aprofundados no CI conforme risco. Não rode suite/E2E/mutation completos em cada iteração nem relaxe gate para passar. Bibliotecas novas exigem uso concreto e locks; atualize métricas/includes/fronteiras na medida do código real, sem abstrações vazias.

## Critérios de aceite

Jornada de texto/imagem revisável até confirmação idempotente, estados acessíveis, sem corrida salvar/confirmar e sem vazamento/caching privado. Manual do diário permanece utilizável sem IA. Registrar modelos/dispositivos reais não verificados.

## Limites operacionais e entrega

Edite apenas o novo repositório; ../oddiary permanece somente leitura, sem comandos que escrevam ali. Não copie .env, credenciais, dumps ou dados reais. Migrações desta tarefa, se previstas, só em banco local/efêmero inequivocamente identificado e autorizado pelo escopo; nunca Supabase produtivo. Não altere Cloud/Supabase/domínio/secrets, execute reset remoto ou deploy sem checkpoint específico com recurso, impacto, backup e recuperação.

Respeite branches/PR/CI e revisão independente. Commit/push/PR somente quando autorizados pelo pedido que iniciou a execução; use make publish quando publicação for autorizada, sem autoaprovação ou bypass. Este arquivo não autoriza executar os próximos prompts ou integrar produção.

Entregue código/tests/contratos e documentação canônica afetada, registre decisões aceitas e evidências por ID. Relatório: comportamento, arquivos, migrations/dependências, RED/GREEN, comandos/resultados reais, CI/PR somente se efetivos, riscos e pendências. Não declare UI/rede/dispositivo/provedor ou produção verificados com base apenas em configuração/fake.
