# PWA

O manifest está em `public/manifest.webmanifest`, o worker em `public/sw.js` e seu registro em `resources/js/pwa.ts`. Os ícones PNG provisórios têm 192 e 512 px, com variante maskable de 512 px e área segura central.

## Rede e atualização

O worker é registrado no build em HTTPS ou localhost. `make dev` usa HMR sem registrar worker; use perfil de navegador separado se houver uma inscrição ativa de um build. Para limpar uma inscrição local, use DevTools/Application e recarregue.

Navegações GET à raiz, sem query string, usam a rede. Uma falha de transporte recebe HTML estático 503 com `Cache-Control: no-store`. A primeira visita exige rede. Respostas HTTP, APIs, assets e dados de usuário não são persistidos pelo worker.

`updateViaCache: none` evita HTTP cache ao buscar atualizações do script. A ativação aguarda o fechamento das abas controladas pela versão vigente, sem forçar recarga. A URL `/sw.js` permanece estável, fora dos assets com hash.

## Validação

`make test-e2e` verifica manifest/ícones, controle do worker, isolamento de cache, fallback sem rede, instalabilidade Chromium por CDP e acessibilidade, em desktop/light e mobile/dark.

Antes de publicar, validar MIME/revalidação do worker, manifest atualizado, escopo raiz, instalação manual e modo standalone Android/iOS, safe-area dos ícones e atualização entre versões em HTTPS real. `beforeinstallprompt` não substitui essas verificações.

## Decisões local-first

Antes de implementar persistência e sincronização, definir:

- Dados permitidos por usuário/dispositivo, retenção, logout, exclusão e proteção em dispositivos compartilhados.
- Tecnologia de storage, versionamento, quotas, migração e recuperação após falha parcial.
- Contratos de sincronização, identificadores, versões, idempotência e autoridade de cada campo/regra.
- Resolução explícita de conflitos, especialmente em dados de integridade crítica.
- Reconexão, retries com backoff, timeout, cancelamento, deduplicação, ordenação e confirmação pelo servidor.
- Testes de rede intermitente, concorrência, múltiplas abas, expiração de sessão e falhas de storage.

Persistência local e transporte devem ficar isolados da lógica de domínio. Push e cache complexo exigem requisitos e revisão próprios.
