# Frontend Mutation Testing

Tooling:

- StrykerJS
- Vitest
- React + TypeScript

Date of Test: Sat June 20 16:48 CDT 2026

## Results

- Total Mutants: 2312
- Mutation score: **98.73%** (2176/2204 non-ignored mutants killed)
- Survived mutants (28) reviewed
- Equivalent/style-only mutants excluded or disabled intentionally (108)

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
