// eslint.config.mjs - التركيز على src/ فقط
import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'

export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**', 
      'dist/**',
      'build/**',
      '**/*.d.ts',
      'package-lock.json',
      '*.config.*'
    ]
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      }
    },
    plugins: { '@typescript-eslint': tseslint },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-console': 'warn',
      'no-var': 'error',
      'prefer-const': 'error'
    }
  }
]
