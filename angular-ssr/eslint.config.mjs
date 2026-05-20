import pluginSecurity from 'eslint-plugin-security';
import tseslint from '@typescript-eslint/parser';

export default [
  {
    ignores: ['dist/', 'node_modules/', 'coverage/', '**/*.mjs']
  },
  {
    files: ['src/**/*.ts', 'src/**/*.js'],
    languageOptions: {
      parser: tseslint,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' }
    },
    plugins: { security: pluginSecurity },
    rules: {
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'warn',
      'security/detect-disable-mustache-escape': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-possible-timing-attacks': 'warn',
      'security/detect-new-buffer': 'warn',
      'security/detect-non-literal-require': 'warn',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-pseudoRandomBytes': 'warn',
      'security/detect-bidi-characters': 'warn'
    }
  }
];
