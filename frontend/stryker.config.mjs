export default {
  packageManager: 'npm',
  testRunner: 'vitest',
  coverageAnalysis: 'perTest',

  mutate: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],

  reporters: ['html', 'clear-text', 'progress'],
  htmlReporter: {
    fileName: 'reports/mutation/index.html',
  },

  vitest: {
    configFile: 'vitest.config.ts',
  },
};
