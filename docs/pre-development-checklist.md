# Pre-Development Setup Checklist

Everything to complete before writing a single line of application code. Work through this top to bottom. Each section builds on the previous one.

---

## 1. GitHub Repository

* [ ] Create repo named `soccer-tournament-dashboard` with public visibility
* [ ] Add description, topics (fastapi, python, react, typescript, postgresql, docker, worldcup2026, tailwindcss, soccer, sports-analytics)
* [ ] Initialize with README, Python .gitignore, MIT license
* [ ] Clone repo locally and open in VS Code
* [ ] Enable branch protection on `main`: no direct pushes, require passing CI before merge, require pull request before merging

---

## 2. GitHub Project Structure

* [ ] Create Milestones (one per Epic/Feature)

  * [ ] Tournament Selector
  * [ ] Group Standings
  * [ ] Match Schedule
  * [ ] Team Profile Page
  * [ ] Player Stats Leaderboard
  * [ ] Global Search
  * [ ] Knockout Bracket
  * [ ] Infrastructure and CI/CD

* [ ] Create parent issues for each milestone

* [ ] Create individual task issues linked to parents

* [ ] Add labels: `feature`, `subtask`, `bugfix`, `refactor`, `chore`, `frontend`, `backend`, `infra`, `docs`

---

## 3. Repository Structure

* [ ] Create `frontend/`, `backend/`, `docs/`
* [ ] Add `docker-compose.yml`
* [ ] Add `.vscode/settings.json`
* [ ] Add docs:

  * [ ] `ARCHITECTURE.md`
  * [ ] `DECISIONS.md`
  * [ ] `TEST-PLAN.md`
  * [ ] `branching-convention.md`
  * [ ] `coding-convention.md`
  * [ ] `commit-convention.md`
* [ ] Replace README with full project README

---

## 4. Frontend Initialization

* [ ] Scaffold React + Vite (TypeScript)
* [ ] Install Tailwind CSS
* [ ] Install React Router
* [ ] Install Prettier
* [ ] Install Sentry
* [ ] Setup folder structure (`components`, `pages`, `hooks`, `services`, etc.)
* [ ] Remove boilerplate
* [ ] Verify dev server runs

---

## 5. Backend Initialization

* [ ] Setup Python venv
* [ ] Install FastAPI stack (uvicorn, sqlalchemy, alembic, etc.)
* [ ] Create layered architecture (routers/services/repositories/models)
* [ ] Add `.env.example`
* [ ] Setup config + DB connection modules
* [ ] Install pytest, mutmut, black
* [ ] Verify API and `/docs` endpoint

---

## 6. Docker Setup

* [ ] Create backend Dockerfile
* [ ] Configure docker-compose (frontend, backend, db)
* [ ] Add env vars for PostgreSQL
* [ ] Verify full stack runs locally

---

## 7. Database Setup

* [ ] Initialize Alembic
* [ ] Configure env-based DB URL
* [ ] Create initial migration
* [ ] Apply migration locally
* [ ] Define indexing strategy (search, foreign keys, timestamps)

---

## 8. CI/CD Pipeline

* [ ] GitHub Actions:

  * [ ] Lint frontend
  * [ ] Lint backend
  * [ ] Run backend tests
  * [ ] SonarCloud scan
* [ ] Deploy workflow on push to main
* [ ] Verify pipeline works

---

## 9. SonarCloud

* [ ] Create project
* [ ] Add token to GitHub secrets
* [ ] Add sonar config
* [ ] Verify scan passes

---

## 10. Deployment Setup

* [ ] Setup Render backend (Docker)
* [ ] Setup Render PostgreSQL
* [ ] Add env variables (API key, DB URL, secrets, Sentry)
* [ ] Setup Vercel frontend
* [ ] Configure API base URL
* [ ] Verify deployment works

---

## 11. Monitoring Setup

* [ ] Setup Sentry (frontend + backend)
* [ ] Trigger test errors
* [ ] Setup Better Uptime health monitor

---

## 12. API Football

* [ ] Get API key
* [ ] Store in env
* [ ] Save fixture responses for testing
* [ ] Verify API calls

---

## 13. Staging Environment

* [ ] Create staging backend (Render)
* [ ] Create staging frontend (Vercel preview or separate project)
* [ ] Create staging database
* [ ] Configure staging env vars
* [ ] Auto-deploy to staging on merge
* [ ] Add manual promotion to production

---

## 14. API Versioning

* [ ] Structure routes under `/api/v1`
* [ ] Organize backend into `api/v1/`
* [ ] Define response contracts
* [ ] Document versioning strategy

---

## 15. Cache & Invalidation

* [ ] Create cache table (`cache_key`, `payload`, `last_updated`, `expires_at`)
* [ ] Define TTL per data type
* [ ] Implement cache-aside strategy
* [ ] Implement stale fallback
* [ ] Add refresh cooldown per cache key
* [ ] Log cache behaviour

---

## 16. Background Jobs

* [ ] Create refresh script
* [ ] Add GitHub Actions cron job
* [ ] Add manual trigger
* [ ] Protect admin endpoint with token
* [ ] Log job results

---

## 17. Feature Flags

* [ ] Create flag config
* [ ] Add env-based flags
* [ ] Guard incomplete features
* [ ] Remove flags after stabilization

---

## 18. Security

* [ ] Configure CORS (Vercel + localhost)
* [ ] Keep API keys backend-only
* [ ] Parameterize SQL queries
* [ ] Validate inputs and whitelist fields
* [ ] Add token auth for admin endpoints
* [ ] Avoid logging sensitive data

---

## 19. Error Handling

* [ ] Standardize error response format
* [ ] Create custom error class
* [ ] Add centralized exception handling
* [ ] Return generic 500 responses

---

## 20. Observability

* [ ] Configure logging
* [ ] Add request logging middleware
* [ ] Log cache + job events
* [ ] Integrate Sentry
* [ ] Add `/api/v1/health`
* [ ] logging as JSON rather than plain strings makes logs searchable and readable in Sentry

---

## 21. Rate Limiting

* [ ] Add rate limiting (slowapi)
* [ ] Configure per-endpoint limits
* [ ] Return 429 responses
* [ ] Add Retry-After header
* [ ] Implement cache refresh cooldown
* [ ] Add frontend debounce

---

## Final Checks

* [ ] Full stack runs locally
* [ ] CI passes
* [ ] Staging works
* [ ] Production works
* [ ] Monitoring active
* [ ] Background jobs running
* [ ] Cache working
* [ ] Rate limiting working
* [ ] Error handling consistent
* [ ] Docs complete

Once all boxes are checked, begin feature development.
