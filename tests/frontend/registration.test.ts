import { afterEach, expect, it, vi } from 'vitest';
import { registerWorker } from '../../resources/js/pwa';

afterEach(() => vi.unstubAllGlobals());

it('does nothing without service workers', async () => {
  vi.stubGlobal('navigator', {});
  vi.stubGlobal('window', { isSecureContext: true });
  expect(await registerWorker()).toBeUndefined();
});

it('does nothing outside secure contexts', async () => {
  const register = vi.fn();
  vi.stubGlobal('navigator', { serviceWorker: { register } });
  vi.stubGlobal('window', { isSecureContext: false });
  expect(await registerWorker()).toBeUndefined();
  expect(register).not.toHaveBeenCalled();
});

it('registers the root scope without HTTP caching for updates', async () => {
  const registration = { scope: '/' };
  const register = vi.fn().mockResolvedValue(registration);
  vi.stubGlobal('navigator', { serviceWorker: { register } });
  vi.stubGlobal('window', { isSecureContext: true });
  expect(await registerWorker()).toBe(registration);
  expect(register).toHaveBeenCalledWith('/sw.js', {
    scope: '/',
    updateViaCache: 'none',
  });
});

it('propagates registration failures', async () => {
  vi.stubGlobal('navigator', {
    serviceWorker: {
      register: vi.fn().mockRejectedValue(new Error('registration failed')),
    },
  });
  vi.stubGlobal('window', { isSecureContext: true });
  await expect(registerWorker()).rejects.toThrow('registration failed');
});
