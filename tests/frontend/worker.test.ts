import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => vi.unstubAllGlobals());

async function worker(fetch = vi.fn()) {
  vi.resetModules();
  const listeners = new Map<string, (event: unknown) => void>();
  vi.stubGlobal('self', {
    location: { origin: 'https://example.test' },
    addEventListener: (type: string, handler: (event: unknown) => void) =>
      listeners.set(type, handler),
  });
  vi.stubGlobal('fetch', fetch);
  await import('../../public/sw.js');
  return { listeners, fetch };
}

it.each([
  ['GET', 'cors', '/api/private'],
  ['POST', 'navigate', '/'],
  ['GET', 'navigate', '/account'],
  ['GET', 'navigate', '/?token=private'],
  ['GET', 'navigate', 'https://other.test/'],
  ['GET', 'no-cors', '/build/assets/app.js'],
])('leaves %s %s %s untouched', async (method, mode, path) => {
  const { listeners, fetch } = await worker();
  const respondWith = vi.fn();
  listeners.get('fetch')?.({
    request: {
      method,
      mode,
      url: new URL(path, 'https://example.test').href,
    },
    respondWith,
  });
  expect(respondWith).not.toHaveBeenCalled();
  expect(fetch).not.toHaveBeenCalled();
});

it('returns the network response without persisting it', async () => {
  const response = new Response('private', {
    headers: { 'Cache-Control': 'no-store' },
  });
  const { listeners } = await worker(vi.fn().mockResolvedValue(response));
  const respondWith = vi.fn();
  listeners.get('fetch')?.({
    request: {
      method: 'GET',
      mode: 'navigate',
      url: 'https://example.test/',
    },
    respondWith,
  });
  expect(await respondWith.mock.calls[0][0]).toBe(response);
});

it('returns only a static unavailable message on network failure', async () => {
  const { listeners } = await worker(
    vi.fn().mockRejectedValue(new TypeError('offline')),
  );
  const respondWith = vi.fn();
  listeners.get('fetch')?.({
    request: {
      method: 'GET',
      mode: 'navigate',
      url: 'https://example.test/',
    },
    respondWith,
  });
  const response = (await respondWith.mock.calls[0][0]) as Response;
  expect(response.status).toBe(503);
  expect(response.headers.get('cache-control')).toBe('no-store');
  expect(await response.text()).toContain('Sem conexão');
});
