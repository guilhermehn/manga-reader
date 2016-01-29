module.exports = {
  rules: {
    'indent': [2, 2],
    'quotes': [2, 'single'],
    'semi': [2, 'always'],
    'comma-dangle': [1, 'never'],
    'no-cond-assign': [2]
  },
  env: {
    'es6': true,
    'node': true,
    'browser': true
  },
  extends: 'eslint:recommended',
  ecmaFeatures: {
    'modules': true,
    'jsx': true,
    'experimentalObjectRestSpread': true
  },
  plugins: [
    'react'
  ]
};
