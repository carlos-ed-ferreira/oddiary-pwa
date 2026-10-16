import { createInertiaApp } from '@inertiajs/react';
import { registerWorker } from './pwa';

void createInertiaApp({ strictMode: true });

if (import.meta.env.PROD) {
  void registerWorker().catch(console.error);
}
