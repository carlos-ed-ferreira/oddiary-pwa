import js from '@eslint/js';
import ts from 'typescript-eslint';
import globals from 'globals';
import imports from 'eslint-plugin-import';
import a11y from 'eslint-plugin-jsx-a11y';

export default ts.config(
  {
    ignores: [
      'vendor/**',
      'node_modules/**',
      'public/build/**',
      'storage/**',
      'bootstrap/cache/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      '.aws/**',
      '.codex/**',
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.serviceworker,
      },
    },
    plugins: { import: imports, 'jsx-a11y': a11y },
    settings: {
      'import/resolver': { typescript: true },
      'import/parsers': { '@typescript-eslint/parser': ['.ts', '.tsx'] },
    },
    rules: {
      ...a11y.configs.recommended.rules,
      complexity: ['error', 10],
      'max-lines': [
        'error',
        { max: 350, skipBlankLines: true, skipComments: true },
      ],
      'max-lines-per-function': [
        'error',
        { max: 50, skipBlankLines: true, skipComments: true },
      ],
      'import/no-cycle': 'error',
      'no-restricted-globals': ['error', 'alert', 'confirm', 'prompt'],
      'no-restricted-properties': [
        'error',
        { object: 'window', property: 'alert' },
        { object: 'window', property: 'confirm' },
        { object: 'window', property: 'prompt' },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'JSXOpeningElement[name.name=/^(form|Form)$/]:not(:has(JSXAttribute[name.name="noValidate"]))',
          message: 'Forms require noValidate and accessible field errors.',
        },
      ],
    },
  },
);
