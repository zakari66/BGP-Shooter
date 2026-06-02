// Flat ESLint config — vanilla ES modules, browser + node (tests) environments.
export default [
  {
    ignores: ['node_modules/', 'dist/', 'build/', 'coverage/'],
  },
  {
    files: ['src/**/*.js', 'tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-undef': 'off',
      eqeqeq: ['warn', 'always'],
      'no-var': 'error',
      'prefer-const': 'warn',
    },
  },
];
