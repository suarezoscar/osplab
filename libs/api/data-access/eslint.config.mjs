import baseConfig from '../../../eslint.config.mjs';

export default [
  {
    ignores: ['libs/api/data-access/src/generated/**', 'src/generated/**'],
  },
  ...baseConfig,
];
