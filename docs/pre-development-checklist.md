# Pre-Development Setup Checklist

Everything to complete before writing a single line of application code. Work through this top to bottom. Each section builds on the previous one.

---

## 1. GitHub Repository

* [X] Create repo named `soccer-tournament-dashboard` with public visibility
* [X] Add description, topics (fastapi, python, react, typescript, postgresql, docker, worldcup2026, tailwindcss, soccer, sports-analytics)
* [X] Initialize with README, Python .gitignore, MIT license
* [X] Clone repo locally and open in VS Code
* [X] Enable branch protection on `main`: no direct pushes, require passing CI before merge, require pull request before merging

---

## 2. GitHub Project Structure

* [X] Create Milestones (one per Epic/Feature)

  * [X] Tournament Selector
  * [X] Group Standings
  * [X] Match Schedule
  * [X] Team Profile Page
  * [X] Player Stats Leaderboard
  * [X] Global Search
  * [X] Knockout Bracket
  * [X] Infrastructure and CI/CD

* [X] Create parent issues for each milestone

* [X] Create individual task issues linked to parents

* [X] Add labels: `feature`, `subtask`, `bugfix`, `refactor`, `chore`, `frontend`, `backend`, `infra`, `docs`

---

## 3. Repository Structure

* [X] Create `frontend/`, `backend/`, `docs/`
* [X] Add `docker-compose.yml`
* [X] Add `.vscode/settings.json`
* [X] Add docs:

  * [X] `ARCHITECTURE.md`
  * [X] `DECISIONS.md`
  * [X] `TEST-PLAN.md`
  * [X] `branching-convention.md`
  * [X] `coding-convention.md`
  * [X] `commit-convention.md`
* [X] Replace README with full project README

---

## 4. Frontend Initialization

* [X] Scaffold React + Vite (TypeScript)
* [X] Install Tailwind CSS
* [X] Install React Router
* [X] Install Prettier
* [X] Install Sentry
* [X] Setup folder structure (`components`, `pages`, `hooks`, `services`, etc.)
* [X] Remove boilerplate
* [X] Verify dev server runs

---

## 5. Backend Initialization

* [X] Setup Python venv
* [X] Install FastAPI stack (uvicorn, sqlalchemy, alembic, etc.)
* [X] Create layered architecture (routers/services/repositories/models)
* [X] Add `.env.example`
* [X] Setup config + DB connection modules
* [X] Install pytest, mutmut, black
* [X] Verify API and `/docs` endpoint

---

## 6. Docker Setup

* [X] Create backend Dockerfile
* [X] Configure docker-compose (frontend, backend, db)
* [X] Add env vars for PostgreSQL
* [X] Verify full stack runs locally

---

## 7. Database Setup

* [X] Initialize Alembic
* [X] Configure env-based DB URL
* [X] Create initial migration
* [X] Apply migration locally
* [X] Define indexing strategy (search, foreign keys, timestamps)

---

## 8. CI/CD Pipeline

* [X] GitHub Actions:

  * [X] Lint frontend
  * [X] Lint backend
  * [X] Run backend tests
  * [X] SonarCloud scan
* [X] Deploy workflow on push to main
* [X] Verify pipeline works

---

## 9. SonarCloud

* [X] Create project
* [X] Add token to GitHub secrets
* [X] Add sonar config
* [X] Verify scan passes

---

## 10. Deployment Setup

* [X] Setup Render backend (Docker)
* [X] Setup Render PostgreSQL
* [X] Add env variables (API key, DB URL, secrets, Sentry)
* [X] Setup Vercel frontend
* [X] Configure API base URL
* [X] Verify deployment works

---

## 11. Monitoring Setup

* [X] Setup Sentry (frontend + backend)
* [X] Trigger test errors
* [X] Setup Better Uptime health monitor

---

## 12. API Football

* [X] Get API key
* [X] Store in env
* [X] Save fixture responses for testing
* [X] Verify API calls

---

## 13. Staging Environment

* [X] Create staging backend (Render)
* [X] Create staging frontend (Vercel preview or separate project)
* [X] Create staging database
* [X] Configure staging env vars
* [X] Auto-deploy to staging on merge
* [X] Add manual promotion to production

---

## 14. API Versioning

* [X] Structure routes under `/api/v1`
* [X] Organize backend into `api/v1/`
* [X] Define response contracts
* [X] Document versioning strategy

---

## 15. Cache & Invalidation

* [X] Create cache table (`cache_key`, `payload`, `last_updated`, `expires_at`)
* [X] Define TTL per data type
* [X] Implement cache-aside strategy
* [X] Implement stale fallback
* [X] Add refresh cooldown per cache key
* [X] Log cache behaviour

---

## 16. Background Jobs

* [X] Create refresh script
* [X] Add GitHub Actions cron job
* [X] Add manual trigger
* [X] Protect admin endpoint with token
* [X] Log job results

---

## 17. Feature Flags

* [X] Create flag config
* [X] Add env-based flags
* [X] Guard incomplete features
* [X] Remove flags after stabilization

---

## 18. Security

* [X] Configure CORS (Vercel + localhost)
* [X] Keep API keys backend-only
* [X] Parameterize SQL queries
* [X] Validate inputs and whitelist fields
* [X] Add token auth for admin endpoints
* [X] Avoid logging sensitive data

---

## 19. Error Handling

* [X] Standardize error response format
* [X] Create custom error class
* [X] Add centralized exception handling
* [X] Return generic 500 responses

---

## 20. Observability

* [X] Configure logging
* [X] Add request logging middleware
* [X] Log cache + job events
* [X] Integrate Sentry
* [X] Add `/api/v1/health`
* [X] logging as JSON rather than plain strings makes logs searchable and readable in Sentry

---

## 21. Rate Limiting

* [X] Add rate limiting (slowapi)
* [X] Configure per-endpoint limits
* [X] Return 429 responses
* [X] Add Retry-After header
* [X] Implement cache refresh cooldown
* [X] Add frontend debounce

---

## Final Checks

* [X] Full stack runs locally
* [X] CI passes
* [X] Staging works
* [X] Production works
* [X] Monitoring active
* [X] Background jobs running
* [X] Cache working
* [X] Rate limiting working
* [X] Error handling consistent
* [X] Docs complete

Once all boxes are checked, begin feature development.
