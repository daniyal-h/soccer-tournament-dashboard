# Backend

FastAPI backend for the Soccer Tournament Dashboard.

The backend exposes the versioned REST API used by the frontend, manages API-Football access, handles PostgreSQL caching, and keeps external API keys away from the browser, because leaking secrets to users would be a bold career choice.

---

## Tech Stack

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- Alembic
- PostgreSQL
- HTTPX
- Pydantic Settings
- Sentry
- pytest
- mutmut
- Ruff

---

## Setup

Create and activate the virtual environment:

```bash
python -m venv venv
source venv/Scripts/activate
```

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Start the development server:

```bash
python -m uvicorn app.main:app --reload
```

The API runs at:

```txt
http://localhost:8000
```

Interactive API docs:

```txt
http://localhost:8000/docs
```

Health check:

```txt
http://localhost:8000/api/v1/health
```

Response:

| Field       | Values                                |
| ----------- | ------------------------------------- |
| `status`    | `ok` \| `degraded` \| `error`         |
| `version`   | app version from env                  |
| `checks`    | `database` and `cache_entries` status |
| `timestamp` | UTC ISO timestamp                     |

---

## Environment Variables

Two environment files are used depending on how the backend is run:

### Local development (`.env`)

Used when running the backend directly (e.g. `uvicorn`).

```env
DATABASE_URL=postgresql://app_user:app_password@localhost:5432/app_db
SENTRY_DSN=
ENVIRONMENT=development
VERSION=0.1.0
ADMIN_TOKEN=your_admin_token_here
```

### Docker environment (`.env.docker`)

Used when running via Docker Compose.

```env
DATABASE_URL=postgresql://app_user:app_password@db:5432/app_db
SENTRY_DSN=
ENVIRONMENT=development
VERSION=0.1.0
```

Note the hostname difference:

- `localhost` → when running backend locally
- `db` → when running inside Docker (service name)

The backend container uses `.env.docker` via `docker-compose.yml`.

Never commit `.env`.

---

## Project Structure

```txt
app/
  api/
    v1/
      routers/          versioned route handlers
      services/         business logic
      repositories/     database access logic
      api.py            v1 router registration
  constants/            TTL values, job names
  core/                 config, database setup, shared app wiring
  middleware/           Request middleware
  models/               SQLAlchemy database models
  schemas/              Pydantic request/response schemas
  utils/                Helper functions
  main.py               FastAPI entry point

tests/
  unit/               isolated service/function tests
  integration/        API + database interaction tests
  fixtures/           saved API-Football responses and test data
```

---

## API Versioning

All backend routes are served under:

```txt
/api/v1
```

Example routes:

```txt
GET /api/v1/health
GET /api/v1/standings/{tournament_id}
GET /api/v1/matches/{tournament_id}
GET /api/v1/teams/{team_id}
GET /api/v1/player_stats/{tournament_id}
GET /api/v1/search
```

Versioning keeps the API contract stable when future breaking changes are introduced.

---

## Layering Rules

Routes should stay thin.

```txt
routers → services → repositories → database
```

Guidelines:

- Routers handle HTTP concerns only
- Services contain business logic
- Repositories contain SQL/database queries
- Models define database tables
- Schemas define request/response shapes
- No database queries directly inside route handlers

---

## Database

PostgreSQL is used as the main database and cache layer.

If running the backend locally, ensure `.env` uses `localhost`. If running via Docker, `.env.docker` must use `db` as the host.

Alembic handles migrations.

Initialize migrations:

```bash
alembic init alembic
```

Run migrations:

```bash
alembic upgrade head
```

Create a migration:

```bash
alembic revision --autogenerate -m "describe change"
```

When models change:

```bash
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```

---

### Local Database Setup

PostgreSQL runs in Docker for local development.

Start the database container:

```bash
docker compose up -d db
```

Ensure your `.env` contains:

```env
DATABASE_URL=postgresql://app_user:app_password@localhost:5432/app_db
ENVIRONMENT=development
VERSION=0.1.0
SENTRY_DSN=
ALLOWED_ORIGINS=["http://localhost:5173","http://localhost:3000"]
```

Apply migrations to initialize the schema:

```bash
alembic upgrade head
```

Verify the database:

```bash
docker exec -it postgres_db psql -U app_user -d app_db
\dt
```

---

## Caching

The backend caches API-Football responses in PostgreSQL.

Cache entries should include:

```txt
cache_key
payload
last_updated
expires_at
```

Rules:

- Fresh cache is returned immediately, no DB query
- Cache miss fetches from DB, writes to cache
- Pre-tournament data uses 24-hour TTL
- Live standings use 1-minute TTL
- Refresh job invalidates cache after writing new data

---

## Background Jobs

Standings are refreshed via a scheduled GitHub Actions cron job.

The refresh script (database/scripts/refresh/refresh_standings.py):

- Fetches fresh standings from API-Football for all supported tournaments
- Calls PUT /api/v1/admin/standings/{tournament_id} with transformed data
- Backend deletes old standings rows and inserts new ones
- Cache entry for the tournament is invalidated after write
- Job result is logged to the refresh_jobs table

Required secrets (GitHub Actions):

- BACKEND_URL - environment level (Staging/Production differ)
- ADMIN_TOKEN - repository level
- API_FOOTBALL_API_KEY — repository level

---

## Error Handling

Errors should follow the standard response shape:

```json
{
    "error": {
        "status": 404,
        "code": "NOT_FOUND",
        "message": "Tournament not found"
    }
}
```

Rules:

- Known errors return controlled messages
- Unknown errors return generic 500 responses
- Unexpected exceptions are logged
- Sentry captures unexpected failures

---

## Security

Backend security rules:

- API-Football key stays backend-only
- CORS allows only known frontend origins
- SQL queries must be parameterized
- Sort/filter fields must be whitelisted
- Admin endpoints require token auth
- Secrets must never be logged

---

## Rate Limiting

Rate limiting protects the API and database from abuse.

Initial limits:

```txt
General endpoints: 100/min/IP
Standings endpoint: 60/min/IP
Search endpoint: 30/min/IP
Admin endpoints: 3/min/IP
```

Search input should also be debounced on the frontend.

Cache refresh cooldown is separate from request rate limiting.

---

## Observability

The backend should provide:

- Sentry exception reporting
- Request logging middleware
- Cache hit/miss/stale logs
- Background job logs
- Health endpoint for uptime monitoring

Request logs should include:

```txt
method
path
status_code
duration_ms
request_id
```

---

## Testing

Run all tests:

```bash
pytest
```

Run unit tests:

```bash
pytest tests/unit
```

Run integration tests:

```bash
pytest tests/integration
```

Run mutation tests:

```bash
mutmut run
mutmut results
```

Results found in: [Mutation Testing Reports](/backend/reports/mutation-testing.md)

---

## Formatting

Lint and format with Ruff:

```bash
ruff check .
ruff format .
```

Check without making changes:

```bash
ruff check --no-fix .
ruff format --check .
```

Configuration lives in:

```txt
pyproject.toml
```

---

## Dependency Management

After installing new packages:

```bash
python -m pip freeze > requirements.txt
```

Dev dependencies are managed separately:

```bash
pip install -r requirements-dev.txt
```

`requirements.txt` is used by local setup, Docker builds, CI, and deployment.
`requirements-dev.txt` is used by CI for linting, formatting, and testing tools.

The virtual environment itself is ignored by Git.
