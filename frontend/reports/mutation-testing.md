# Frontend Mutation Testing

Tooling:

- StrykerJS
- Vitest
- React + TypeScript

Date of Test: Sat June 28 19:17 CDT 2026

## Results

- Total Mutants: 2641
- Mutation score: **98.5%** (2476/2514 non-ignored mutants killed)
- Survived mutants (38) reviewed
- Equivalent/style-only mutants excluded or disabled intentionally (127)

## Notes

Excluded files:

- shadcn/ui components
- layout wrappers

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
