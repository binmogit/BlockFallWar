module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  env: {
    node: true,
    jest: true,
    browser: true,
  },
  plugins: ['@typescript-eslint', 'jest', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
  ],
  rules: {
    // prefer TypeScript's handling of unused vars
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    // stylistic choices kept minimal here
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
  settings: {
    // allow eslint-plugin-import to resolve TypeScript files
    'import/resolver': {
      typescript: {},
    },
  },
};
