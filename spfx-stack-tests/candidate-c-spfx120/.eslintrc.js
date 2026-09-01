module.exports = {
  root: true,
  overrides: [{
    files: ['**/*.ts', '**/*.tsx'],
    parser: '@typescript-eslint/parser',
    parserOptions: { ecmaVersion: 2018, sourceType: 'module' },
    rules: {}
  }]
};