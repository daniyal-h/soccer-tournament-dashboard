# Frontend Mutation Testing

Tooling:

- StrykerJS
- Vitest
- React + TypeScript

Date of Test: Tues June 9 16:44:31 CDT 2026

## Results

- Mutation score: 98.28%
- Survived mutants reviewed
- Equivalent/style-only mutants excluded or disabled intentionally

## Notes

Excluded files:

- shadcn/ui components
- layout wrappers
- placeholder pages

Focused mutation coverage areas:

- hooks
- API parsing
- conditional rendering
- state transitions
- tournament selection logic

## Running locally

```bash
npm run test:mutation
```

Then generate static report into committed folder:

```js
htmlReporter: {
  baseDir: 'reports/mutation-testing',
},
```

or newer Stryker versions:

```js
reporters: ['html', 'clear-text', 'progress'],
htmlReporter: {
  fileName: 'reports/mutation-testing/index.html',
},
```
