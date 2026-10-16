import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('technical PWA lifecycle', async ({ page, context }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Oddiary PWA' }),
  ).toBeVisible();
  await page.evaluate(() =>
    navigator.serviceWorker.ready.then(() => undefined),
  );
  await page.reload();
  await expect
    .poll(() =>
      page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
    )
    .toBe(true);
  expect(await page.evaluate(() => caches.keys())).toEqual([]);
  expect((await page.request.get('/_inertia/devtools/entries')).status()).toBe(
    404,
  );
  const manifestResponse = await page.request.get('/manifest.webmanifest');
  expect(manifestResponse.ok()).toBe(true);
  const manifest = await manifestResponse.json();
  expect(manifest.display).toBe('standalone');
  for (const icon of manifest.icons) {
    const response = await page.request.get(icon.src);
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('image/png');
  }
  const client = await context.newCDPSession(page);
  const { installabilityErrors } = await client.send(
    'Page.getInstallabilityErrors',
  );
  expect(installabilityErrors).toEqual([]);
  const a11y = await new AxeBuilder({ page }).analyze();
  expect(
    a11y.violations.filter((v) =>
      ['serious', 'critical'].includes(v.impact ?? ''),
    ),
  ).toEqual([]);
  expect(errors).toEqual([]);
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Sem conexão / Offline' }),
  ).toBeVisible();
  expect(await page.evaluate(() => caches.keys())).toEqual([]);
});
