# Frontend

React + TypeScript frontend for the Soccer Tournament Dashboard.

Built with Vite, Tailwind CSS, React Router, and Sentry. The frontend communicates only with the FastAPI backend and never calls API-Football directly.

---

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Sentry

---

## Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The app runs at:

```txt
http://localhost:5173
```

---

## Environment Variables

Create a `.env` file in `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_SENTRY_DSN=
VITE_ENVIRONMENT=development
VITE_ENABLE_BRACKET=false
```

Notes:

- All frontend environment variables must start with `VITE_`
- These values are exposed to the browser, so never include secrets
- Do not include a trailing `/` for the API base URL

---

## Project Structure

```txt
src/
  api/          raw backend API calls
  assets/       static assets
  components/   reusable UI components
  config/       frontend config and feature flags
  constants/    app-wide constants
  context/      React context providers
  hooks/        custom React hooks
  lib/          tailwind cn function
  pages/        route-level page components
  services/     frontend business logic
  styles/       global styles
  types/        shared TypeScript types
  utils/        helper functions
```

---

## API Communication

- All requests go through the FastAPI backend
- The frontend never calls API-Football directly
- Base URL is configured via `VITE_API_BASE_URL`
- Requests should be defined in `src/api/`
- Business logic should live in `src/services/`

---

## Observability

Sentry is integrated for error tracking and session replay.

- Unhandled errors are captured automatically via `ErrorBoundary`
- Failed API calls should be captured manually with `Sentry.captureException`
- Session replay is enabled for error events (100%) and 5% of sessions otherwise
- `VITE_ENVIRONMENT` tags errors by environment in the Sentry dashboard
- `VITE_SENTRY_DSN` is intentionally public — protection is handled via allowed domains in Sentry project settings

---

## Feature Flags

Feature flags are used to control incomplete or staged features.

Example:

```ts
const flags = {
  knockoutBracket: import.meta.env.VITE_ENABLE_BRACKET === 'true',
};
```

Use flags to:

- hide incomplete features
- safely deploy UI changes
- enable features without redeploying

---

## Styling

- Tailwind CSS is used for styling
- Global styles and variables are defined in `src/styles/`
- Prefer utility classes over custom CSS
- Use CSS variables for theme consistency

---

## Testing

Vitest is used for frontend unit and integration-style tests. StrykerJS is used for mutation testing to validate test quality.

Run the full frontend test suite once:

```bash
npm run test:run
```

Run tests in watch mode during development:

```bash
npm run test
```

Run unit-focused tests for hooks, utilities, context, API helpers, and isolated components:

```bash
npm run test:run -- src/hooks src/utils src/lib src/context src/api src/components
```

Run integration-style tests for routed pages and component interactions:

```bash
npm run test:run -- src/pages src/components
```

Run coverage:

```bash
npm run test:coverage
```

Run mutation testing:

```bash
npm run test:mutation
```

Results found in: [Mutation Testing Reports](/frontend/reports/mutation-testing.md).

Local focused mutation runs may use `stryker.local.config.mjs`, which should remain untracked.

---

## Formatting

Prettier is used for consistent formatting.

Format all files:

```bash
npm run format
```

Check formatting:

```bash
npm run format:check
```

Formatting rules are defined in:

```txt
.prettierrc
```

---

## Development Guidelines

- Use functional components only
- Define explicit types/interfaces for props
- Avoid `any`; use `unknown` if necessary
- Keep components focused and reusable
- Keep data fetching out of components (use hooks/services)
- Always destructure props in function signatures
- Use `const` by default; avoid `let` unless necessary

---

## Notes

- Do not store secrets in frontend code
- All sensitive logic must remain in the backend
- Keep this README focused on frontend-specific concerns
