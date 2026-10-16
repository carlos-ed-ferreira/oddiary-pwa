self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (
    request.method !== 'GET' ||
    request.mode !== 'navigate' ||
    url.origin !== self.location.origin ||
    url.pathname !== '/' ||
    url.search !== ''
  ) {
    return;
  }

  event.respondWith(
    fetch(request).catch(
      () =>
        new Response(
          '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title><main><h1>Sem conexão / Offline</h1><p>Reconecte e recarregue. Reconnect and reload.</p></main></html>',
          {
            status: 503,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'no-store',
              'Content-Security-Policy':
                "default-src 'none'; frame-ancestors 'none'",
            },
          },
        ),
    ),
  );
});
