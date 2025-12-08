import js from '@eslint/js';
import nextConfig from 'eslint-config-next';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

const files = ['**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}'];

const importTypescriptSettings =
  importPlugin.flatConfigs.typescript.settings ?? {};

const importRecommendedBase = {
  ...importPlugin.flatConfigs.recommended,
};
delete importRecommendedBase.plugins;

const importTypescriptBase = {
  ...importPlugin.flatConfigs.typescript,
};
delete importTypescriptBase.plugins;

const importRecommendedConfig = {
  ...importRecommendedBase,
  files,
};

const importTypescriptConfig = {
  ...importTypescriptBase,
  files,
  settings: {
    ...importTypescriptSettings,
    'import/resolver': {
      ...(importTypescriptSettings['import/resolver'] ?? {}),
      typescript: { alwaysTryTypes: true, project: './tsconfig.json' },
      node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    },
    'import/parsers': {
      ...(importTypescriptSettings['import/parsers'] ?? {}),
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    shouldfix: true,
  },
};

const prettierConfig = {
  ...eslintConfigPrettier,
  files,
};

const customRules = {
  files,
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: true, optionalDependencies: false },
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-var-requires': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
    'comma-dangle': ['error', 'always-multiline'],
    'import/no-unresolved': 'off',
    'import/named': 'error',
    'import/namespace': 'error',
    'import/default': 'error',
    'import/export': 'error',
  },
};

export default defineConfig([
  { ignores: ['**/eslint.config.*'] },
  js.configs.recommended,
  ...nextConfig,
  ...tseslint.configs.recommended,
  importRecommendedConfig,
  importTypescriptConfig,
  prettierConfig,
  customRules,
]);
