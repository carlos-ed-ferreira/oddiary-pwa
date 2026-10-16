# Inventário funcional

## Escopo, método e estado

Levantamento estático em 16/10/2026. Fonte funcional: `../oddiary`, revisão `d297ab6fde4aa4fb3a319083d66d1531726cae7b`, main limpa na consulta sem locks opcionais. Todos os caminhos de evidência deste documento são relativos à raiz dessa fonte, salvo indicação explícita de **novo projeto**. Não foram executados seus testes, aplicação, seeders ou migrations, nem consultados dados reais. Teste encontrado significa contrato escrito e inspecionado, não passagem comprovada nesta investigação.

No novo projeto, a base consultada é `1e06571`, na qual a PR operacional [#1](https://github.com/carlos-ed-ferreira/oddiary-pwa/pull/1) está aberta, sem merge, com quality aprovado no último commit. `docs/rebuild-plan` deriva dessa branch por autorização do responsável; documentos sem commit/push. Após o merge da PR #1, atualizar esta branch com main antes de preparar PR/entrega integrada. Produção continua sem integração comprovada, conforme `docs/operations.md` do novo projeto.

Foram lidos README, AGENTS, REVIEW, CLAUDE, documentos product/domain/architecture/design, referências e procedimentos `.agents/skills/`; confrontados com rotas, requests, controllers, ações, modelos, migrations, configuração, páginas/componentes e testes relevantes. Instruções da fonte são evidência histórica. As regras de engenharia vigentes são as do novo projeto.

**Certeza:** C = observado em código; T = há teste correspondente inspecionado; D = apenas documentado; I = hipótese a validar. C/T não comprova produção. Divergências estão na seção própria e decisões em [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md). Comportamento observado não é decisão automática de preservação.

**Atores:** V visitante; U usuário autenticado, com conta provisionada; O operador que provisiona/implanta por canais administrativos; IA provedor externo. Não foi encontrado papel administrativo dentro do produto, painel de usuários, organizações ou times.

**Precondição comum:** áreas de negócio usam middleware auth e verified nas rotas. O bloqueio efetivo por verificação de e-mail é divergente, ver D01. Cada registro abaixo explicita as demais condições. Todos os fluxos financeiros e importações dependem de rede no sistema inspecionado. Nenhum deles tem offline/sincronização comprovados. Mobile descreve tarefas e informação, sem impor a estética ou navegação existentes.

## Identidade e conta

### IDN-01: entrada, saída e sessão

- **Ator/precondições:** V com conta provisionada; U para sair. Não existe cadastro público.
- **Fluxo:** e-mail/senha, opção lembrar, sessão autenticada, destino `/bets`; sair via POST retorna à raiz. Credencial inválida mantém visitante; login limitado a 5 tentativas/minuto por e-mail normalizado/IP. Com 2FA habilitado, senha válida inicia desafio sem autenticar definitivamente.
- **Dados/contrato:** users, sessão/remember token; GET/POST `/login`, POST `/logout`; validação Fortify, CSRF e regeneração de sessão a preservar nos testes futuros.
- **Evidências:** `config/fortify.php`, `app/Providers/FortifyServiceProvider.php`, `resources/js/pages/auth/login.tsx`; `tests/Feature/Auth/AuthenticationTest.php`, `RegistrationTest.php` (GET/POST `/register` ausentes).
- **Certeza/lacunas:** C/T. Provisionamento é operacional, não tela de cadastro. Mobile precisa login acessível, erro recuperável e senha/gerenciador de senhas; nenhum login offline.

### IDN-02: recuperação, verificação e confirmação de senha

- **Ator/precondições:** V solicita reset por e-mail; U acessa verificação/confirmar senha. Entrega real exige mail transacional, não comprovado.
- **Fluxo:** solicitar link, apresentar token/e-mail, senha confirmada; token inválido ou expirado rejeitado. E-mail usa URL temporária assinada, id/hash e throttling. Confirmação recente protege operações de segurança e também pode usar passkey.
- **Contrato:** GET/POST `/forgot-password`, GET `/reset-password/{token}`, POST `/reset-password`; GET `/email/verify`, GET `/email/verify/{id}/{hash}`, POST `/email/verification-notification`; GET/POST `/user/confirm-password`, GET `/user/confirmed-password-status`.
- **Evidências:** `vendor/laravel/fortify/routes/routes.php`, `config/fortify.php`, `app/Actions/Fortify/ResetUserPassword.php`, `app/Concerns/PasswordValidationRules.php`; `tests/Feature/Auth/PasswordResetTest.php`, `EmailVerificationTest.php`, `VerificationNotificationTest.php`, `PasswordConfirmationTest.php`.
- **Certeza/lacunas:** C/T nos contratos testados, D para entrega produtiva. D01 é bloqueio funcional antes de P01. Tradução auth ainda incompleta na fonte. No novo produto: mensagens próprias, pt-BR/en e HTTPS antes de uso real.

### IDN-03: perfil, senha e exclusão da conta

- **Ator/precondições:** U; exclusão e troca de senha exigem senha atual. Rotas de perfil edit/update usam auth; destroy/security também declaram verified.
- **Fluxo:** editar nome/e-mail, unicidade de e-mail, limpar email_verified_at se e-mail mudar. Senha nova confirmada e regras dependentes do ambiente; PUT limitado a 6/minuto. Exclusão elimina usuário, encerra sessão, invalida token CSRF e retorna à raiz. Senha incorreta impede operação.
- **Dados:** cascatas atingem contas, apostas, movimentações, imports e candidatos particulares; tipos apagados isoladamente não apagam apostas. Identificar impacto completo antes de oferecer exclusão no novo produto.
- **Contrato/evidências:** `routes/settings.php`; `app/Http/Controllers/Settings/ProfileController.php`, `SecurityController.php`; `app/Http/Requests/Settings/`; migrations users e FKs; `tests/Feature/Settings/ProfileUpdateTest.php`, `SecurityTest.php`.
- **Certeza/lacunas:** C/T; testes de exclusão inspecionados provam contrato de usuário/senha, não toda a cascata. Mobile exige confirmação explícita própria; sem fila offline para exclusão. Política de retenção/recuperação precisa aceite antes de P16.

### IDN-04: autenticação em dois fatores

- **Ator/precondições:** U com confirmação de senha; V que já tem 2FA inicia desafio após login.
- **Fluxo:** habilitar, obter QR/segredo, confirmar TOTP, exibir/regenerar códigos de recuperação, desabilitar; login aceita TOTP ou recovery code. Desafio limitado a 5/minuto por login.id da sessão.
- **Contrato:** rotas Fortify `/two-factor-challenge`, `/user/two-factor-authentication`, `/user/confirmed-two-factor-authentication`, QR, secret-key e recovery-codes; métodos/names em `vendor/laravel/fortify/routes/routes.php`.
- **Evidências:** `config/fortify.php`, `app/Models/User.php`, `app/Http/Controllers/Settings/SecurityController.php`, componentes `manage-two-factor.tsx`, `two-factor-*`; `tests/Feature/Auth/TwoFactorChallengeTest.php`, `tests/Feature/Settings/SecurityTest.php`.
- **Certeza/lacunas:** C/T parcial; não há comprovação E2E do ciclo completo. Segredos não podem entrar em logs, props gerais ou cache PWA. UX de recuperação e erros precisa validação mobile.

### IDN-05: passkeys

- **Ator/precondições:** U gerencia credenciais após confirmação recente; V autentica com credencial registrada; navegador compatível e contexto seguro.
- **Fluxo:** obter options, WebAuthn, registrar com nome, listar metadados, remover com confirmação; autenticar e confirmar senha com passkey. Sem suporte, UI informa/omite alternativa e senha continua disponível. Limite 10/minuto por credencial/sessão e IP.
- **Contrato:** GET `/passkeys/login/options`, POST `/passkeys/login`; GET `/passkeys/confirm/options`, POST `/passkeys/confirm`; GET `/user/passkeys/options`, POST `/user/passkeys`, DELETE `/user/passkeys/{passkey}`; GET `/.well-known/passkey-endpoints` aponta enroll/manage para security.
- **Evidências:** `config/fortify.php` (RP/origin derivados de APP_URL, user_handle_secret), `database/migrations/0001_01_01_000003_create_passkeys_table.php`, `resources/js/components/passkey-*.tsx`, `manage-passkeys.tsx`, `vendor/laravel/fortify/routes/routes.php`.
- **Certeza/lacunas:** C, T apenas configuração/props de security na suíte inspecionada. Sem E2E WebAuthn dedicado localizado. Testar desafio, replay, origin/RP e ownership no novo projeto. Troca de domínio/segredo não pode invalidar silenciosamente credenciais existentes.

## Preferências e configuração de apoio

### CFG-01: idioma e aparência por dispositivo

- **Ator/precondições:** V recebe locale/theme inicial; U altera na aparência. Idioma cookie → Accept-Language → pt_BR; frontend recebe BCP47. Cookies locale/appearance não são criptografados e só podem selecionar valores permitidos.
- **Fluxo:** pt-BR/en com dicionários e placeholders equivalentes; claro/escuro/sistema. Idioma escreve cookie e recarrega; tema persiste localStorage e cookie, acompanha media query do sistema. Não são preferências sincronizadas do usuário.
- **Evidências:** `app/Modules/Shared/Localization/Locale.php`, `app/Http/Middleware/HandleLocale.php`, `HandleAppearance.php`, `resources/js/lib/i18n/`, `resources/js/hooks/use-appearance.tsx`, `components/locale-switcher.tsx`, `pages/settings/appearance.tsx`; testes Localization e `tests/frontend/i18n/`, `components/locale-switcher.test.tsx`.
- **Certeza/lacunas:** C/T idioma; tema C e matriz E2E parcial. Documento settings simplifica tema como cookie, mas código usa ambos. Storage indisponível/valor inválido precisa regressão. LocalStorage de tema não comprova offline de negócio.

### CFG-02: moeda-base e valor de unidade

- **Ator/precondições:** U; moeda permitida, unidade nula ou positiva exata.
- **Fluxo:** GET/PATCH `/settings/betting`, salva base_currency e unit_value. Nova aposta guarda snapshot; edição ou troca de preferência não reescreve snapshot existente. Sem unidade, métricas em unidades permanecem ausentes.
- **Dados/contratos:** `NUMERIC(20,8)`, string decimal com contexto monetário; moedas BRL e USD no enum/código, sem FX. Unidade manual só é aplicada se moeda da conta coincidir; import tem divergência D09.
- **Evidências:** `BettingPreferencesController.php`, `BettingPreferencesRequest.php` em `app/Http/`, `app/Models/User.php`, `app/Modules/Shared/Money/Currency.php`, `Betting/Bets/Actions/UpdateBet.php`; `tests/Feature/Betting/PreferencesTest.php`.
- **Certeza/lacunas:** C/T; BRL-only documental diverge da seleção real (D02). Decidir moedas e mudança de moeda de unidade antes de P02. Mobile: entrada decimal/localizada, sem cálculo financeiro por float.

### ACC-01: catálogo de casas e vínculo do usuário

- **Ator/precondições:** U escolhe casa global/própria ou informa nome customizado.
- **Fluxo:** criar vínculo único usuário/casa, moeda explícita ou base do usuário; repetição reutiliza vínculo. Nome novo gera casa privada normalizada por slug. Lista de casas disponíveis exclui vínculos já existentes, inclusive arquivados; outros usuários podem ter a mesma casa global.
- **Contrato:** GET `/settings/bookmakers`, POST `/bookmaker-accounts`; bookmaker_id ou name até 60; moeda enum opcional. Master bookmakers é distinto de bookmaker_accounts e saldos particulares.
- **Evidências:** `BookmakerAccountController.php`, `BookmakerAccountRequest.php`, `app/Modules/Betting/Bankroll/Models/Bookmaker*.php`; migrations `2026_08_20_000008*`, `000009*`; `tests/Feature/Betting/BankrollControllerTest.php`, `BettingOptionsTest.php`.
- **Certeza/lacunas:** C/T; criação por ID usa exists sem escopo de proprietário (D05). UI de configurações/onboarding existe; documentação promete criação contextual mais ampla que o formulário de aposta oferece. Não deduzir editor de casa master/global. Mobile: busca/seleção legível e criação de nome sem perder entrada da tarefa.

### ACC-02: arquivar/restaurar casas

- **Ator/precondições:** U proprietário da conta.
- **Fluxo:** PATCH `/bookmaker-accounts/{account}` com archived boolean. Arquivamento guarda timestamp, restauração limpa; não há DELETE de conta nem edição de moeda exposta. Histórico/saldo preservados. Options mantém arquivadas após ativas, em ordem alfabética sem distinção de caixa.
- **Evidências:** `ArchiveAccountRequest.php`, `BookmakerAccountController::update`, `app/Http/Support/BettingOptions.php`; testes BankrollController/BettingOptions.
- **Certeza/lacunas:** C/T; arquivadas continuam em options e podem ser gravadas por ID. Se arquivo deve impedir novas apostas/imports/movimentos é decisão Q04 antes de P03. Não simular exclusão. Mobile/PWA: feedback de estado e envio confirmado pelo servidor.

### TYP-01: tipos pessoais opcionais

- **Ator/precondições:** U cria/edita/apaga seus tipos; nomes únicos por usuário.
- **Fluxo:** GET `/settings/bet-types`; POST `/bet-types`, PATCH/DELETE `/bet-types/{betType}`; nome até 60, descrição até 160, position 0..999, archived opcional. Lista por posição/nome. Deletar tipo mantém apostas, com referência nula.
- **Evidências:** `BetTypeController.php`, `BetTypeRequest.php`, modelo `Betting/Bets/Models/BetType.php`, migration `2026_08_20_000010*`, `tests/Feature/Betting/BetTypeControllerTest.php`.
- **Certeza/lacunas:** C/T, arquivamento/ordenação/edição existem no backend; pages/settings/bet-types.tsx oferece criar/listar/excluir, não controles de edição/arquivo/ordenação. Tipo não é mercado nem classificação objetiva; IA não o propõe. Mobile: manter opcional; criação contextual é desejo documental, não capacidade demonstrada em todo seletor.

## Catálogo e normalização

### CAT-01: referências globais e candidatas privadas

- **Ator/precondições:** U consulta globais e próprias; criação manual/import confirmada gera candidatos privados.
- **Dados:** Sport, Competition (parent/datas/verified_at), Participant, Event (data e participantes via pivot), MarketType (parameters JSONB), CatalogAlias polimórfico. owner_user_id nulo indica global. Sport de competição/participante e competição de evento podem ser nulos.
- **Fluxo/limites:** a infraestrutura de modelos existe, mas não há CRUD administrativo, moderação ou promoção global exposta. Participant/pivot e metadados estruturais têm suporte de persistência, não um fluxo completo de cadastro no produto.
- **Evidências:** `app/Modules/Catalog/Models/`, migrations `2026_08_20_000002*` a `000007*`; `tests/Feature/Catalog/CatalogModelTest.php`, `CatalogScopeTest.php`.
- **Certeza/lacunas:** C/T estrutural. Unicidade PostgreSQL NULLS NOT DISTINCT preserva um registro por contexto incluindo global. Referências a entidades particulares requerem autorização de destino, não só FK. Sem UI própria/offline comprovados. Estruturas sem consumidor futuro podem ser adiadas explicitamente, ver roadmap.

### CAT-02: resolver aliases, candidatos e ambiguidades

- **Ator/precondições:** U informa wording manual ou revê import.
- **Fluxo:** Label normaliza ASCII/minúsculas/pontuação/espaços; resolver tenta alias próprio/global, slug no contexto, depois candidato com até 5 alternativas por correspondência textual. Writer cria privado e memoriza alias. Não realiza busca externa nem resolução semântica por ferramenta.
- **Evidências:** `Catalog/Resolution/CatalogResolver.php`, `CatalogWriter.php`, `CatalogMatch.php`, `Catalog/Normalization/Label.php`, `app/Http/Support/CatalogFromLabels.php`; `tests/Feature/Catalog/CatalogResolutionTest.php`, `CatalogScopeTest.php`.
- **Certeza/lacunas:** C/T; alias não valida contexto do alvo em throughAlias; lookup de evento não recebe data, embora writer use scheduled_on na unicidade. Documento descreve resolução contextual mais rica que a implementada (D06). Definir identidade de eventos/aliases em Q05 antes de P04. Não criar UI de moderação ou pesquisa externa por dedução.

### CAT-03: separar mercado de parâmetros

- **Ator/precondições:** U digita mercado ou IA extrai wording.
- **Fluxo:** import remove contagem de opções e extrai mapa para segment=`map:n`, reconhecendo variações PT/EN/ordinal; não remove wording se nada restar. Texto do mercado vence parâmetro map reportado; seleção não é reescrita para repetir mapa. Manual usa MarketSegment, mas não toda a cadeia MarketWording do import.
- **Evidências:** `Catalog/Normalization/MarketSegment.php`, `Import/Parsing/MarketWording.php`, `AnswerNormalizer.php`, `Http/Support/CatalogFromLabels.php`; `tests/Unit/Catalog/MarketSegmentTest.php`, `tests/Unit/Import/MarketWordingTest.php`, `tests/Feature/Betting/BetControllerTest.php`.
- **Certeza/lacunas:** C/T. JSONB tem limite de quantidade/comprimento no request, não um schema universal de todos os esportes. Evitar generalizar mapa para todo esporte. Edição manual remove segment se novo rótulo não o informa, inclusive parâmetro anterior; coberto por teste. Mobile exibe informação semanticamente, sem copiar formatação antiga.

## Diário e finanças das apostas

### BET-01: registrar um bilhete com uma ou várias seleções

- **Ator/precondições:** U, conta própria, tipo próprio opcional, 1..30 legs no HTTP; data e seleção de cada leg obrigatórias.
- **Fluxo:** um bilhete tem uma stake, status, retorno, moeda da conta, impacto tracked/historical, odds, nota e referência externa. Cada leg tem posição/data, referências de catálogo, selection_label, parâmetros e odds opcional. Odds total informada prevalece; caso ausente, produto das legs; alguma leg sem preço exige odds total. event_date do bilhete é a maior data das legs, não timestamp de criação. Múltipla pode atravessar esportes e dias.
- **Contrato:** POST `/bets`; ver tabela de payloads. `CreateBet` grava bilhete/legs transacionalmente; unit_value é snapshot. Não há liquidação por leg, stake por leg ou aposta separada para cada seleção.
- **Evidências:** `Betting/Bets/BetData.php`, `BetLegData.php`, `CombinedOdds.php`, `Actions/CreateBet.php`, `WriteBetLegs.php`, `Http/Requests/Betting/BetRequest.php`; `tests/Feature/Betting/BetLegsTest.php`, `BankrollWritesTest.php`, `tests/Unit/Betting/Bets/BetDataTest.php`.
- **Certeza/lacunas:** C/T; arredondamento da multiplicação ocorre a cada produto em Odds, assunto Q06. Validar overflow e limites financeiros antes de domínio/DB (D04). Mobile requer adicionar/remover seleções sem tabela comprimida; sem gravação offline.

### BET-02: resultados e liquidação

- **Ator/precondições:** U cria/edita bilhete; toda operação em moeda da stake.
- **Regras:** open não tem retorno nem settled_at; won usa retorno explícito ou stake×odds; lost retorna zero; void devolve stake; cashed_out exige retorno explícito, inclusive zero. realized_profit = retorno − stake, gerado no PostgreSQL; open produz null. Somente won/lost/cashed_out entram na stake liquidada; hit rate usa won/(won+lost), não void/cashout.
- **Transições observadas:** edição aceita qualquer status válido. Sair de open registra now; trocar entre liquidados mantém settled_at anterior; reabrir limpa; liquidar novamente marca novo instante. Não há máquina de transição mais restrita demonstrada.
- **Evidências:** `Betting/Bets/SettlementOutcome.php`, `BetStatus.php`, `SettledAt.php`, `Actions/UpdateBet.php`; migration `2026_08_20_000011*`; `tests/Unit/Betting/Bets/SettlementOutcomeTest.php`, `BetStatusTest.php`; `tests/Feature/Betting/BetControllerTest.php`.
- **Certeza/lacunas:** C/T cálculos; não foi encontrado teste de todas as transições/concorrência. DB não repete todos os invariantes de resultado alegados em money-and-precision.md (D03). Correção de aposta anterior ao checkpoint exige decisão Q07. Mobile exibe retorno total e P&L sem ambiguidade.

### BET-03: corrigir ou excluir bilhete

- **Ator/precondições:** U proprietário; PATCH/DELETE `/bets/{bet}` com Gate update/delete.
- **Fluxo:** edição substitui conjunto de legs na transação e recalcula data, retorno e fingerprint. Snapshot unit_value é preservado, inclusive null. Delete remove legs por cascata e altera consultas/saldos derivados; não há soft delete/audit log de versões demonstrado.
- **Evidências:** `Http/Controllers/Betting/BetController.php`, `Betting/Bets/Actions/UpdateBet.php`, `WriteBetLegs.php`, migrations bets/legs; `tests/Feature/Betting/BetControllerTest.php`, `BetLegsTest.php`; confirmação UI em `components/betting/confirm-action.tsx`.
- **Certeza/lacunas:** C/T; edição manual redefine source=manual e não recebe source_text no formulário, podendo perder proveniência importada. Impacto antes/depois de checkpoint e trilha de correções é Q07. Confirmar exclusão na UI não substitui Gate. Não enfileirar delete offline.

### BET-04: pesquisar, filtrar e ordenar diário

- **Ator/precondições:** U; primeira visita pode redirecionar a onboarding.
- **Fluxo:** GET `/bets`; busca case-insensitive em seleção, referência e notas; filtros status, conta, tipo, from/to event_date; abertos primeiro sob qualquer ordenação; whitelist event_date/stake/odds/realized_profit/status/created_at, direção asc/desc, desempate id desc. Default 25/página, request permite 5..100. Query preserva parâmetros na paginação.
- **Contrato:** props bets paginadas, filters e options; relacionamentos eager loaded. Desktop table e mobile list usam os mesmos dados, com editar/excluir por bilhete. Estado vazio, contagem, filtros ativos e limpar existem.
- **Evidências:** `Betting/Bets/BetListQuery.php`, `Http/Requests/Betting/BetIndexRequest.php`, `Http/Support/BetPresenter.php`, `pages/bets/index.tsx`, `components/betting/bet-filters.tsx`; testes BetListQuery/BetController e `tests/e2e/journal.spec.ts`.
- **Certeza/lacunas:** C/T; multi-select, ações em lote, edição por célula e virtualização são apenas desejos, não implementados. Intervalo invertido não tem validação explícita no request. Mobile não deve copiar breakpoint/layout como requisito estético.

## Banca e movimentações

### BNK-01: registrar/listar/excluir movimentações

- **Ator/precondições:** U, conta própria; auth/verified declarados.
- **Fluxo:** deposit, withdrawal, positive_adjustment, negative_adjustment; amount estritamente positivo no DB, sinal vem do kind; occurred_at informado ou now, nota opcional. GET/POST `/transactions`, DELETE `/transactions/{transaction}`. Lista somente contas próprias, 25/página, occurred_at desc/id desc, mostra saldos. Exclusão confirmada recalcula consultas. Não existe endpoint de edição.
- **Evidências:** `Bankroll/Actions/RecordTransaction.php`, `TransactionKind.php`, `Models/Transaction.php`, `Http/Controllers/Betting/TransactionController.php`, `TransactionRequest.php`, migration `2026_08_20_000012*`; testes BankrollWrites/BankrollController/DecimalInput e journal E2E.
- **Certeza/lacunas:** C/T. UI manda uma data, backend aceita timestamp, afetando checkpoint no mesmo dia (D10/Q07). Saque acima do disponível é permitido; saldo negativo é mostrado. Bônus, fundos bloqueados e transferências entre casas não estão modelados. Mobile requer informação de direção/data e resultado do envio.

### BNK-02: saldo atual por conta

- **Ator/precondições:** U consulta conjunto de contas próprias já autorizado no chamador.
- **Cálculo:** banca = banca do último checkpoint + movimentos com occurred_at estritamente posterior + realized_profit de tracked liquidados com settled_at posterior. Sem checkpoint, base zero e todo histórico contábil. Exposição = stake de todos tracked ainda open; disponível = banca − exposição. Historical nunca entra nesses três valores. Timestamps contábeis são independentes de event_date.
- **Evidências:** `Bankroll/AccountBalanceCalculator.php` (CTE DISTINCT ON, desempate captured_at/id), `AccountBalance.php`, `Http/Support/BettingOptions.php`; `tests/Feature/Betting/AccountBalanceCalculatorTest.php`, `tests/Unit/Betting/Bankroll/AccountBalanceTest.php`.
- **Certeza/lacunas:** C/T; calculador não autoriza IDs por si, depende do escopo do chamador. Uma query para o conjunto, não uma por conta. Dashboard ainda recebe options com saldos, embora não os renderize. Não converter moedas/conciliar por data analítica. UI mobile precisa distinguir banca/exposição/disponível.

### BNK-03: reconciliação auditável

- **Ator/precondições:** U dono da conta, saldo disponível observado não negativo no HTTP.
- **Fluxo:** POST `/bookmaker-accounts/{account}/reconciliations`; guarda available_amount observado, open_exposure_amount atual, bankroll_amount=soma, expected_available_amount, difference_amount e captured_at/note. Novo checkpoint, sem reescrever anteriores. Ordem recomendada: revisar open antes de reconciliar.
- **Evidências:** `Bankroll/Actions/ReconcileBalance.php`, `Http/Controllers/Betting/ReconciliationController.php`, `ReconciliationRequest.php`, migration `2026_08_20_000013*`; `tests/Feature/Betting/BankrollControllerTest.php`, `BankrollWritesTest.php`.
- **Certeza/lacunas:** C/T; transação existe, mas não há bloqueio explícito da conta no cálculo e testes concorrentes não localizados. Não há GET de histórico de reconciliações ou undo exposto. Corte temporal/edições/concorrência são Q07. Mobile exibe esperado/exposição/observado e confirma efeito sem inventar saldo inicial.

## Analytics

### ANA-01: métricas de desempenho

- **Ator/precondições:** U, moeda-base e escopo analítico definido.
- **Fluxo:** contar bets, volume, settledStake, resultado, openBets/openStake, won/lost/void/cashedOut, ROI e hit rate. ROI=resultado/stake liquidada×100; hit rate=won/(won+lost)×100. Denominador zero gera null; unidades somam realized_profit/unit_value de apostas liquidadas com snapshot. Historical e tracked entram igualmente na análise.
- **Contrato:** GET `/dashboard`, props metrics com dinheiro `{amount:string,currency}`, percentuais/units string|null. Percentuais/units apresentados a 2 casas; unidades por aposta no modelo usam 4 casas.
- **Evidências:** `Analytics/DashboardQuery.php::AGGREGATES`, `MetricSet.php`, `Bets/Models/Bet.php::units`, `tests/Unit/Betting/Analytics/MetricSetTest.php`, `tests/Feature/Betting/DashboardQueryTest.php`, `tests/Feature/DashboardTest.php`.
- **Certeza/lacunas:** C/T; não somar contas de moedas distintas nem usar timestamps de import. Necessita testes de precisão e moeda escolhida em Q02. Mobile deve expor denominadores/ausência, não zero fictício.

### ANA-02: contexto de filtros e período

- **Ator/precondições:** U; filtros retornam na URL/props.
- **Fluxo:** daily default, monthly, yearly ou custom; períodos fixos calculados no servidor ignoram from/to manuais; from/to sem period significam custom; custom incompleto usa defaults do servidor. Filtros conta[]/tipo[]/status[] e sport_id. Esporte inclui bilhete se qualquer leg corresponder, sem multiplicar stake por leg.
- **Evidências:** `Analytics/DashboardFilters.php`, `DashboardPeriod.php`, `Http/Requests/Betting/DashboardRequest.php`, `DashboardQuery::within`, `resources/js/lib/dashboard-query.ts`; testes DashboardFilters/DashboardQuery.
- **Certeza/lacunas:** C/T; datas são inclusivas, mas intervalo invertido não tem regra explícita. Fuso atual UTC do app, não preferência de usuário (Q03). Mobile precisa filtros ativos visíveis e reset, sem impor abas antigas.

### ANA-03: agrupamentos por casa/tipo

- **Ator/precondições:** U, mesmo contexto de ANA-02.
- **Fluxo:** agregação por nome da casa e nome do tipo, null agrupado como sem tipo; reaproveita MetricSet. Uma query por agrupamento. Visualização complementar compara resultado, sem biblioteca de charts obrigatória.
- **Evidências:** `DashboardQuery::byBookmaker/byBetType`, `resources/js/components/betting/breakdown-table.tsx`, `pages/dashboard.tsx`; `tests/Feature/Betting/DashboardQueryTest.php`.
- **Certeza/lacunas:** C/T. Não há breakdown por esporte/competição/mercado, apesar do armazenamento permitir evolução. Tipo deletado vira sem tipo no histórico atual. Mobile precisa acesso aos valores e rótulos completos.

### ANA-04: série completa e comparação temporal

- **Ator/precondições:** U escolhe span month/year independente do período dos cards.
- **Fluxo:** série ancora no filtro to; month inclui todos os dias do mês, year os 12 meses, preenchendo zeros. seriesTotal cobre essa janela própria, mantendo dimensões de filtro. Eixo usa unidades se houver snapshots, dinheiro caso contrário; valores acessíveis em tabela além de hover. Direção e sinal comunicam ganho/perda além da cor.
- **Evidências:** `Analytics/SeriesSpan.php`, `DashboardQuery::series/seriesTotal`, `components/betting/result-chart.tsx`, `balance-chart.tsx`; testes DashboardFilters/DashboardQuery e `tests/e2e/journal.spec.ts`.
- **Certeza/lacunas:** C/T parcial. Mistura de apostas com/sem unidade precisa ser explicitada (Q10); não apresentar série parcial em unidades como cobertura de todo resultado. Não copiar cores, geometria ou disposição do gráfico como identidade obrigatória.

## Importação assistida

### IMP-01: texto, imagens ou ambos

- **Ator/precondições:** U; configuração do provedor para uso real, conta da casa opcional inicialmente.
- **Fluxo:** GET `/imports/create`, POST `/imports`; texto 10..20000 caracteres ou screenshots, no máximo 10 PNG/JPG/WebP de 1KB..8192KB cada. Clipboard de imagens, seleção, preview local e remoção no frontend. Modo tracked preselecionado na UI; request exige escolha; default do DB é historical.
- **Evidências:** `Http/Requests/Betting/ImportRequest.php`, `Http/Support/Screenshots.php`, `pages/imports/create.tsx`, `components/form/image-field.tsx`, `resources/js/lib/images.ts`; `tests/Feature/Import/ImportControllerTest.php`, testes frontend images/image-field.
- **Certeza/lacunas:** C/T; limites reais de upload/memória/Cloud não aferidos. Screenshots não são persistidas pela aplicação; uploads temporários PHP não foram auditados. Não há captura de câmera, OCR próprio ou import de planilha/API de casa demonstrados. Mobile deve preservar ordem/legibilidade e estado de envio, sem guardar screenshots em cache.

### IMP-02: extração estruturada e provedor

- **Ator/precondições:** U submete fonte; IA é fronteira não confiável.
- **Fluxo:** Laravel AI SDK/OpenAI, agent timeout 60s, schema `{bets:[...]}` com selections obrigatórias; um registro por bilhete, stake/retorno no bilhete, odds total somente se impressa. Sem campo BetType no schema. Ler fatos, null para ausência, nunca calcular P&L pela IA. AnswerPayload tenta texto SDK e blocos raw, reconhece refusal.
- **Evidências:** `Import/Agents/BetImportAgent.php`, `Parsing/BetSlipParser.php`, `AnswerPayload.php`, `config/ai.php`; `tests/Unit/Import/BetImportAgentTest.php`, `tests/Feature/Import/AnswerPayloadTest.php`, `BetSlipParserTest.php`.
- **Certeza/lacunas:** C/T com fake; nenhum round trip real executado. OPENAI_API_KEY server-side; OPENAI_TEXT_MODEL/OPENAI_URL opcionais; store=false na configuração não comprova toda política de retenção do provedor. Sem fila/worker/webhook; chamada síncrona HTTP. Rede obrigatória, não reenviar silenciosamente.

### IMP-03: normalização determinística

- **Ator/precondições:** saída IA não confiável; processamento servidor.
- **Fluxo:** converter decimais PT/EN, datas ISO/numéricas/escritas, status sinônimos; ausente → open, desconhecido não é adivinhado. Ano ausente usa ano atual, sem data permanece null. Referência <6 caracteres é descartada. Mapas/parâmetros normalizados antes do fingerprint. Até 200 bilhetes/envelope e 30 seleções por bilhete; valida cada entrada independentemente, rejeições com posição/campos.
- **Evidências:** `Parsing/AnswerNormalizer.php`, `Selections.php`, `ParsedBet.php`, `ParsedSelection.php`, `BetSlipParser.php`; `tests/Unit/Import/AnswerNormalizerTest.php`, `tests/Feature/Import/RealBookmakerPasteTest.php`.
- **Certeza/lacunas:** C/T. Q03 cobre ano/fuso e Q08 o limiar de referência, não validado para toda casa. DecimalInput remove caracteres e aceita entrada numérica, não só strings (D04). Não inventar date/selection para confirmar. Preview mobile é limite de correção humana, não prova de exatidão da IA.

### IMP-04: regras específicas por casa

- **Ator/precondições:** casa identificada na leitura; guidance master confiável e não editável pelo usuário hoje.
- **Fluxo:** generic por padrão; BetBoom remove marcador terminal do esporte; Superbet usa ganho potencial/open com precedência sobre oferta de cashout, Sacado/cashout, prêmio/won, reembolso/void, ausência de marcadores/lost e ao vivo/hoje; Pinnacle prioriza data após @ e soma risco ao lucro de settlement para obter retorno total. Guidance semeada complementa extração; regras determinísticas corrigem saída.
- **Evidências:** `Parsing/BookmakerImportRules.php`, `GenericBookmakerImportRule.php`, `BetBoomImportRule.php`, `SuperbetImportRule.php`, `PinnacleImportRule.php`, `database/seeders/BookmakerSeeder.php`; testes unitários BetBoom/Pinnacle e `RealBookmakerPasteTest.php`.
- **Certeza/lacunas:** C/T para formatos fictícios testados. BetBoom tem adapter, mas não está nos 8 defaults do seeder. Não alegar conector/API com qualquer casa. Q03/Q08: suposições por casa precisam aceite e regressões, não aplicação universal.

### IMP-05: preview e correção por entrada

- **Ator/precondições:** U proprietário do batch/draft.
- **Fluxo:** GET `/imports/{batch}`, PATCH `/import-drafts/{draft}`; incluir/pular, corrigir status, odds/stake/retorno, tipo pessoal, datas e seleções. Backend aceita ainda labels/IDs/parâmetros que a UI atual não expõe igualmente. Card mostra transcrição original, labels da resolução e badge de ambiguidade; o componente não oferece seletor explícito das alternativas nem usa isNew para explicar criação. Edits usam blur e escolhas que salvam imediatamente.
- **Dados/estados:** proposal/resolution JSONB, posição, decision include/skip, duplicateOfBetId/createdBetId. Datas/seleções podem ficar vazias em skipped; included exige completude. Nenhuma aposta deve existir apenas por exibir o preview.
- **Evidências:** `ImportDraftController.php`, `ImportDraftRequest.php`, `ImportPresenter.php`, `Models/ImportDraft.php`, `components/betting/import-draft-{card,leg,decision}.tsx`; `tests/Feature/Import/ImportControllerTest.php`.
- **Certeza/lacunas:** C/T parcial. D08: correção não recalcula resolution/fingerprint/duplicate no controller; batch confirmado não é verificado ao editar draft. UI não substitui backend. Não impor autosave como decisão nova; confirmar UX de salvamento em Q11 para evitar perda de correção em rede móvel.

### IMP-06: escolher casa após leitura e reler

- **Ator/precondições:** U proprietário, batch não confirmado, conta própria.
- **Fluxo:** PATCH `/imports/{batch}` reatribui conta/moeda/fingerprint/dedup sem chamar IA; parsed_bookmaker_id distingue casa de leitura da escolhida. Se leitura foi genérica e casa tem regras, exibir aviso. POST `/imports/{batch}/reread` só com texto retido, substitui drafts e custa nova chamada. Screenshot-only não pode reler sem reenviar imagens.
- **Evidências:** `ImportController::update/reread`, `Actions/AssignBookmakerAccount.php`, `DraftBuilder::reassign`, `ImportPresenter::readWithoutHouseRules`, `components/betting/import-bookmaker.tsx`; testes de assign/reread em ImportControllerTest.
- **Certeza/lacunas:** C/T. Releitura pode substituir correções e falha pode deixar drafts prévios; definir atomicidade/estado em Q09 antes de P12. Mobile deve explicar o custo/perda potencial e não reler ao trocar um campo silenciosamente.

### IMP-07: deduplicar e confirmar transacionalmente

- **Ator/precondições:** U, conta definida, included sem lacunas de data/seleção/preço.
- **Fluxo:** referência externa + conta primeiro; fallback hash de conta/data total/odds/stake e segmentos ordenados de evento/mercado/seleção/parâmetros. Duplicado no batch vira skip; existente no diário é sinalizado e excluído. POST `/imports/{batch}/confirm` promove candidatos privados e cria bets/legs em transação; repetir batch confirmado retorna bets já criadas na action, sem novo efeito.
- **Evidências:** `Bets/BetFingerprint.php`, `Import/Actions/DraftBuilder.php`, `ConfirmImportBatch.php`, `CatalogPromotion.php`, `Models/ImportBatch.php`, migration bets (índice único parcial por conta/ref); testes `BetImportTest.php`, `ImportControllerTest.php`, `tests/Unit/Betting/Bets/BetDataTest.php`.
- **Certeza/lacunas:** C/T sequencial. Hash não tem unique constraint, nem substitui idempotência de operação. Não há prova de concorrência/revalidação após correção/entre batches. Q08/Q09 definem colisão legítima e fronteira de confirmação; snapshot de moeda diverge (D09). Não criar unicidade global de fingerprint sem decisão, pois bilhetes distintos podem ser iguais.

### IMP-08: falha, retenção e diagnóstico

- **Ator/precondições:** U lê falha do próprio batch; O diagnostica por canal protegido.
- **Fluxo:** pending → ready/failed; confirmado tem confirmed_at/status confirmed. Falha provider/unreadable/empty/refused usa chave estável traduzida; rejeição parcial preserva entradas legíveis. failure_excerpt limitado a 2000 caracteres existe no DB, não no presenter. Confirmação limpa batch source_text/failure_excerpt; source_text por aposta permanece. Screenshots não têm store da aplicação.
- **Evidências:** `ImportFailed.php`, `ImportStatus.php`, `Actions/ParseImportBatch.php`, `ConfirmImportBatch.php`, `Parsing/AnswerPayload.php`, `Http/Support/ImportPresenter.php`; `tests/Feature/Import/ImportFailureTest.php`, `AnswerPayloadTest.php`, `ImportControllerTest.php`.
- **Certeza/lacunas:** C/T. Batch abandonado/falho e proposal JSON podem reter texto indefinidamente; sem limpeza agendada encontrada. Config ausente desabilita UI, mas POST direto não é recusado antes do parser no controller. Sem status-ready guard explícito na confirmação; não concluir que UI bloqueada equivale a contrato seguro. Retenção/estado é Q09; não executar limpeza agora.

## Ativação e apresentação transversal

### ONB-01: onboarding opcional de primeira visita

- **Ator/precondições:** U com onboarding_completed_at nulo; guard somente GET bets/dashboard.
- **Fluxo observado:** GET `/onboarding` grava completed_at imediatamente, mostra quatro passos client-side: casas, história, open bets, saldo. POST `/onboarding/complete` também grava e redireciona a bets. Pode pular. Passos usam os mesmos writes do produto; contas escolhidas existem imediatamente, reabrir depois do primeiro GET redireciona. Lista open limitada a 100 e inclui status open sem filtrar historical/tracked.
- **Evidências:** `OnboardingController.php`, `Middleware/RequireOnboarding.php`, `pages/onboarding/index.tsx`; `tests/Feature/Betting/PreferencesTest.php`, `tests/Feature/DashboardTest.php`.
- **Certeza/lacunas:** C/T. Não é fluxo persistido/reentrante prometido em trechos documentais; importar sai da tela e já marca visto. Q12 define visto/concluído/retomada e qual exposição revisar antes da reconciliação. Sem obrigação de desenhar wizard igual. Mobile precisa permitir saída e preservar dados já enviados, sem depender de IA para entrar no produto.

### PUB-01: entrada pública e caminhos de navegação

- **Ator/precondições:** V/U acessa raiz; U tem acessos às tarefas e configurações secundárias.
- **Fluxo:** GET `/` renderiza welcome com acesso ao login; auth destino bets; header é composição ativa, sidebar é alternativa não usada. `/settings` redireciona profile; `/up` é health técnico. Não é site de odds, recomendação de aposta ou operação de casa.
- **Evidências:** `routes/web.php`, `routes/settings.php`, `resources/js/pages/welcome.tsx`, `layouts/app-layout.tsx`, `components/app-header.tsx`, `tests/e2e/landing.spec.ts`, `health.spec.ts`.
- **Certeza/lacunas:** C/T. Recriar acesso e orientação de tarefa, não páginas/abas/layout da fonte. PWA novo já tem página técnica, que só deve ser substituída após UI aprovada. Sem marketing, feed público ou busca de apostas de terceiros demonstrados.

### UX-01: contratos de interação compartilhados

- **Ator/precondições:** V/U usa formulários/listas.
- **Fluxo:** noValidate, validação servidor, erro por campo, toast flash; modal para exclusão; processing desabilita ações; estados vazio/erro/carregamento; valores/labels de mercado localizados para exibição sem reescrever persistência. Desktop e mobile compartilham contratos e podem ter composições distintas.
- **Evidências:** `components/form/`, `components/betting/confirm-action.tsx`, `hooks/use-flash-toast.ts`, `lib/errors.ts`, `lib/betting/labels.ts`, `eslint.config.js`, testes frontend components/lib e journal E2E.
- **Certeza/lacunas:** C/T parcial; não há garantia de cobertura de todos os erros/focos/rede. Auth/profile/security têm literais inglês, diferentemente de boa parte do domínio. Novo projeto já proíbe diálogos nativos e exige idiomas/temas, sem adotar shadcn ou paleta antiga automaticamente.

### DAT-01: defaults e provisionamento operacional

- **Ator/precondições:** O usa alvo local/operacional identificado, nunca bootstrap de dados reais nesta análise.
- **Fluxo observado:** DatabaseSeeder chama BookmakerSeeder idempotente de 8 casas globais e guidance; DemoUserSeeder somente fora de production. Não semeia apostas, saldos, tipos ou catálogo esportivo. Sem UI/endpoint para provisionar usuários; docs descrevem criação explícita e marcação de e-mail verificado.
- **Evidências:** `database/seeders/DatabaseSeeder.php`, `BookmakerSeeder.php`, `docs/product/onboarding.md`, `tests/Feature/Seeders/DatabaseSeederTest.php`.
- **Certeza/lacunas:** C/T para seed, D para processo produtivo. Guidance é sobrescrita ao rodar seeder, não é painel operacional editável. Novo projeto não tem esses seeders; não copiar usuário/senha, dados reais ou executar seed produtivo para testar. O fluxo de provisionamento e recuperação real pertence ao checkpoint operacional.

## Contratos HTTP e de persistência

### Payloads e respostas observados

Rotas são contratos web/Inertia, não uma API pública independente. Em erros de formulário, Laravel retorna errors na sessão/redirecionamento ou 422 se JSON solicitado; não assumir um formato único para todo erro. Forbidden de ownership é 403; ID ausente pode ser 404 por route binding. Revalidar esses contratos em cada prompt.

| Área           | Campos de entrada relevantes                                                                                                                                                        | Resposta/dados de leitura                                                                                                                             |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bilhete        | bookmaker_account_id, bet_type_id?, status, bankroll_impact, odds?, stake, returned_amount?, external_reference? até 255, notes? até 2000, legs[1..30]                              | BetPresenter: eventDate, status, bankrollImpact, source, externalReference, odds string, Money em stake/retorno/P&L/unidade, units, conta/tipo e legs |
| Leg            | event_date Y-m-d, selection_label até 255, odds?, sport_id?, competition_label até 120, event_label até 160, market_label até 120, market_parameters? até 12 valores string até 120 | posição, data, seleção, parâmetros, odds nullable e entradas id/name do catálogo                                                                      |
| Movimentação   | conta própria, kind enum, amount decimal, occurred_at? date/timestamp, note? até 255                                                                                                | transactions paginadas: kind, amount, signedAmount, occurredAt ISO, conta/casa; options.accounts inclui saldos                                        |
| Reconciliação  | available_amount decimal não negativo, note? até 255; conta no path                                                                                                                 | redirect/flash; snapshot no DB, sem endpoint dedicado de histórico                                                                                    |
| Preferências   | base_currency enum, unit_value? decimal positivo                                                                                                                                    | preferences: baseCurrency, unitValue, currencies                                                                                                      |
| Casa           | bookmaker_id ou name; currency opcional; PATCH archived boolean                                                                                                                     | accounts com id/bookmakerId/name/currency/archived/balance; bookmakers disponíveis                                                                    |
| Tipo           | name, description?, position?, archived?                                                                                                                                            | betTypes por usuário, posição/nome                                                                                                                    |
| Import inicial | conta opcional, bankroll_impact obrigatório, source_text e/ou screenshots                                                                                                           | redirect para batch; aiConfigured em create é apenas presença de key                                                                                  |
| Draft          | decision, status, odds?, stake, returned_amount?, tipo próprio?, legs; included exige data/seleção                                                                                  | proposta/resolução, referências de duplicação e criação; correção monetária aceita vírgula                                                            |
| Batch          | PATCH conta própria; POST reread ou confirm sem payload funcional novo                                                                                                              | batch status/impact/failureReason/rejections/confirmed/casa/avisos/drafts; source_text batch e failure_excerpt não entram no presenter                |
| Dashboard      | period/span/from/to, bookmaker_account_ids até 50, bet_type_ids até 50, statuses até 10, sport_id?                                                                                  | filters, metrics, byBookmaker, byBetType, series, seriesTotal, options                                                                                |

Fontes dos limites: `app/Http/Requests/Betting/`; fontes dos props: `app/Http/Support/` e controllers. Estes nomes são ponto de partida verificável; alteração futura de contrato precisa de decisão/teste, não cópia automática dos componentes.

### Modelo efetivo, constraints e índices

A tabela final deve ser lida após toda a sequência de migrations, não só no create inicial:

| Conjunto                | Relações/constraints/índices relevantes                                                                                                                                                           | Evidência em database/migrations/                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Identidade              | e-mail único, reset tokens, sessões; passkeys credential_id único, user FK cascade                                                                                                                | `0001_01_01_000000_create_users_table.php`, `0001_01_01_000003_create_passkeys_table.php`                                                                    |
| Perfil de apostas       | moeda/unidade/completed_at no usuário                                                                                                                                                             | `2026_08_20_000001_add_betting_profile_to_users_table.php`                                                                                                   |
| Catálogo                | FKs de contexto opcionais, owner cascade; NULLS NOT DISTINCT nas chaves com owner; Event inclui scheduled_on na unicidade; aliases não têm FK polimórfica ao alvo                                 | `2026_08_20_000002_create_sports_table.php` até `2026_08_20_000007_create_catalog_aliases_table.php`                                                         |
| Casas/tipos             | bookmaker slug+owner; account user+bookmaker único; bet_type user+name único                                                                                                                      | migrations `000008_create_bookmakers_table.php`, `000009_create_bookmaker_accounts_table.php`, `000010_create_bet_types_table.php` sob prefixo `2026_08_20_` |
| Bets                    | conta/user cascade, tipo nullOnDelete, NUMERIC(20,8) financeiro, odds(16,8), realized_profit generated; índices user/event_date, conta/status, user/fingerprint; unique parcial conta/ref         | `2026_08_20_000011_create_bets_table.php`                                                                                                                    |
| Legs                    | toda referência esportiva/seleção sai de bets, FKs nullable, posição única no bilhete; odds nullable no estado final                                                                              | `2026_09_20_000002_create_bet_legs_table.php`, `2026_09_20_000003_allow_bet_legs_without_own_odds.php`                                                       |
| Ledger/checkpoint       | amount >0 para movements; índice conta/occurred_at; reconciliation guarda esperado/observado/exposição/diferença, índice conta/captured_at                                                        | `2026_08_20_000012_create_transactions_table.php`, `2026_08_20_000013_create_balance_reconciliations_table.php`                                              |
| Imports                 | batch owner/conta/status/mode/source, draft batch+position único, JSONB proposal/resolution/rejections, refs duplicado/criado nullOnDelete; parsed_bookmaker e failure_excerpt adicionados depois | migrations `2026_08_20_000014*` a `000017*`, `2026_09_06_000001_add_parsed_bookmaker_to_import_batches_table.php`                                            |
| Infra/limpeza histórica | cache/jobs existem sem jobs de negócio; limpeza de market name é alteração de dados com down vazio                                                                                                | `0001_01_01_000001_create_cache_table.php`, `0001_01_01_000002_create_jobs_table.php`; `2026_09_19_000001_clean_emptied_groups_from_market_type_names.php`   |

CHECKs de bets observados: stake>0, odds>=1, retorno>=0 ou null, unidade>0 ou null, equivalência open/retorno null e open/settled_at null. Não há CHECK para todos os status/sinais de lost/void alegados genericamente nos docs. Isso não autoriza remover as regras do domínio. Nenhum trigger, RLS, policy SQL ou bucket Supabase foi localizado nos artefatos da aplicação; ausência no Git não comprova ausência na instância real.

Não reproduzir migrations históricas de movimentação/limpeza de dados num banco novo. Criar migrations mínimas por consumidor e decidir se há migração de dados separadamente. Down das legs perde seleções além da primeira e down de odds nulas substitui por 1; não usar isso como restauração financeira.

## Integrações e diferenças de ambiente

| Fronteira                  | Fato inspecionado                                                                                                     | Limite e requisito futuro                                                                                                                                                                                                            |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Stack                      | locks da fonte: Laravel 13.26.1, Inertia Laravel 3.3.1, React 19.2.8, TS 5.9.3, Tailwind 4.3.3, Vite 8.2.1            | Novo Laravel 13.30.0 já aprovado/inicializado é mantido, sem downgrade ou atualização estrutural nesta fase                                                                                                                          |
| Dependências funcionais    | fonte contém Fortify 1.38.0, laravel/passkeys 0.2.1, laravel/ai 0.11.0, Wayfinder 0.1.21; npm @laravel/passkeys 0.2.0 | Ausentes no scaffold. Adicionar somente no prompt consumidor, com compatibilidade/lock/revisão; Wayfinder não é requisito funcional nem autorização para transplantar starter kit                                                    |
| Persistência               | fonte local inicia app+PG18.6, migrations/seeds em setup; Feature tests usam PostgreSQL e RefreshDatabase             | Novo PG é opcional, phpunit força host inválido. P01 deve criar isolamento de teste efêmero antes de qualquer teste persistente, mantendo unitários sem serviço externo                                                              |
| Sessão/cache/fila          | fonte local usa drivers configuráveis; docs produção declaram cookie/database/database                                | Novo cookie/array/sync. Alterar somente quando consumidor exigir. Cache, jobs tables e opções Redis/AWS de config não demonstram uso real                                                                                            |
| IA                         | `config/ai.php`, OPENAI_API_KEY, OPENAI_TEXT_MODEL, OPENAI_URL; síncrona e timeout 60                                 | Testes usam fake; nenhum teste desta análise chamou provedor. Credencial real e modelos só por canal seguro/aprovação operacional                                                                                                    |
| Mail                       | drivers em config/mail.php; MAIL_MAILER e MAIL_HOST/PORT/USERNAME/PASSWORD/FROM_ADDRESS/FROM_NAME conforme driver     | Docs declaram log em produção; entrega não aferida. Reset/verificação exigem validação real posterior, nunca mensagens reais em testes                                                                                               |
| Passkeys                   | PASSKEYS_USER_HANDLE_SECRET, APP_URL e APP_KEY server-side                                                            | RP/origin estáveis, HTTPS e recuperação precisam checkpoint. Não reaproveitar valor de secret de outro checkout                                                                                                                      |
| Cloud/Supabase/domínio     | `docs/architecture/deployment.md` declara Cloud oddiary/production, Supabase session pooler SSL e Data API desativada | Não autenticado nesta fase. DB_HOST/PORT/DATABASE/USERNAME/PASSWORD/SSLMode/DB_URL são nomes de configuração, nunca valores a copiar. Laravel usa PDO/Eloquent; não há Supabase Auth, Storage SDK ou PostgREST funcional demonstrado |
| Filas/agendamentos/storage | `routes/console.php` só inspire; migrations de jobs/cache; imagens viram anexos em Screenshots                        | Sem worker, cron de negócio, webhook ou bucket em uso demonstrado. Não criar infraestrutura por analogia                                                                                                                             |

Condições produtivas, backup e rollback são canônicos em `docs/operations.md` do novo projeto. Este inventário não transforma descrição antiga em configuração ativa. Não há dump, inspeção de dados de usuário ou segredo registrado aqui.

## Cobertura e limites da prova

Enumeração estática encontrou 17 arquivos Unit PHP, 36 Feature PHP, 1 Architecture PHP, 19 frontend `*.test.*` e 3 specs E2E, além do auth.setup. Não são contagens de casos executados. Nenhuma suíte da fonte foi rodada.

| Área                | Contratos encontrados                                                                                                                                         | Lacunas relevantes                                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identidade          | Authentication/Registration/PasswordReset/EmailVerification/VerificationNotification/PasswordConfirmation/TwoFactorChallenge; Settings ProfileUpdate/Security | E-mail não verificado em rotas de negócio, passkeys ponta a ponta, toda cascata de exclusão, entrega real de mail                                           |
| Dinheiro/apostas    | Money/Odds/DecimalInput/BetData/SettlementOutcome/BetStatus; BetController/BetLegs/MoneyCast                                                                  | overflow, odds enormes/abaixo de 1 no HTTP sem retorno, zeros alternativos, concorrência e toda transição pós-checkpoint                                    |
| Conta/tipo/catálogo | BankrollController/BettingOptions/BetTypeController; CatalogModel/Scope/Resolution; MarketSegment                                                             | IDs particulares forjados nos requests, aliases cruzando contexto/data, estado arquivado em writes                                                          |
| Banca               | AccountBalance/Calculator/BankrollWrites/DecimalInput                                                                                                         | captura concorrente, empate temporal, edição/apagamento de histórico, idempotência de envio de movimento                                                    |
| Dashboard           | MetricSet/DashboardFilters/DashboardQuery/DashboardTest; journal E2E                                                                                          | fuso de produto, intervalo invertido, parcela sem snapshot na série em unidades, volume representativo                                                      |
| Import              | parser/normalizer/AnswerPayload/RealBookmakerPaste/ImportController/BetImport/ImportFailure; unit rules                                                       | concorrência entre batches, correção versus hash/catálogo, mutação após confirmação, limites reais de upload, retenção de drafts abandonados, round trip IA |
| UI                  | testes de combobox/image-field/locale e lib; E2E diário, depósito, série, axe e landing/health                                                                | onboarding/import completo por browser, segurança avançada, rede oscilante, instalação física/PWA antiga                                                    |

Novo projeto: último CI de PR #1 aprovado em 16/10/2026; relatório anterior registra 4 PHP/29 frontend/2 smokes, não funcionalidades reconstruídas. Não ampliar essa cobertura declarada para o domínio inexistente.

## Divergências, impactos e decisões

Nenhum dos lados abaixo é eleito correto por precedência automática. São evidências para decidir o contrato futuro; correções não foram implementadas nesta fase.

| ID  | Documento e código confrontados                                                                                                                                                                                                                             | Impacto                                                                                                  | Tratamento/decisão pendente                                                                                        |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| D01 | onboarding.md exige verificação; routes declaram verified; `app/Models/User.php` não implementa MustVerifyEmail; `vendor/laravel/framework/src/Illuminate/Auth/Middleware/EnsureEmailIsVerified.php` só barra não verificados que implementam esse contrato | proteção documentada não ativada para esse modelo; testes de links não provam barreira de negócio        | Q01 antes de P01; especificar política e teste de não verificado, sem mudar código agora                           |
| D02 | money-and-precision/settings dizem BRL MVP; Currency enum, requests e preferences expõem BRL/USD                                                                                                                                                            | conta/moeda-base/snapshot/dashboard diferentes; sem FX                                                   | Q02 antes de P02/P03; preservar evidência, não limitar/ampliar silenciosamente                                     |
| D03 | money-and-precision afirma invariantes repetidos em CHECK; migration bets contém apenas parte                                                                                                                                                               | persistência por outra origem pode contornar lost/void/status                                            | regra futura deve ser revisada no P05, distinguindo domínio/constraint; não alegar proteção já existente           |
| D04 | docs prometem validação exata; DecimalInput descarta caracteres e aceita float; requests usam regex de 12 dígitos para odds (domínio aceita 8), min de string e not_in com poucas representações de zero                                                    | entrada indevida pode virar outro valor ou falhar tarde com exceção/constraint                           | P02/P05/P06/P11 precisam regressões; não declarar exploit executado nem mudar parser de forma incompatível sem Q06 |
| D05 | política de isolamento versus `BookmakerAccountRequest` exists sem owner; BetRequest sport_id e ImportDraftRequest IDs de catálogo também só exists                                                                                                         | possível referência a catálogo privado de outro usuário; happy paths e UI não garantem proteção          | autorização é requisito aprovado; especificar regressões negativas P03/P04/P12, sem resolver agora                 |
| D06 | ai-normalization descreve resolução por contexto/data/lookup; resolver implementa alias, slug e até 5 alternativas; alias não passa pelo query de contexto e evento não recebe data                                                                         | evento recorrente/alias pode ser identificado no contexto errado; sem lookup real                        | Q05 antes de P04; lookup externo/moderação adiados, sem inventar integração                                        |
| D07 | onboarding recomendado permite voltar; show grava completed_at no GET, retorno posterior redireciona; import sai do fluxo                                                                                                                                   | visto não significa concluído; retorno/import/reconciliação podem não ocorrer em sequência               | Q12 antes de P15, sem alterar semântica agora                                                                      |
| D08 | docs dizem preview corrigível e confirmação segura; draft controller mescla proposal sem recalcular hash/resolution/duplicado e sem checar batch confirmado                                                                                                 | estado exibido/persistido pode divergir; retentativa/concorrência não demonstradas                       | Q09/P12; propor contrato de fechamento e revalidação, não copiar bug como requisito                                |
| D09 | snapshot currency-aware no manual; ConfirmImportBatch usa somente unitValue.amount sem comparar moeda; mode UI tracked contra default historical no DB                                                                                                      | unidade em moeda errada; defaults distintos e histórico tracked pode duplicar efeitos atuais             | Q02/Q08; contratos explícitos P12/P14; sem conversão implícita                                                     |
| D10 | ledger ordena timestamp estritamente > checkpoint; TransactionDialog envia data sem hora; settled_at preservado em edição; correção de open não reescreve checkpoint                                                                                        | movimentos no mesmo dia podem cair antes do corte; correção histórica não tem efeito intuitivo garantido | Q03/Q07 antes de P06/P09; especificar casos temporais e comportamento aprovado                                     |
| D11 | README inclui saldos no dashboard; product/dashboard e página atual os colocam em transactions; options ainda carrega saldos                                                                                                                                | contrato de informação e custo de query não coincidem com README                                         | Q10 antes de P10, sem redesenhar tela agora                                                                        |
| D12 | ci-cd.md diz audits offline; comandos composer/npm audit consultam rede; docs de produção afirmam configuração/backups não acessíveis agora                                                                                                                 | falso sucesso ou falsa garantia operacional                                                              | novo REVIEW/operations prevalecem para engenharia; registrar limitações, não transplantar afirmação                |
| D13 | bets/settings prometem criação contextual; formulário bet só seleciona contas/tipos; recursos batch/cell/virtualização declarados futuros                                                                                                                   | ampliar escopo por ler desejo como capacidade existente                                                  | contextual adicional e recursos não implementados ficam adiados no roadmap, sujeitos a decisão                     |
| D14 | docs dizem imagens nunca em disco e limites 8MB; aplicação não persiste mas PHP recebe UploadedFile; php.ini local não fixa upload_max_filesize/post_max_size                                                                                               | retenção temporária e limite efetivo não comprovados                                                     | validar ambiente/privacidade no P13, não prometer ausência absoluta de disco                                       |
| D15 | docs precisão pedem não arredondar cedo; Odds::multipliedBy arredonda a escala 8 a cada produto                                                                                                                                                             | múltiplas com várias legs podem diferir de produto calculado com precisão intermediária maior            | Q06 antes de P05; comparar casos de fronteira e aceitar regra explicitamente                                       |

## Capacidades não demonstradas

Sem evidência de: cadastro público habilitado, papel admin no app, moderação de catálogo, lookup factual externo, API de casas, webhook, push, local-first/sync de domínio, import CSV/planilha, recomendações de apostas, FX, bônus/fundos bloqueados, transferências entre casas, batch actions/virtualização, breakdown esporte/competição/mercado ou PWA instalável na fonte. Não tratar nenhuma como regressão a reconstruir. Algumas são ideias documentadas; a matriz do roadmap as adia com justificativa.
