import { defineConfig } from 'eslint/config'
import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'
import importPlugin from 'eslint-plugin-import-x'

function sortKey(spec) {
  return spec.imported.type === 'Identifier'
    ? spec.imported.name
    : spec.imported.value
}

function findBraces(sourceCode, node) {
  const tokens = sourceCode.getTokens(node)
  let depth = 0
  let openBrace = null
  let closeBrace = null
  for (const token of tokens) {
    if (token.type === 'Punctuator' && token.value === '{') {
      if (depth === 0) openBrace = token
      depth++
    } else if (token.type === 'Punctuator' && token.value === '}') {
      depth--
      if (depth === 0) {
        closeBrace = token
        break
      }
    }
  }
  return { openBrace, closeBrace }
}

function sortSpecifiers(fixer, node, specifiers, sourceCode) {
  const values = specifiers
    .filter((s) => s.importKind !== 'type')
    .sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
  const types = specifiers
    .filter((s) => s.importKind === 'type')
    .sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
  const sorted = [...values, ...types]

  const { openBrace, closeBrace } = findBraces(sourceCode, node)
  if (!openBrace || !closeBrace) return null

  const isMultiline = openBrace.loc.end.line !== closeBrace.loc.start.line
  const texts = sorted.map((s) => sourceCode.getText(s))

  let replacement
  if (isMultiline) {
    const baseIndent = ' '.repeat(openBrace.loc.start.column)
    const innerIndent = baseIndent + '  '
    replacement = `\n${innerIndent}${texts.join(`,\n${innerIndent}`)},\n${baseIndent}`
  } else {
    replacement = ` ${texts.join(', ')} `
  }

  return fixer.replaceTextRange(
    [openBrace.range[1], closeBrace.range[0]],
    replacement
  )
}

const importMemberMultiline = {
  meta: { type: 'layout', fixable: 'code' },
  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode()

    return {
      ImportDeclaration(node) {
        const specifiers = node.specifiers.filter(
          (s) => s.type === 'ImportSpecifier'
        )
        if (specifiers.length <= 2) return

        const firstBad = specifiers.find((spec, i) => {
          if (i === 0) return false
          return specifiers[i - 1].loc.end.line === spec.loc.start.line
        })

        if (!firstBad) return

        context.report({
          node: firstBad,
          message: 'Each import member must be on its own line when there are more than 2.',
          fix(fixer) {
            const texts = specifiers.map((s) => sourceCode.getText(s))
            const { openBrace, closeBrace } = findBraces(sourceCode, node)
            if (!openBrace || !closeBrace) return null

            const baseIndent = ' '.repeat(openBrace.loc.start.column)
            const innerIndent = baseIndent + '  '
            const replacement = `\n${innerIndent}${texts.join(`,\n${innerIndent}`)},\n${baseIndent}`

            return fixer.replaceTextRange(
              [openBrace.range[1], closeBrace.range[0]],
              replacement
            )
          },
        })
      },
    }
  },
}

const typeImportsLast = {
  meta: { type: 'problem', fixable: 'code' },
  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode()

    return {
      ImportDeclaration(node) {
        const specifiers = node.specifiers.filter(
          (s) => s.type === 'ImportSpecifier'
        )
        if (specifiers.length < 2) return

        let foundValueAfterType = false
        for (let i = specifiers.length - 1; i >= 0; i--) {
          const spec = specifiers[i]
          if (spec.importKind !== 'type') {
            foundValueAfterType = true
          } else if (foundValueAfterType) {
            context.report({
              node: spec,
              message: 'Type imports must come after value imports.',
              fix(fixer) {
                return sortSpecifiers(fixer, node, specifiers, sourceCode)
              },
            })
          }
        }

        const values = specifiers.filter((s) => s.importKind !== 'type')
        const types = specifiers.filter((s) => s.importKind === 'type')

        for (const group of [values, types]) {
          for (let i = 1; i < group.length; i++) {
            const prev = group[i - 1]
            const curr = group[i]
            if (sortKey(prev).localeCompare(sortKey(curr)) > 0) {
              context.report({
                node: curr,
                message: 'Import members must be sorted alphabetically.',
                fix(fixer) {
                  return sortSpecifiers(fixer, node, specifiers, sourceCode)
                },
              })
            }
          }
        }
      },
    }
  },
}

export default defineConfig([
  { ignores: ['dist'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
    settings: {
      react: {
        version: '19',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@stylistic': stylistic,
      import: importPlugin,
      custom: { rules: { 'type-imports-last': typeImportsLast, 'import-member-multiline': importMemberMultiline } },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@stylistic/array-bracket-newline': ['error', 'consistent'],
      '@stylistic/array-bracket-spacing': ['error', 'never'],
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/arrow-spacing': 'error',
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: false }],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/comma-spacing': 'error',
      '@stylistic/function-call-spacing': ["error", "never"],
      '@stylistic/indent': ["error", 2],
      '@stylistic/key-spacing': ['error', { beforeColon: false, afterColon: true }],
      '@stylistic/max-len': ['error', { 'code': 120, 'ignoreTemplateLiterals': true }],
      '@stylistic/multiline-ternary': ['error', 'always'],
      '@stylistic/no-multiple-empty-lines': ['error', { max: 1 }],
      '@stylistic/no-trailing-spaces': 'error',
      '@stylistic/object-curly-newline': ['error', {
        ObjectExpression: { consistent: true, minProperties: 3 },
        ObjectPattern: { consistent: true, minProperties: 3 },
        ImportDeclaration: { consistent: true, minProperties: 3 },
        ExportDeclaration: { consistent: true, minProperties: 3 },
      }],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: "always" }],
      '@stylistic/padding-line-between-statements': ['error', { blankLine: 'always', prev: '*', next: 'return' }],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/space-before-blocks': ['error', 'always'],
      '@stylistic/space-before-function-paren': ['error', { 'anonymous': 'never', 'named': 'never', 'asyncArrow': 'always' }],
      '@stylistic/space-infix-ops': 'error',
      curly: ['error', 'all'],
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
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
      'custom/import-member-multiline': 'error',
      'custom/type-imports-last': 'error',
    },
  },
])
