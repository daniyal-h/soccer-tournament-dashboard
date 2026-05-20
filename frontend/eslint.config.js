import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['src/**/*.{ts,tsx}'],

    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    plugins: {
      'simple-import-sort': simpleImportSort,
    },

    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^react$', '^@?\\w'],
            ['^@/components'],
            ['^@/context'],
            ['^@/hooks'],
            ['^@/api'],
            ['^@/types'],
            ['^@/constants'],
            ['^@/lib'],
            ['^\\.'],
          ],
        },
      ],

      'simple-import-sort/exports': 'error',
      'react-refresh/only-export-components': 'off',
    },

    languageOptions: {
      globals: globals.browser,
    },
  },
]);
