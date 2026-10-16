export async function registerWorker(): Promise<
  ServiceWorkerRegistration | undefined
> {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    return undefined;
  }

  return navigator.serviceWorker.register('/sw.js', {
    scope: '/',
    updateViaCache: 'none',
  });
}
