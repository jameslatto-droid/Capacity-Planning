require('@rushstack/eslint-config/patch/modern-module-resolution');
module.exports = {
  extends: ['@microsoft/eslint-config-spfx/lib/profiles/react'],
  parserOptions: {
    tsconfigRootDir: __dirname
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2018,
        sourceType: 'module'
      },
      rules: {
        '@rushstack/no-new-null': 0,
        '@rushstack/pair-react-dom-render-unmount': 0,
        '@rushstack/import-requires-chunk-name': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/explicit-function-return-type': 0,
        '@typescript-eslint/no-floating-promises': 0,
        '@typescript-eslint/no-unused-vars': 0,
        '@microsoft/spfx/no-require-ensure': 2,
        'react/no-unescaped-entities': 0,
        'no-var': 2,
        'prefer-const': 0
      }
    }
  ]
};
