module.exports = {
  env: {
    browser: true,
    es2021: true,
    serviceworker: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  globals: {
    self: 'readonly',
    clients: 'readonly',
    caches: 'readonly',
    fetch: 'readonly',
    addEventListener: 'readonly',
    removeEventListener: 'readonly',
    importScripts: 'readonly',
    skipWaiting: 'readonly',
    registration: 'readonly'
  },
  rules: {
    'no-restricted-globals': 'off',
    'no-undef': 'off',
    'array-callback-return': 'off'
  }
};
