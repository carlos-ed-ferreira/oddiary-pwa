# Pendências operacionais

## Configurado e verificado

- GitHub público `carlos-ed-ferreira/oddiary-pwa`, main principal. [PR piloto #1](https://github.com/carlos-ed-ferreira/oddiary-pwa/pull/1) criada por `make publish`.
- Proteção consultada por API: check quality vinculado ao GitHub Actions (app 15368), branch atualizada, uma aprovação independente, aprovação do último push, reviews obsoletas descartadas e conversas resolvidas. Administradores sujeitos às regras, force-push/deleção proibidos, histórico linear.
- Squash como única estratégia, branches removidas após merge, auto-merge habilitado como capacidade do repositório. PR bloqueada por REVIEW_REQUIRED; nenhum merge ou autoaprovação executado.
- Alertas de vulnerabilidade e atualizações de segurança habilitados por API, sem pausa. Dependabot semanal Composer/npm/Actions/Docker preparado; atualizações de versão aguardam merge na principal.
- `make quality` local passou: 4 testes PHP/17 asserções, 29 frontend e 2 smokes Chromium; auditorias sem vulnerabilidades e Gitleaks sem achados. Build sem dev PHP e caches Laravel executados em ambiente local isolado, sem migrations.

## Evidências de execução

- [Primeira execução CI](https://github.com/carlos-ed-ferreira/oddiary-pwa/actions/runs/38959071692): quality aprovado no GitHub em aproximadamente 4 min 35 s, incluindo build frio, locks, todos os gates e 2 smokes PWA. Os checks da PR identificam a execução do último commit.
- `make publish` criou a PR #1 após validação completa. Edição de metadados usa API REST, com regressão para a consulta descontinuada do gh pr edit; pushes atualizam a mesma branch/PR. O resultado remoto e a revisão do último commit devem ser consultados na PR antes de merge.

## Bloqueios e dependências

1. Revisão independente: somente carlos-ed-ferreira tem escrita hoje. Uma segunda conta com escrita precisa revisar a PR; não fazer autoaprovação ou bypass para concluir o piloto.
2. Laravel Cloud: acesso autenticado necessário para identificar aplicação/ambiente e preparar checkpoint concreto de troca de origem, build, variáveis e deploy. Não há cutover autorizado.
3. Supabase: conexão/plugin/token e projeto confirmado necessários para inventário read-only e verificação SQL. Reset não é necessário para o scaffold e não será executado sem necessidade, alvo, recuperação e aprovação específicos.
4. Produção: validar configuração, backups e rollback antes de aprovação. DNS/TLS e o 403 observado estão documentados em docs/operations.md; saúde e PWA HTTPS não estão comprovados.

Os procedimentos, recursos e pré-requisitos de cutover estão em [docs/operations.md](docs/operations.md). Esse é o assunto canônico de operação; critérios de CI/revisão ficam em REVIEW.md.

## Depois da infraestrutura

Definir requisitos funcionais, contratos, dados, segurança e identidade visual. Implementar fatias pequenas com TDD, isolamento/autorização e migrations PostgreSQL testadas. Persistência e sincronização seguem as decisões de docs/pwa.md. Não antecipar funcionalidades antes do aceite operacional.
