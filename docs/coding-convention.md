# Coding Style Guidelines

This document outlines the coding style and formatting conventions for this project. Consistency across the frontend and backend makes the codebase easier to read, review, and maintain.

---

## 1. Naming Conventions

### Frontend (TypeScript)

- **Variables and functions:** Use `camelCase` (e.g., `matchDate`, `fetchStandings()`)
- **Boolean variables:** Prefix with `is`, `has`, or `should` (e.g., `isLoading`, `hasError`)
- **Constants:** Use `UPPER_SNAKE_CASE` for global or environment constants (e.g., `API_BASE_URL`)
- **Classes and types:** Use `PascalCase` for TypeScript interfaces, types, and class names (e.g., `MatchCard`, `TeamProfile`)
- **React components:** Use `PascalCase` for all component names and their files (e.g., `GroupCard.tsx`, `MatchSchedule.tsx`)
- **Custom hooks:** Must start with the `use` prefix (e.g., `useTournament`, `useDebounce`)

### Backend (Python)

- **Variables and functions:** Use `snake_case` (e.g., `match_date`, `fetch_standings()`)
- **Boolean variables:** Prefix with `is_`, `has_`, or `should_` (e.g., `is_cached`, `has_error`)
- **Constants:** Use `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`, `CACHE_TTL_SECONDS`)
- **Classes and models:** Use `PascalCase` (e.g., `MatchService`, `TeamRepository`)
- **Private methods:** Prefix with a single underscore (e.g., `_build_query()`)

---

## 2. Formatting and Syntax

### Frontend (TypeScript)

Formatting is enforced automatically by Prettier on save. Configuration lives in `frontend/.prettierrc`. The rules below reflect that config.

- **Indentation:** 2 spaces. No tabs.
- **Semicolons:** Always use semicolons at the end of statements.
- **Quotes:** Single quotes for TypeScript strings. Double quotes for JSX attributes.
- **Line length:** Keep lines under 100 characters.
- **Variable declarations:** Use `const` by default. Use `let` only when reassignment is required. Never use `var`.
- **Trailing commas:** Add trailing commas in multiline arrays and objects.
- **Braces:** Always use curly braces for `if`, `else`, `for`, and `while` blocks, even for single-line bodies.

### Backend (Python)

Formatting is enforced automatically by Black on save. Configuration lives in `backend/pyproject.toml`. The rules below reflect that config.

- **Indentation:** 4 spaces. No tabs.
- **Quotes:** Single quotes for strings unless the string contains a single quote, in which case use double quotes.
- **Line length:** Keep lines under 100 characters.
- **Imports:** Group in this order, separated by a blank line: standard library first, third-party packages second, local imports third.
- **Type hints:** Always annotate function parameters and return types.
- **F-strings:** Use f-strings for string formatting. Avoid `.format()` and `%` formatting.

---

## 3. Comments and Documentation

- Comments should explain **why** the code exists, not what it is doing. The code itself should explain what.
- Use single-line comments (`//` in TypeScript, `#` in Python) for brief inline explanations, placed on the line above the code they describe.
- Use JSDoc (`/** ... */`) in TypeScript and docstrings (`""" ... """`) in Python to document the purpose, parameters, and return types of complex functions.
- Mark incomplete work with `// TODO: explanation` or `# TODO: explanation`.

---

## 4. Frontend (React and TypeScript)

- **Component types:** Only functional components. Class components are not permitted.
- **Props and state:** Always define explicit `interface` or `type` objects for component props and state. Never use `any`. Use `unknown` with type narrowing if the type is genuinely unclear.
- **Destructuring:** Always destructure props directly in the function signature.

```tsx
function MatchCard({ homeTeam, awayTeam, kickoffTime }: MatchCardProps) {
```

- **Tailwind className ordering:** Group structural classes first (layout, flex, grid), then visual styling (colors, typography, borders).
- **Async data fetching:** Use custom hooks or React Query. Keep data fetching out of component bodies.

---

## 5. Backend (Python and FastAPI)

- **Async:** Use `async def` for route handlers that call external services or the database. Use `def` for synchronous utility functions.
- **Error handling:** Always wrap route handler logic in try/except blocks. Log the error before returning an HTTP exception. Never let unhandled exceptions reach the client silently.

```python
@router.get('/matches')
async def get_matches(db: Session = Depends(get_db)):
    try:
        return await match_service.get_all(db)
    except Exception as e:
        logger.error(f'Failed to fetch matches: {e}')
        raise HTTPException(status_code=500, detail='Internal server error')
```

- **Dependency injection:** Use FastAPI's `Depends()` for database sessions and shared dependencies. Never instantiate dependencies inside route handlers directly.
- **Layer separation:** Routes call services. Services call repositories. Repositories handle all database queries. No database logic in route handlers.
- **Environment variables:** All secrets and configuration values must be read from environment variables via a settings module. Nothing sensitive is hardcoded or committed to the repository.