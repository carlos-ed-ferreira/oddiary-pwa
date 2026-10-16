# Operação e produção

## Estado e diagnóstico

GitHub verificado por API: `carlos-ed-ferreira/oddiary-pwa` é público, default branch main, conta atual com administração. Inicialmente não havia CI/proteção; a configuração operacional está sendo validada por PR. Somente a conta carlos-ed-ferreira aparece como colaboradora, portanto a revisão independente precisa de outra conta com escrita. Configurações de editor e ambiente que não pertencem à tarefa ficam fora dos commits.

Laravel Cloud: destino informado é aplicação `oddiary`, ambiente `production`. IDs de aplicação/ambiente, repositório/branch, runtime, comandos, workers, scheduler, storage e deploys precisam de consulta autenticada. Não há acesso CLI/token disponível nesta sessão. A documentação descreve PHP 8.4/Node 24, região us-east-1 e deploy por push; estes detalhes não estão confirmados no serviço.

Supabase: projeto existente ainda sem identificador confirmado por API. Não há token/CLI conectado. Plano, região, versão PostgreSQL, session pooler, Data API/RLS, schemas, storage, funções e backups precisam de inventário autorizado. A aplicação técnica usa sessão cookie, cache array e fila sync; não exige acesso ao banco para iniciar. Não há migrations de negócio. Reset do banco não agrega benefício ao deploy técnico e fica para um checkpoint com necessidade concreta.

DNS/TLS observados: apex e www resolvem para 103.133.1.1; nameservers a.sec.dns.br/c.sec.dns.br. Certificado do apex válido até 18/12/2026. Consultas HTTP/HTTPS à raiz e /up retornaram 403 com servidor Cloudflare; isso não demonstra saúde da aplicação nem permite concluir indisponibilidade geral. HTTPS/www/redirecionamentos/PWA precisam de nova validação após acesso à plataforma e cutover autorizado.

## Acesso seguro

Laravel Cloud usa API token criado nas configurações da organização, com permissões e recursos limitados. Disponibilize LARAVEL_CLOUD_TOKEN somente em canal local seguro, sem valor no Git ou chat. Consulte o [CLI oficial](https://github.com/laravel/cloud-cli) e a [autenticação API](https://laravel.com/cloud/docs/api/authentication). Comece com leitura de aplicações, ambientes, deployments e domínio; não altere variáveis ou origem durante o diagnóstico.

Para Supabase, conecte o plugin correspondente ou forneça SUPABASE_ACCESS_TOKEN por canal local seguro com escopo de leitura. Banco usa credencial própria, que não deve ser extraída de outro checkout nem registrada. O [Management API](https://supabase.com/docs/reference/api/v1-list-all-projects) identifica projetos; confirme projeto/ref antes de consultar metadados. Uma conexão SQL pode verificar `SELECT current_database(), current_user, version()` em transação read-only, sem consultar dados de usuários. Compare o identificador do endpoint com o projeto confirmado.

## Pré-flight e cutover

Antes de qualquer alteração, registrar IDs concretos, configuração atual, revisão implantada, gatilho de deploy, nomes de variáveis e comandos. Confirmar backup recuperável e procedimento aplicável; não presumir backup do plano Supabase. A aprovação deve identificar recurso/ambiente, operações, impacto, recuperação e limites. Sem IDs verificados não há checkpoint executável.

Plano técnico preparado:

1. Main protegida, PR revisada e quality verde antes da origem ser associada ao Cloud.
2. Validar troca de repositório no mesmo serviço. Escolher push somente da main protegida ou deploy hook após CI. Hooks são secrets e podem fixar commit_hash; sua criação/configuração requer checkpoint de produção.
3. Build Cloud: `bash scripts/build-production.sh`, já disponível no código. O script instala locks sem dev PHP, compila Vite e cacheia configuração/views. Laravel Cloud fornece seu próprio runtime; validar PHP/Node antes da mudança. Deploy do scaffold não exige comando de migrations.
4. Propor configuração não secreta: APP_ENV=production, APP_DEBUG=false, APP_URL=https://oddiary.com.br, SESSION_DRIVER=cookie, SESSION_ENCRYPT=true, SESSION_SECURE_COOKIE=true, CACHE_STORE=array, QUEUE_CONNECTION=sync, LOG_CHANNEL=stderr, DB_SSLMODE=require. APP_KEY e dados de conexão ficam em secrets da plataforma. Aplicar somente após aprovação.
5. Preservar domínio/serviço/projeto Supabase. DNS só muda se houver necessidade confirmada e aprovação própria.
6. Após deploy, verificar /up, raiz no-store, assets, manifest, MIME/revalidação do worker, TLS e redirecionamentos. Com app local disponível, executar `docker compose --profile e2e run --rm -e PLAYWRIGHT_BASE_URL=https://oddiary.com.br playwright` para smoke técnico contra HTTPS. Instalação física Android/iOS permanece manual.

A [documentação de deployments](https://laravel.com/cloud/docs/deployments) descreve push-to-deploy e hooks. A configuração ativa precisa ser verificada; nenhum hook ou deploy está implementado por este documento.

## Banco, backup e rollback

Inventariar schemas e objetos via catálogos PostgreSQL, com transação read-only; verificar auth/storage/roles/extensões, sem extrair linhas de usuários. Não apagar schemas gerenciados do Supabase. Uma futura recriação deve listar exatamente os objetos afetados, preservar recursos gerenciados e exigir aprovação específica.

Backup com dados pessoais fica em armazenamento privado autorizado, criptografado e fora do Git/diretórios públicos. Registrar instante, escopo, versão de pg_dump, verificação do arquivo e teste de restauração em destino autorizado. Sem esse teste ou confirmação objetiva de recuperação, não prometer rollback de dados.

Rollback de código depende de revisão/deployment anterior conhecido e compatibilidade com configuração/schema. Não restaura dados. Para cutover sem alterações no banco, reverter origem/configuração e redeploy da revisão anterior é a proposta, a confirmar na plataforma antes de autorizar a troca. Reversão durante incidente deve seguir o checkpoint aprovado.
