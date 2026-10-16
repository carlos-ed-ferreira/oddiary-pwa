import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/frontend/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['resources/js/pwa.ts', 'public/sw.js'],
      thresholds: { lines: 90, branches: 85, functions: 90, statements: 90 },
      reporter: ['text', 'json-summary', 'html'],
    },
  },
});
