# Plano de implementação

## Infraestrutura operacional

| Ordem | Entrega                                             | Critério de aceite                                                                                                                     |
| ----- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Validar remoto, autenticação e permissões           | Origin correto, acesso confirmado, branches e destino de push verificados                                                              |
| 2     | Configurar branches e PRs                           | Principal protegida, checks obrigatórios e revisão independente; PR comprova bloqueio sem aprovação/checks                             |
| 3     | Ativar GitHub Actions pelos comandos do Makefile    | Setup desde clone, caches por lock/runtime, lint, análise, tipos, cobertura, segurança, build e PWA passam                             |
| 4     | Implementar `make publish`                          | Pré-requisitos verificados; falhas locais impedem push; PR criada/atualizada sem duplicação ou deploy implícito                        |
| 5     | Configurar atualização de dependências e auto-merge | PRs com testes, auditorias e revisão independente; merge condicionado a todos os gates e aprovações                                    |
| 6     | Auditar e associar Laravel Cloud                    | Runtime, compute, Git/branch, gatilho, build/start, workers, scheduler, storage e logs verificados; deploy espera os gates             |
| 7     | Preparar Supabase e recuperação                     | Projeto, plano, região, PostgreSQL, pooler/TLS, limites, roles, extensions e Data API/RLS confirmados; backup com restauração validada |
| 8     | Definir schema e procedimento de banco              | Migrations testadas; eventual recriação tem ação exata, impacto, backup, recuperação e aprovação específica                            |
| 9     | Configurar ambiente de produção                     | Secrets no servidor, APP_KEY própria, debug falso, cookies seguros, SSL e storage persistente quando necessário                        |
| 10    | Configurar domínio, TLS e publicação                | Registros e recuperação documentados; certificado/redirecionamentos verificados; health, assets, PWA e logs validados após deploy      |
| 11    | Validar rollback                                    | Revisão anterior identificada; rollback de código e recuperação do banco tratados separadamente, com responsáveis e limites definidos  |

Recursos a verificar:

- GitHub: `https://github.com/carlos-ed-ferreira/oddiary-pwa.git`, configurado como origin local.
- Laravel Cloud: aplicação `oddiary`, ambiente `production`.
- Supabase: confirmar identificador do projeto e conectividade mediante acesso autorizado.
- Domínio: `oddiary.com.br`; confirmar ownership, provedor DNS, registros/TTL, DNSSEC e associação Cloud.

Configuração remota, proteção de branches, gatilhos de deploy e backups ainda precisam de verificação. Laravel Cloud usa runtime próprio; conferir versões e comandos no serviço. Operações em produção seguem a política de aprovação em AGENTS.md.

## Contrato de `make publish`

O alvo permanece indisponível até configurar o fluxo. Sua implementação deve:

1. Exigir árvore Git limpa, alterações commitadas, branch de trabalho diferente da principal, remoto aprovado e base explícita. Não adicionar arquivos ou gerar commits automaticamente.
2. Verificar autenticação, permissões, templates, políticas e checks obrigatórios.
3. Executar as verificações locais necessárias no mesmo commit que será enviado. Alteração de HEAD ou da árvore invalida o resultado.
4. Informar destino/commit, fazer push da branch e criar ou atualizar a PR dessa branch/base, descrevendo problema, comportamento, validação e riscos.
5. Reportar URL e checks pendentes. Auto-merge depende das políticas e aprovações válidas, sem bypass de gates.

## Produto

Após preparar a operação:

- Definir requisitos funcionais, contratos, modelo de dados e critérios de segurança.
- Aplicar a referência visual a cores, tipografia e componentes, organizando a experiência pelas tarefas mobile/desktop.
- Implementar fatias pequenas com TDD, autenticação/autorização e isolamento antes de dados de usuário, com migrations PostgreSQL testadas.
- Definir persistência local e sincronização conforme os requisitos e decisões de docs/pwa.md.
