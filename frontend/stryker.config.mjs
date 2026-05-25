export default {
  packageManager: 'npm',
  testRunner: 'vitest',
  coverageAnalysis: 'perTest',

  concurrency: 4,
  timeoutMS: 60000,
  timeoutFactor: 2,
  ignoreStatic: true,

  mutate: [
    'src/**/*.{ts,tsx}',

    // test
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',

    // app/bootstrap
    '!src/main.tsx',
    '!src/App.tsx',
    '!src/setupTests.ts',

    // ShadCN components
    '!src/components/ui/**', 

    // static config/constants
    '!src/constants/**',
  ],

  reporters: ['html', 'clear-text', 'progress'],

  htmlReporter: {
    fileName: 'reports/mutation/index.html',
  },

  vitest: {
    configFile: './vite.config.ts',
  },
};
