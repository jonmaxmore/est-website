import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: [
      '.nuxt/**',
      '.output/**',
      'dist/**',
      'node_modules/**',
      'public/**',
      'prisma/migrations/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  // 'essential' = correctness rules only. Formatting/stylistic rules are
  // delegated to Prettier (see .prettierrc), so we skip 'recommended' here
  // to avoid double-reporting layout choices.
  ...vue.configs['flat/essential'],

  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Nuxt auto-imports + browser/node globals used across the codebase.
        defineNuxtConfig: 'readonly',
        defineNuxtPlugin: 'readonly',
        defineEventHandler: 'readonly',
        defineNuxtRouteMiddleware: 'readonly',
        useRuntimeConfig: 'readonly',
        useRoute: 'readonly',
        useRouter: 'readonly',
        useState: 'readonly',
        useFetch: 'readonly',
        useAsyncData: 'readonly',
        useNuxtApp: 'readonly',
        useCookie: 'readonly',
        useHead: 'readonly',
        useSeoMeta: 'readonly',
        navigateTo: 'readonly',
        createError: 'readonly',
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        globalThis: 'readonly',
        window: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
    rules: {
      // TS handles unused/undef detection; keep ESLint focused on style/bugs
      // it can verify without type info.
      'no-unused-vars': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/multi-word-component-names': 'off',
    },
  },
]
