# Soccer Tournament Dashboard

**[Live Demo](https://soccer-tournament-dashboard.vercel.app)** · [Architecture](docs/architecture.md) · [Test Plan](docs/test-plan.pdf) · [Decisions](docs/decisions.md)

A tournament-agnostic soccer dashboard built with World Cup 2026 as the primary use case. Inspired by Fotmob and SofaScore. Features live match schedules, group standings, player stats, and a knockout bracket, all backed by a cached and monitored production deployment.

---

## Motivation

Apps like Fotmob and SofaScore are excellent but closed. I wanted to build something that solves the same problem from scratch: a clean, fast soccer dashboard that a fan would actually use during the World Cup. The architecture is tournament-agnostic by design, so any competition supported by API-Football can be loaded via the tournament selector. World Cup 2026 is the default.

This project was built to practice the full software development lifecycle: feature planning, CI/CD, containerized deployment, a comprehensive testing suite, and production monitoring.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (TypeScript), deployed on Vercel |
| Backend | Python/FastAPI, deployed on Render via Docker |
| Database | PostgreSQL, Render managed |
| Containerization | Docker + docker-compose |
| CI/CD | GitHub Actions (lint, test, deploy on push to main) |
| Error monitoring | Sentry (frontend + backend) |
| Uptime monitoring | Better Uptime |
| External data | API-Football (responses cached in PostgreSQL) |

---

## Architecture

```
User (browser)
      |
      | HTTPS
      v
Frontend: React (Vercel)
      |
      | REST API calls
      v
Backend: FastAPI (Render, Docker)
      |              |
      | SQL          | API key via env var
      v              v
PostgreSQL      API-Football
(cache layer)   (external data source)
```

The API key never leaves the backend. The frontend is entirely agnostic to the data source and calls only the FastAPI backend over HTTP. Switching from the free to paid API tier requires a single environment variable change and no code modifications.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full breakdown.

---

## Features

### Tournament Selector
A navbar dropdown to switch between tournaments. Defaults to World Cup 2026. Preference saved in localStorage. Every backend route accepts a `tournament_id` parameter, making the full stack tournament-agnostic.

### Match Schedule
The default homepage. Matches grouped by date, responsive grid layout (single column on mobile, 2 to 3 columns on desktop). Live matches auto-refresh only when an active match is in progress. Graceful fallback to cached data with a delay notice if the API is unavailable.

### Group Standings
Collapsible group cards for all 12 World Cup groups. Each card shows a standings table ranked by FIFA tiebreaker order (points, goal difference, goals scored). Top 2 teams highlighted for advancement. Pre-tournament zero state displayed before the tournament begins.

### Team Profile
Dedicated team page showing the squad, recent form (last 5 results as W/D/L indicators), tournament stats, and FIFA world ranking. Accessible from standings, match cards, and search results.

### Player Stats Leaderboard
Tournament-wide player rankings pre-seeded into PostgreSQL via a daily scheduled job. Sortable by goals, assists, and cards. Filterable by position and country. Hover (desktop) or tap (mobile) reveals a full player detail card.

### Global Search
Persistent search bar in the navbar. Searches teams and players from the PostgreSQL cache using full-text search (tsvector/tsquery). Filter chips for All, Teams, and Players. Debounced input to avoid unnecessary queries.

### Knockout Bracket
Visual bracket from Round of 16 through to the Final. Renders placeholder slots before July 4 when the knockout stage begins, then populates with real data as matches are played.

---

## Running Locally

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- An [API-Football](https://www.api-football.com/) API key (free tier)

---

### Setup

1. Clone the repository

```bash
git clone https://github.com/daniyal-h/soccer-tournament-dashboard.git
cd soccer-tournament-dashboard
````

---

2. Create environment files

```bash
cp backend/.env.example backend/.env
cp backend/.env.example backend/.env.docker
```

---

3. Configure environment variables

#### Local backend (`.env`)

Used when running the backend directly (e.g. `uvicorn`):

```env
API_FOOTBALL_KEY=your_api_key_here
DATABASE_URL=postgresql://app_user:app_password@localhost:5432/app_db
SECRET_KEY=your_secret_key_here
```

#### Docker backend (`.env.docker`)

Used when running via Docker Compose:

```env
API_FOOTBALL_KEY=your_api_key_here
DATABASE_URL=postgresql://app_user:app_password@db:5432/app_db
SECRET_KEY=your_secret_key_here
```

**Important:**

* `localhost` → when running backend locally
* `db` → when running inside Docker (service name)

---

4. Start the full stack

```bash
docker compose up --build
```

Detached mode (optional):

```bash
docker compose up -d --build
```

---

5. Apply database migrations

In a separate terminal:

```bash
cd backend
alembic upgrade head
```

---

6. Open the app

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend API: [http://localhost:8000](http://localhost:8000)
* API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
* Health check: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

### Verify database setup (optional)

```bash
docker exec -it postgres_db psql -U app_user -d app_db
\dt
```

You should see all application tables.

---

### Stopping the stack

```bash
docker compose down
```

To also remove database data:

```bash
docker compose down -v
```

---

## Testing

See [docs/TEST-PLAN.md](docs/TEST-PLAN.md) for the full strategy and live status.

| Type | Tool | Scope |
|---|---|---|
| Unit | pytest | Individual service functions, cache logic, ranking calculations |
| Mutation | mutmut | Run incrementally after each function, 85 to 90% kill rate target |
| Integration | pytest + HTTPX | Routes through service layer against a test database |
| Acceptance | Playwright | End-to-end user journeys against the deployed app |
| Load | k6 | Sustained traffic against core endpoints |
| Spike | k6 | Sudden traffic surge simulating World Cup final kickoff |
| Stress | k6 | Find the breaking point under increasing load |
| Static analysis | SonarCloud | Runs on every push via GitHub Actions |
| Contract | Pact | Frontend and backend contract verified independently |

Run the backend test suite:

```bash
docker-compose exec backend pytest
```

Run mutation tests:

```bash
docker-compose exec backend mutmut run
mutmut results
```

---

## CI/CD Pipeline

Every push to a feature branch runs linting and the full test suite via GitHub Actions. Merging to `main` triggers an automatic deployment to Render. Branch protection on `main` enforces passing CI before any merge.

```
feature branch → PR → CI (lint + test + SonarCloud) → merge → deploy to Render
```

---

## Project Structure

```
soccer-tournament-dashboard/
  README.md
  docker-compose.yml
  docs/
    ARCHITECTURE.md
    TEST-PLAN.md
    DECISIONS.md
  frontend/
    src/
      components/
      pages/
      hooks/
  backend/
    app/
      routers/
      services/
      repositories/
      models/
    tests/
      unit/
      integration/
```

---

## Key Design Decisions

Full reasoning in [docs/DECISIONS.md](docs/DECISIONS.md).

| Decision | Choice | Reason |
|---|---|---|
| Backend language | Python/FastAPI | Adds stack breadth alongside TypeScript frontend; Python used in prior co-op |
| Database | PostgreSQL | NoSQL already on resume; relational experience fills the gap |
| Caching strategy | PostgreSQL response cache | Stays within API-Football free tier (100 requests/day) without sacrificing data freshness |
| Sorting | Server-side via DB query | Client-side sorting of a visible subset produces incorrect tournament-wide rankings |
| Player data | Daily seed job | Fetching all 48 teams on demand would exhaust the free tier quota in a single page load |
| Preference storage | localStorage | Cookies are sent with every HTTP request, unnecessary overhead for a UI-only preference |
| Branching | Trunk-based development | Continuous solo deployment makes a permanent dev branch overhead with no benefit |

---

## Known Limitations and Future Improvements

- The knockout bracket cannot be tested against real progression data until July 4 when the knockout stage begins
- Player stats refresh daily rather than in real time, a paid API tier would allow more frequent updates
- No user authentication in the current version; saved preferences use localStorage only
- Head-to-head match history between teams is a natural next feature given the existing data model
