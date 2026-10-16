import inertia from '@inertiajs/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const port = Number(
    loadEnv(mode, process.cwd(), 'VITE_PORT').VITE_PORT || 5180,
  );

  return {
    server: {
      host: '0.0.0.0',
      port,
      strictPort: true,
      hmr: { host: 'localhost', port },
    },
    plugins: [
      laravel({
        input: ['resources/css/app.css', 'resources/js/app.tsx'],
        refresh: true,
      }),
      inertia(),
      react(),
      tailwindcss(),
    ],
  };
});
