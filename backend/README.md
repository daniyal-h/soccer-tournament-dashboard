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
- Black
- isort

---

## Setup

Create and activate the virtual environment:

```bash
python -m venv venv
source venv/Scripts/activate
````

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

---

## Environment Variables

Create a `.env` file in `backend/` based on `.env.example`.

```env
API_FOOTBALL_KEY=your_api_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/soccer
SECRET_KEY=your_secret_key_here
SENTRY_DSN=your_sentry_dsn_here
REFRESH_JOB_TOKEN=your_refresh_job_token_here
```

Never commit `.env`.

---

## Project Structure

```txt
app/
  api/
    v1/
      routers/        versioned route handlers
      api.py          v1 router registration
  core/               config, database setup, shared app wiring
  models/             SQLAlchemy database models
  schemas/            Pydantic request/response schemas
  services/           business logic
  repositories/       database access logic
  main.py             FastAPI entry point

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
GET /api/v1/matches
GET /api/v1/standings
GET /api/v1/teams/{id}
GET /api/v1/search
GET /api/v1/players/leaderboard
```

Versioning keeps the API contract stable when future breaking changes are introduced.

---

## Layering Rules

Routes should stay thin.

```txt
routers → services → repositories → database
```

Guidelines:

* Routers handle HTTP concerns only
* Services contain business logic
* Repositories contain SQL/database queries
* Models define database tables
* Schemas define request/response shapes
* No database queries directly inside route handlers

---

## Database

PostgreSQL is used as the main database and cache layer.

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

---

## Caching

The backend caches API-Football responses in PostgreSQL.

Cache entries should include:

```txt
cache_key
payload
last_updated
expires_at
last_refresh_attempt
```

Rules:

* Fresh cache is returned immediately
* Stale cache triggers refresh when allowed
* If refresh fails, stale data may be returned with a warning
* Refresh cooldown prevents burning API-Football quota

---

## Background Jobs

Scheduled refresh jobs are handled through GitHub Actions cron.

Typical responsibilities:

* Refresh player statistics
* Refresh team data
* Refresh search index data
* Log success/failure

Manual refresh may be exposed through a protected admin endpoint:

```txt
POST /api/v1/admin/refresh-cache
```

This endpoint must require `REFRESH_JOB_TOKEN`.

---

## Error Handling

Errors should follow the standard response shape:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly message",
    "details": {}
  }
}
```

Rules:

* Known errors return controlled messages
* Unknown errors return generic 500 responses
* Unexpected exceptions are logged
* Sentry captures unexpected failures

---

## Security

Backend security rules:

* API-Football key stays backend-only
* CORS allows only known frontend origins
* SQL queries must be parameterized
* Sort/filter fields must be whitelisted
* Admin endpoints require token auth
* Secrets must never be logged

---

## Rate Limiting

Rate limiting protects the API and database from abuse.

Initial limits:

```txt
General endpoints: 100/min/IP
Search endpoint: 30/min/IP
Admin endpoints: 3/min/IP
```

Search input should also be debounced on the frontend.

Cache refresh cooldown is separate from request rate limiting.

---

## Observability

The backend should provide:

* Sentry exception reporting
* Request logging middleware
* Cache hit/miss/stale logs
* Background job logs
* Health endpoint for uptime monitoring

Request logs should include:

```txt
method
path
status_code
duration_ms
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

---

## Formatting

Format code with Black:

```bash
black .
```

Sort imports with isort:

```bash
isort .
```

Check formatting without changing files:

```bash
black --check .
isort --check-only .
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

`requirements.txt` is committed and used by:

* local setup
* CI
* Docker builds
* deployment

The virtual environment itself is ignored by Git.
