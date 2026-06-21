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
API_FOOTBALL_API_KEY=your_api_football_api_key
```

### Docker environment (`.env.docker`)

Used when running via Docker Compose.

```env
DATABASE_URL=postgresql://app_user:app_password@db:5432/app_db
SENTRY_DSN=
ENVIRONMENT=development
VERSION=0.1.0
ADMIN_TOKEN=your_admin_token_here
API_FOOTBALL_API_KEY=your_api_football_api_key
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
      clients/          external API clients
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
GET /api/v1/tournaments
GET /api/v1/tournaments/{tournament_id}
GET /api/v1/tournaments/{tournament_id}/standings
GET /api/v1/tournaments/{tournament_id}/matches
GET /api/v1/matches/{match_id}
GET /api/v1/matches/{match_id}/events
GET /api/v1/tournaments/{tournament_id}teams/{team_id}
GET /api/v1/tournaments/{tournament_id}/teams/{team_id}/squad
GET /api/v1/tournaments/{tournament_id}teams/{team_id}/matches
GET /api/v1/tournaments/{tournament_id}/player-stats
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

The backend caches API responses in PostgreSQL to reduce repeated database work and protect the external API quota.

Cache entries include:

```txt
cache_key
payload
last_updated
expires_at
```

Rules:

- Fresh cache is returned immediately
- Cache miss queries the database or external source depending on the endpoint
- Stale cache can be returned with delayed metadata when refresh fails
- Live data uses shorter TTLs than scheduled or completed data
- Refresh jobs invalidate affected cache entries after writing new data

---

## Background Refresh Jobs

Tournament data refreshes are handled through protected backend admin endpoints.

External schedulers trigger refresh endpoints over HTTP. The backend handles API-Football communication, data transformation, database updates, cache invalidation, and refresh logging.

Refresh flow:

```txt
Scheduler
    ↓
Admin refresh endpoint
    ↓
Refresh service
    ↓
API-Football client
    ↓
Existing update service
    ↓
Repository/database layer
```

Available refresh endpoints:

```txt
POST /api/v1/admin/tournaments/refresh-standings
POST /api/v1/admin/tournaments/refresh-matches
POST /api/v1/admin/tournaments/refresh-match-events
POST /api/v1/admin/tournaments/refresh-team-rankings
POST /api/v1/admin/tournaments/refresh-player-data
```

Refresh services:

```txt
app/api/v1/services/
  refresh_standings.py
  refresh_matches.py
  refresh_match_events.py
  refresh_team_rankings.py
  refresh_player_data.py

app/api/v1/clients/
  football_api.py
```

The refresh process (general):

1. Finds refreshable tournaments based on tournament dates
2. Fetches updated data from API-Football
3. Converts external responses into internal schemas
4. Calls existing update services
5. Upserts database records
6. Invalidates affected caches
7. Stores refresh job results

Refresh responses include summaries:

```json
{
    "message": "Matches refresh completed",
    "tournaments_checked": 2,
    "tournaments_refreshed": 2,
    "tournaments_skipped": 0,
    "rows_processed": 128,
    "failures": []
}
```

Individual tournament failures do not stop the entire refresh job. Failed tournaments are recorded in the response summary while remaining tournaments continue processing.

Admin refresh endpoints require:

```txt
Authorization: Bearer <ADMIN_TOKEN>
```

The scheduler only triggers endpoints. It does not contain API-Football credentials or refresh logic.

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
- Refresh job execution logs
- Refresh summaries and failure tracking
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

##

Tests cover:

- Service business rules
- Repository/database queries
- API response transformations
- Cache hit and miss behavior
- Refresh job processing
- Error handling
- Security middleware

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

### Mutation Testing Report

Reports and analysis are stored in:

```txt
backend/reports/
```

---

## Load Testing

k6 is used for backend load, spike, rate-limit, and stress testing.

Load tests are organized by feature area:

```txt
load-tests/
  constants.js

  standings/
    normalTest.js
    spikeTest.js
    rateLimitTest.js
    stressTest.js

  schedule/
    normalScheduleTest.js
    normalMatchDetailTest.js
    spikeNavigationTest.js
    rateLimitEventsTest.js
    stressNavigationTest.js

  teams/
    normalTeamProfileTest.js
    stressTeamProfileTest.js
    teamNavigationSpikeTest.js
```

Shared load test values are defined in:

```txt
load-tests/constants.js
```

The constants file contains test identifiers such as the base URL, tournament ID, and match ID. Match-specific tests require a `MATCH_ID` that exists in the current seeded database. Likewise, team-specific tests require a `TEAM_ID`. If the database is reseeded, update the constants **before** rerunning the tests.

### Install k6

Windows:

```bash
winget install GrafanaLabs.k6
```

Verify installation:

```bash
k6 version
```

### Run Standings Load Tests

```bash
k6 run load-tests/standings/normalTest.js
k6 run load-tests/standings/spikeTest.js
k6 run load-tests/standings/rateLimitTest.js
k6 run load-tests/standings/stressTest.js
```

Run the remaining load tests for `Schedule` and `Teams` in the same way.

### Load Testing Reports

Reports and analysis are stored in:

```txt
backend/reports/
```

Current reports:

```txt
backend/reports/standings-load-testing.md
backend/reports/schedule-load-testing.md
backend/reports/teams-load-testing.md
```

### Notes

- Normal load tests remain below configured endpoint rate limits
- Spike and stress tests intentionally trigger HTTP 429 responses
- HTTP 429 responses are expected behaviour during overload scenarios
- Load tests run from one local IP, so rate-limit tests simulate repeated traffic from the same source
- Heavy stress testing should be performed locally against Dockerized PostgreSQL rather than hosted environments

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
