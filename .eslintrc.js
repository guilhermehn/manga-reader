module.exports = {
  extends: 'eslint:recommended',

  globals: {
    chrome: true
  },

  rules: {
    indent: [2, 2],
    quotes: [2, 'single'],
    semi: [2, 'always'],
    'comma-dangle': [1, 'never'],
    'no-cond-assign': [2],
    'jsx-quotes': [2, 'prefer-single'],
    'no-spaced-func': [2],
    curly: [2],
    eqeqeq: [2]
  },

  env: {
    es6: true,
    node: true,
    browser: true
  },

  ecmaFeatures: {
    modules: true,
    jsx: true,
    experimentalObjectRestSpread: true
  },

  plugins: [
    'react'
  ]
};
