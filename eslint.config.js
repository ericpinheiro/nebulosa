// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'estudo/*', 'openspec/*'],
  },
  {
    rules: {
      // Regras do React Compiler: o compiler está desligado (app.config.ts) e a galáxia/animações
      // usam refs e mutação imperativa de propósito (three.js, Reanimated).
      'react-hooks/refs': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/set-state-in-effect': 'off',
      // Elementos do react-three-fiber (<points>, <shaderMaterial>) têm props próprias.
      'react/no-unknown-property': 'off',
      'import/no-named-as-default-member': 'off',
    },
  },
  {
    files: ['src/__tests__/**'],
    rules: { 'import/first': 'off' },
  },
]);
