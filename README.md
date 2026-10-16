# Oddiary PWA

Aplicação PWA com Laravel, Inertia e React.

Ambiente local: <http://localhost:8010>. Setup, testes e build usam Docker e Make.

## Stack

Versões efetivas dos locks e do runtime:

| Componente                                         | Versão                                    |
| -------------------------------------------------- | ----------------------------------------- |
| PHP / Composer                                     | 8.4.24 / 2.10.2                           |
| Node / npm                                         | 24.19.0 / 11.17.0                         |
| PostgreSQL local opcional                          | 18.6                                      |
| Laravel / Inertia Laravel                          | 13.30.0 / 3.3.1                           |
| React / React DOM / Inertia React e Vite           | 19.2.8 / 19.2.8 / 3.7.0                   |
| TypeScript / Tailwind / Vite / Laravel Vite plugin | 5.9.3 / 4.3.3 / 8.2.1 / 3.2.0             |
| Pest / plugin Laravel / PHPUnit                    | 5.1.1 / 5.0.1 / 13.3.0                    |
| Larastan / PHPStan / Pint / PHPMD / Deptrac        | 3.10.0 / 2.2.8 / 1.30.5 / 2.15.0 / 4.7.1  |
| Vitest / ESLint / Prettier / Playwright / axe      | 4.1.11 / 9.39.5 / 3.9.6 / 1.62.1 / 4.13.0 |

Os locks fixam a instalação. Constraints Composer de produção seguem SemVer dentro das majors instaladas. Dependências são adicionadas somente quando houver uso concreto.

## Setup desde clone

Requisitos de host: Git, GNU Make e Docker com Compose/BuildKit, acesso ao daemon e aos registries de imagens, Composer/npm. Os runtimes de aplicação vivem no container; não use o PHP/Node do host como substituto das versões fixadas.

```sh
git clone https://github.com/carlos-ed-ferreira/oddiary-pwa.git
cd oddiary-pwa
make setup
```

`make setup` cria `.env`, builda o runtime, instala as dependências pelos locks, gera APP_KEY se ausente, compila assets e inicia a aplicação. Pode ser repetido sem trocar a chave ou apagar volumes. Não executa migrations ou seeds.

Aplicação técnica em <http://localhost:8010>; manifest em `/manifest.webmanifest`, worker em `/sw.js` e health Laravel em `/up`. Compose se chama `oddiary-pwa`, com volumes próprios. Somente localhost é publicado. PostgreSQL não inicia no setup e não tem porta publicada.

`make database-up` inicia PostgreSQL 18.6 opcional no perfil `database`, acessível a app como `postgres:5432`. Usa exclusivamente o volume local `oddiary-pwa_postgres-data`. Não contém schema de produto, migrations ou dados de produto. A inicialização e os testes atuais não precisam desse serviço. Quando surgir SQL, introduza testes de integração PostgreSQL com banco separado e nunca substitua sem avaliar semântica por SQLite.

## VS Code

Instale as recomendações de `.vscode/extensions.json` após `make setup`. Prettier/ESLint usam as dependências locais e o TypeScript usa `node_modules/typescript/lib`. PHP usa Pint no container `oddiary-pwa-app-1`, que deve estar iniciado por `make up`; se personalizar o nome do projeto Compose, ajuste essa configuração do editor. O Pint usa o preset Laravel padrão, como `make lint`, sem configuração adicional ou fallback global.

As extensões de Vitest/Playwright são auxiliares de edição e descoberta; a execução reproduzível dos testes e checks continua pelos comandos Make no Docker. Extensões não são instaladas automaticamente pelo repositório.

## Configuração local

`.env.example` é a referência executável. `.env` é ignorado e gerado localmente a partir desse exemplo.

| Grupo / nomes                                                                                    | Uso                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `APP_NAME`, `APP_ENV`, `APP_DEBUG`, `APP_URL`, `APP_KEY`                                         | Identificação, ambiente e chave local gerada. Produção exigirá debug falso, HTTPS e chave por canal seguro                                                              |
| `APP_PORT`, `VITE_PORT`                                                                          | App em 8010 por padrão; HMR em 5180. APP_URL deve acompanhar APP_PORT                                                                                                   |
| `APP_LOCALE`, `APP_FALLBACK_LOCALE`                                                              | Locale Laravel pt_BR e fallback en                                                                                                                                      |
| `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `DB_SSLMODE` | PostgreSQL local opcional; defaults locais são públicos e exclusivos do desenvolvimento. Default do config exige TLS, `.env.example` usa prefer apenas no serviço local |
| `SESSION_DRIVER`, `SESSION_ENCRYPT`, `SESSION_SECURE_COOKIE`                                     | Cookie criptografado; local HTTP permite secure falso; HTTPS produção exigirá secure verdadeiro                                                                         |
| `CACHE_STORE`, `QUEUE_CONNECTION`, `FILESYSTEM_DISK`, `MAIL_MAILER`                              | Array, sync, local e log. Sem worker, cron ou e-mail transacional; rotas de arquivos e DevTools desativados                                                             |
| `LOG_CHANNEL`, `LOG_LEVEL`                                                                       | Stderr local; não logar secrets ou dados pessoais                                                                                                                       |
| `VITE_APP_NAME`                                                                                  | Nome público. Qualquer VITE_* é público, nunca segredo                                                                                                                  |
| `HOST_UID`, `HOST_GID`                                                                           | Exportados pelo Make para permissões do bind mount                                                                                                                      |

`DB_URL` e `APP_PREVIOUS_KEYS` são opções server-side do config, omitidas dos defaults locais. Nunca use DB_URL remoto para testes. `phpunit.xml` força hostname inválido e cache/session em memória para detectar dependência inesperada de banco. A chave fixa composta por zeros em phpunit.xml é exclusivamente de teste e nunca serve como configuração de runtime.

## Comandos

```sh
make                    # lista comandos
make setup              # prepara e inicia o ambiente local
make up                 # app com healthcheck
make dev                # Vite HMR, após setup
make shell              # shell no runtime
make down               # encerra este Compose, sem apagar volumes
make database-up        # banco local opcional, sem migrations
make assets             # build Vite
make test-backend ARGS=tests/Feature/BootstrapTest.php
make test-frontend ARGS=tests/frontend/worker.test.ts
make check              # lint, análise, tipos e suites pequenas
make coverage           # PCOV backend + V8 frontend
make test-e2e           # assets atuais + Chromium desktop/mobile
make security           # audits online e gitleaks local redigido
make docker-check       # Compose, BuildKit e readiness
make quality            # gate aprofundado local
make publish            # valida, envia a branch e abre/atualiza a PR
```

`vite.config.ts` lê VITE_PORT da configuração local e mantém porta/HMR alinhados ao Compose. `make test-e2e` usa Chromium da imagem oficial, sem download de browsers por install script. Instalação npm usa `npm ci` e scripts de dependências desativados. Testes PHP usam `withoutVite`; build não é pré-condição da suíte backend.

## Estrutura e fontes canônicas

- `app/Http`, `bootstrap`, `config`, `routes`: HTTP Laravel/Inertia.
- `resources`: template técnico, entrada React e CSS neutro.
- `public`: manifest, worker e ícones temporários.
- `tests`: smoke PHP, unidade PWA e smoke Playwright/axe.
- `docker`, `compose.yaml`, `Makefile`: runtime e comandos locais.
- [AGENTS.md](AGENTS.md): regras permanentes para agentes e implementação futura.
- [REVIEW.md](REVIEW.md): critérios, métricas, três níveis, bloqueios e Definition of Done.
- [IMPLEMENTATION.md](IMPLEMENTATION.md): prioridades operacionais e contrato de publish.
- [docs/pwa.md](docs/pwa.md): limites da PWA e decisões local-first pendentes.

## Publicação por PR

Requisitos adicionais: GitHub CLI (`gh auth login`), Git e Docker disponíveis no host; acesso de escrita ao origin deste projeto. Use uma branch de trabalho, com alterações commitadas e árvore limpa:

```sh
git switch -c chore/minha-alteracao
make check
git add <arquivos-da-alteracao>
git commit -m "Descreva a alteração"
make publish
```

`make publish` confere fetch/push do origin, conta/permissões, base main e atualização em relação a origin/main. Valida o commit antes do push e interrompe se HEAD/árvore mudarem. Usa `make quality` enquanto não houver CI verde no HEAD atual de main e proteção comprovada; depois usa `make check` local e deixa os gates aprofundados para o CI. Publica somente a branch de trabalho e abre ou atualiza uma PR, preservando a descrição existente por padrão.

Para fornecer título e corpo explícitos: `PR_TITLE="Título" PR_BODY_FILE=/caminho/descricao.md make publish`. O arquivo deve conter texto revisável, sem credenciais. A PR informa checks pendentes; o comando não aprova, faz merge, força push ou dispara deploy.

O workflow CI executa `make quality` em PRs para main e pushes à principal, com permissão de leitura, imagens fixadas e caches de runtime/arquivos baixados de Composer/npm. Não usa banco de produção. O teste técnico de navegador também pode usar `PLAYWRIGHT_BASE_URL` para validar um deploy autorizado.

O processo de revisão e os gates estão em [REVIEW.md](REVIEW.md). Infraestrutura e procedimentos de produção estão em [docs/operations.md](docs/operations.md); pendências ficam em [IMPLEMENTATION.md](IMPLEMENTATION.md).
