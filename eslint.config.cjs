module.exports = [
  {
    ignores: ['node_modules/**', 'public/**', '.dist/**'],
  },
  // Source files: enable project-aware rules
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      import: require('eslint-plugin-import'),
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'all' },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      // Stricter rules for source files
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
    settings: {
      'import/resolver': {
        typescript: {},
      },
    },
  },
  // Tests: do not use project mode (tests are not included in tsconfig)
  {
    files: ['tests/**/*.ts'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        sourceType: 'module',
      },
    },
    plugins: {
      jest: require('eslint-plugin-jest'),
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];
