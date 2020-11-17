module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'airbnb-base',
    'plugin:vue/essential',
  ],
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 11,
    sourceType: 'module',
  },
  plugins: [
    'vue',
  ],
  globals: {
    __CLIENT__: true,
    __SERVER__: true,
    __DEVELOPMENT__: true,
    __PRODUCTION__: true,
    wx: true,
  },
  rules: {
    semi: [2, 'never'],
    'comma-dangle': [1, 'always-multiline'],
    'arrow-parens': 'off',
    'no-underscore-dangle': 'off',
    'arrow-body-style': 'off',
    'consistent-return': 'off',
    'array-callback-return': 'off',
    'max-len': 'off',
    'max-lines': 'off',
    'no-console': 'off',
    'no-plusplus': 'off',
    'no-mixed-operators': 'off',
    'class-methods-use-this': 'off',
    'no-else-return': 'off',
    'default-case': 'off',
    'no-new': 'off',
    'no-restricted-syntax': 'off',
    'no-continue': 'off',
    'no-return-assign': [
      'off',
      'always',
    ],
    // 禁止无用的表达式
    'no-unused-expressions': [
      'off',
      {
        allowShortCircuit: true,
        allowTernary: true,
        allowTaggedTemplates: true,
      },
    ],
    'global-require': 'off',
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        named: 'always',
        asyncArrow: 'always',
      },
    ],
    'import/extensions': ['error', 'always', {
      js: 'never',
      json: 'never',
      scss: 'never',
      css: 'never',
      vue: 'never',
    }],
  },
  settings: {
    'import/resolver': {
      webpack: {
        config: './build/webpack.client.config.js',
      },
    },
  },
}
