# P10: Analytics e série temporal

## Objetivo e capacidades

Entender desempenho em uma janela analítica consistente com métricas, agrupamentos e uma série temporal acessível, independente da linha contábil.

IDs: ANA-01, ANA-02, ANA-03, ANA-04, BET-02, UX-01. Esta é uma tarefa futura; não execute outros prompts junto por conveniência.

## Contexto obrigatório

Trabalhe no Oddiary PWA já inicializado. Releia AGENTS.md, REVIEW.md, README.md, IMPLEMENTATION.md, docs/operations.md, docs/pwa.md e docs/rebuild/{INVENTORY,ROADMAP,OPEN_QUESTIONS}.md. Confira Git, alterações pendentes, PR/CI e implementação prévia das dependências antes de editar. Preserve trabalho alheio e crie branch curta da main atualizada, sem supor merge operacional. Engenharia e stack vigentes são as do novo projeto.

Os caminhos da fonte abaixo são relativos a ../oddiary; leia os arquivos reais antes de reutilizar regras. Caminhos de testes novos propostos nesta tarefa são entregáveis a criar, não testes já existentes.

Leia na fonte app/Modules/Betting/Analytics/, DashboardController/Request, pages/dashboard.tsx, lib/dashboard-query.ts, components/betting/{result-chart,balance-chart,breakdown-table,dashboard-filters,dashboard-period-tabs}.tsx e tests Unit/Betting/Analytics, Feature/Betting/DashboardQueryTest.php, DashboardTest.php e journal E2E.

## Dependências e decisões

P05/P07; Q03/Q10 aprovadas. Referência visual acessível e aceita, ou AGUARDA REFERÊNCIA VISUAL para UI.

Leia as respostas registradas das perguntas citadas. Se não houver resposta para comportamento central, pergunte somente isso e não fixe regra irreversível. Avance no que for independente, sem declarar a tarefa completa. Nenhuma divergência entre código e documentação é resolvida automaticamente por este prompt.

## Escopo, comportamento, dados e segurança

Implemente agregação escopada ao usuário e moeda-base, event_date inclusivo. Métricas: bets/volume/stake liquidada/P&L/abertos/stake aberta/statuses, unidades por snapshot, ROI e hit rate com denominadores do inventário. Zero denominador é null, não zero. Histórico e tracked entram igualmente em analytics; sem somar moeda diferente/FX.

Daily default, monthly/yearly calculados no servidor e custom/from-to; bare from-to vira custom. Conta/tipo/status/esporte por qualquer leg, sem multiplicar stake em join. Validação de intervalo inválido explícita. Agrupar por casa/tipo, incluindo sem tipo. Série month/year ancora em to e completa buckets zero; total é da janela do gráfico, não dos cards. Dimensões valem em ambas.

UI mostra escopo ativo/reset e dá acesso a todos os valores sem hover/cor obrigatórios. Exibição de saldos atuais e série com snapshots parciais seguem Q10; não copiar números ou composição para imitar layout anterior. Sem breakdown novo por competição/mercado, previsão, aposta sugerida ou biblioteca chart sem necessidade demonstrada. Medir query count/volume antes de cache/agregação persistida.

## TDD e verificações

Proponha tests/Feature/Analytics/DashboardTest.php e tests/e2e/analytics.spec.ts. RED: won stake100/retorno200, lost50/0, void20/20, open30/null → volume200, settled150, P&L50, ROI33.33, hit50, exposição analítica30; com unidade100 em todos, resultado0.50u. Adicionar vazio/null, sem unidade, snapshot parcial segundo Q10, moeda/usuário alheio, múltipla de dois esportes contada uma vez, bissexto/virada ano e filtros. Série com 28/29/30/31 dias e 12 meses, total próprio e janela fixa ignorando from-to.

Local: make test-backend ARGS=tests/Feature/Analytics/DashboardTest.php; Vitest para transformação de query/labels se criada; make check; make assets; make test-e2e ARGS=tests/e2e/analytics.spec.ts com tabela acessível, teclado/mobile e axe. CI: make quality.

Registre RED com causa esperada, GREEN do mesmo teste e REFACTOR sem mudar comportamento. Seletividade segue REVIEW.md: teste afetado no ciclo, validação relacionada depois, gates aprofundados no CI conforme risco. Não rode suite/E2E/mutation completos em cada iteração nem relaxe gate para passar. Bibliotecas novas exigem uso concreto e locks; atualize métricas/includes/fronteiras na medida do código real, sem abstrações vazias.

## Critérios de aceite

Fórmulas exatas únicas no backend, filtros round-trip, séries completas e limites de moeda/unidade comunicados; sem confundir resultado analítico com saldo atual. Declarar medição real de queries, não performance presumida.

## Limites operacionais e entrega

Edite apenas o novo repositório; ../oddiary permanece somente leitura, sem comandos que escrevam ali. Não copie .env, credenciais, dumps ou dados reais. Migrações desta tarefa, se previstas, só em banco local/efêmero inequivocamente identificado e autorizado pelo escopo; nunca Supabase produtivo. Não altere Cloud/Supabase/domínio/secrets, execute reset remoto ou deploy sem checkpoint específico com recurso, impacto, backup e recuperação.

Respeite branches/PR/CI e revisão independente. Commit/push/PR somente quando autorizados pelo pedido que iniciou a execução; use make publish quando publicação for autorizada, sem autoaprovação ou bypass. Este arquivo não autoriza executar os próximos prompts ou integrar produção.

Entregue código/tests/contratos e documentação canônica afetada, registre decisões aceitas e evidências por ID. Relatório: comportamento, arquivos, migrations/dependências, RED/GREEN, comandos/resultados reais, CI/PR somente se efetivos, riscos e pendências. Não declare UI/rede/dispositivo/provedor ou produção verificados com base apenas em configuração/fake.
