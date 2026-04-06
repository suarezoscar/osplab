import baseConfig from '../../../eslint.config.mjs';

export default [
  {
    ignores: ['libs/farmacias/data-access/src/generated/**', 'src/generated/**'],
  },
  ...baseConfig,
];
