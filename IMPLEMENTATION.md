# Pendências operacionais

## Em validação

- CI via PR piloto: workflow real, cache Docker/Composer/npm, gates pelo Makefile e smoke PWA. Registrar resultado remoto e duração antes de considerar funcional.
- Proteção de main: aplicar required check quality após observar o nome real, uma revisão independente, aprovação do último push, descarte de reviews obsoletas, resolução de conversas e enforcement de administradores. Verificar configuração por API.
- Publicação: testar `make publish` contra a PR piloto, tanto criação quanto atualização sem duplicação. Código não aprova nem faz merge.
- Dependabot: configuração semanal por ecossistema preparada; version updates exigem merge na principal. Habilitar alertas/atualizações de segurança e verificar suporte efetivo.

## Bloqueios e dependências

1. Revisão independente: somente carlos-ed-ferreira tem escrita hoje. Uma segunda conta com escrita precisa revisar a PR; não fazer autoaprovação ou bypass para concluir o piloto.
2. Laravel Cloud: acesso autenticado necessário para identificar aplicação/ambiente e preparar checkpoint concreto de troca de origem, build, variáveis e deploy. Não há cutover autorizado.
3. Supabase: conexão/plugin/token e projeto confirmado necessários para inventário read-only e verificação SQL. Reset não é necessário para o scaffold e não será executado sem necessidade, alvo, recuperação e aprovação específicos.
4. Produção: validar configuração, backups e rollback antes de aprovação. DNS/TLS e o 403 observado estão documentados em docs/operations.md; saúde e PWA HTTPS não estão comprovados.

Os procedimentos, recursos e pré-requisitos de cutover estão em [docs/operations.md](docs/operations.md). Esse é o assunto canônico de operação; critérios de CI/revisão ficam em REVIEW.md.

## Depois da infraestrutura

Definir requisitos funcionais, contratos, dados, segurança e identidade visual. Implementar fatias pequenas com TDD, isolamento/autorização e migrations PostgreSQL testadas. Persistência e sincronização seguem as decisões de docs/pwa.md. Não antecipar funcionalidades antes do aceite operacional.
