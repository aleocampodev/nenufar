// Flat config (ESLint 9 native). No FlatCompat: the legacy
// `next/core-web-vitals` + `next/typescript` chain crashes @eslint/eslintrc
// with a circular-structure error on this stack, so each plugin is wired
// directly in flat format with the same intent as before.
import nextPlugin from '@next/eslint-plugin-next'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import tseslint from 'typescript-eslint'
import globals from 'globals'

const eslintConfig = [
  // Base: modern JS + TypeScript (replaces `next/typescript`).
  ...tseslint.configs.recommended,
  // Next.js App Router rules (replaces `next/core-web-vitals`).
  nextPlugin.flatConfig.coreWebVitals,
  // React + hooks + a11y (previously inherited via eslint-config-next).
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  reactHooksPlugin.configs['recommended-latest'],
  jsxA11yPlugin.flatConfigs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // prop-types is meaningless in a TypeScript codebase (the legacy
      // next/core-web-vitals chain never enabled the full react preset).
      'react/prop-types': 'off',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
  {
    // Node scripts in CommonJS correctly use require().
    files: ['scripts/**/*.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    ignores: ['.next/', 'src/payload-types.ts', 'src/payload-generated-schema.ts'],
  },
]

export default eslintConfig
