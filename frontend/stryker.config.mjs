export default {
  packageManager: 'npm',
  testRunner: 'vitest',
  coverageAnalysis: 'perTest',

  concurrency: 2,
  timeoutMS: 10000,
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
    '!src/components/layout/AppLayout.tsx',
    '!src/components/layout/PageContainer.tsx',

    // placeholder pages
    '!src/pages/PlayerStats.tsx',
    '!src/pages/Schedule.tsx',
    '!src/pages/TeamProfile.tsx',
    '!src/pages/Teams.tsx',

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
