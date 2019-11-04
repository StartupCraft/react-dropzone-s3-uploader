const fs = require('fs')

const isProduction =
  process.env.NODE_ENV === 'production' || process.env.CI === 'true'

const prettierOptions = JSON.parse(fs.readFileSync('./.prettierrc', 'utf8'))

module.exports = {
  parser: 'babel-eslint',
  extends: ['airbnb', 'prettier', 'prettier/react'],
  env: {
    browser: true,
    jest: true,
    es6: true,
    node: true,
  },
  plugins: ['prettier'],
  rules: {
    'camelcase': 0,
    'prefer-promise-reject-errors': 0,
    'prettier/prettier': ['error', prettierOptions],
    'no-console': isProduction ? 2 : 0,
    'no-debugger': isProduction ? 2 : 0,
    'import/prefer-default-export': 1,
    'react/forbid-prop-types': 0,
    'react/sort-prop-types': [1, { callbacksLast: true }],
    'react/jsx-no-bind': 2,
    'react/jsx-sort-props': [1, { callbacksLast: true }],
    'react/jsx-boolean-value': 2,
    'react/jsx-handler-names': 2,
    'react/jsx-props-no-spreading': 0,
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'react/destructuring-assignment': 0,
    'react/forbid-foreign-prop-types': 0,
    'react/state-in-constructor': 0,
    'jsx-a11y/control-has-associated-label': 0,
    'jsx-a11y/label-has-associated-control': 0,
    'jsx-a11y/label-has-for': 0,
    'no-redeclare': [2, { builtinGlobals: true }],
    'no-underscore-dangle': ['error', { allow: ['_id', '_rev'] }],
    'no-shadow': [
      2,
      {
        builtinGlobals: true,
        allow: [
          'location',
          'event',
          'history',
          'find',
          'root',
          'name',
          'close',
          'Map',
          'Text',
          'Request',
          'fetch',
        ],
      },
    ],
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
      classes: true,
    },
  },
  settings: {
    'import/resolver': {
      node: {
        moduleDirectory: ['node_modules', 'src'],
      },
    },
  },
}
