import { defineConfig } from 'eslint/config'
import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'
import importPlugin from 'eslint-plugin-import-x'

export default defineConfig([
  { ignores: ['dist'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@stylistic': stylistic,
      import: importPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: false }],
      curly: ['error', 'all'],
      indent: ["error", 2],
      quotes: ['error', 'single', {
        avoidEscape: true,
        allowTemplateLiterals: true,
      }],
      'import/order': ['error', {
        pathGroups: [
          {
            pattern: '@/**',
            group: 'parent',
            position: 'before',
          },
        ],
        groups: [
          'builtin',
          'external',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      }],
    },
  },
])
