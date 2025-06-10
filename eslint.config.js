import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['node_modules/**', 'docs/**'],
  },
  {
    files: ['src/**/*.ts', 'config/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      'arrow-parens': ['error', 'as-needed'],
      'arrow-spacing': 'error',
      'block-spacing': 'error',
      'comma-dangle': ['error', 'always-multiline'],
      'comma-spacing': ['error', { before: false, after: true }],
      'curly': ['error', 'all'],
      'eol-last': ['error', 'always'],
      'keyword-spacing': ['error', { before: true, after: true }],
      'max-len': ['error', { code: 120 }],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-dupe-class-members': 'error',
      'no-mixed-operators': 'error',
      'no-trailing-spaces': 'error',
      'no-undef': 'off',
      'object-curly-spacing': ['error', 'always'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'space-before-blocks': ['error', 'always'],
      'space-in-parens': ['error', 'never'],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
);