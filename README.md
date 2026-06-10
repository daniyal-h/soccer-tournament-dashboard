# Soccer Tournament Dashboard

**[Live Demo](https://soccer-tournament-dashboard.vercel.app)** · [Test Plan](docs/test-plan.md) · [Decisions](docs/decisions.md)

A tournament-agnostic soccer dashboard built with World Cup 2026 as the primary use case. Inspired by Fotmob and SofaScore. Features live match schedules, group standings, player stats, and a knockout bracket, all backed by a cached and monitored production deployment.

---

## Current Status

Core standings infrastructure, tournament selection, database seeding pipeline, refresh jobs, CI/CD, Dockerization, and production deployment are implemented. Match schedules, player statistics, and knockout visualization are currently under active development.

---

## Motivation

Apps like Fotmob and SofaScore are excellent but closed. I wanted to build something that solves the same problem from scratch: a clean, fast soccer dashboard that a fan would actually use during the World Cup. The architecture is tournament-agnostic by design, so any competition supported by API-Football can be loaded via the tournament selector. World Cup 2026 is the default.

This project was built to practice the full software development lifecycle: feature planning, CI/CD, containerized deployment, a comprehensive testing suite, and production monitoring.

---

## Tech Stack

| Layer             | Technology                                                                          |
| ----------------- | ----------------------------------------------------------------------------------- |
| Frontend          | React (TypeScript), deployed on Vercel                                              |
| Backend           | Python/FastAPI, deployed on Render via Docker                                       |
| Database          | PostgreSQL, Neon                                                                    |
| Containerization  | Docker + docker-compose                                                             |
| CI/CD             | GitHub Actions (lint, test, deploy on push to main)                                 |
| Error monitoring  | Sentry (frontend + backend)                                                         |
| Uptime monitoring | Better Stack · [Status Page](https://soccer-tournament-dashboard.betteruptime.com/) |
| External data     | API-Football (historical snapshots + scheduled refresh jobs)                        |

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

---

## Features

### Tournament Selection & Standings (completed)

A navbar dropdown allows users to switch between tournaments, defaulting to World Cup 2026. The selected tournament is persisted in `localStorage`, while all backend routes accept a `tournament_id` parameter to support a tournament-agnostic architecture. Standings are displayed in collapsible group cards, each containing a table ranked by FIFA tiebreaker rules (points, goal difference, goals scored). The top two teams are highlighted for advancement, and a pre-tournament zero state is shown before matches begin.

### Match Schedule & Details (completed)

The default homepage. Matches grouped by date, responsive grid layout (single column on mobile, 2 columns on desktop). Live matches auto-refresh only when an active match is in progress. All major events (goals, penalties, cards, substitutions, etc.) within a match can also be viewed by clicking on a match card within the schedule. Graceful fallback to cached data with a delay notice if the API is unavailable.

### Team Profile (in-progress)

Dedicated team page showing the squad, recent form (last 5 results as W/D/L indicators), tournament stats, and FIFA world ranking. Accessible from standings, match cards, and search results.

### Player Stats Leaderboard (planned)

Tournament-wide player rankings pre-seeded into PostgreSQL via a daily scheduled job. Sortable by goals, assists, and cards. Filterable by position and country. Hover (desktop) or tap (mobile) reveals a full player detail card.

### Global Search (planned)

Persistent search bar in the navbar. Searches teams and players from the PostgreSQL cache using full-text search (tsvector/tsquery). Filter chips for All, Teams, and Players. Debounced input to avoid unnecessary queries.

### Knockout Bracket (planned)

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
```

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
SENTRY_DSN=          # optional, leave empty to disable
ENVIRONMENT=development
VERSION=0.1.0
ADMIN_TOKEN=your_admin_token_here
```

#### Docker backend (`.env.docker`)

Used when running via Docker Compose:

```env
API_FOOTBALL_KEY=your_api_key_here
DATABASE_URL=postgresql://app_user:app_password@db:5432/app_db
ADMIN_TOKEN=your_admin_token_here
```

**Important:**

- `localhost` → when running backend locally
- `db` → when running inside Docker (service name)

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

5. Open the app

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8000](http://localhost:8000)
- API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health check: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health) - returns status, version, and DB/cache checks

---

### Seed historical tournament data

```powershell
.\database\scripts\seeds\seed-all.ps1
```

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

See [docs/test-plan.md](docs/test-plan.md) for the full strategy and live status.

| Type            | Tool           | Scope                                                             |
| --------------- | -------------- | ----------------------------------------------------------------- |
| Unit            | pytest         | Individual service functions, cache logic, ranking calculations   |
| Mutation        | mutmut         | Run incrementally after each function, 85 to 90% kill rate target |
| Integration     | pytest + HTTPX | Routes through service layer against a test database              |
| Acceptance      | Playwright     | End-to-end user journeys against the deployed app                 |
| Load            | k6             | Sustained traffic against core endpoints                          |
| Spike           | k6             | Sudden traffic surge simulating World Cup final kickoff           |
| Stress          | k6             | Find the breaking point under increasing load                     |
| Static analysis | SonarCloud     | Runs on every push via GitHub Actions                             |
| Contract        | Pact           | Frontend and backend contract verified independently              |

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

Every push to a feature branch runs linting and the full test suite via GitHub Actions. Merging to `main` triggers an automatic deployment to Render staging, awaiting promotion to production. Branch protection on `main` enforces passing CI before any merge.

```
feature branch → PR → CI (lint + test + SonarCloud) → merge to main → auto-deploy to staging → manual promotion to production
```

---

## Project Structure

```
soccer-tournament-dashboard/
  README.md
  docker-compose.yml
  docs/
    api/
    conventions/
    database/
    user-stories/

  frontend/
    src/
      api/
      assets/
      components/
      config/
      constants/
      context/
      hooks/
      lib/
      pages/
      services/
      styles/
      types/
      utils/


  backend/
    app/
      api/
        v1/
          routers/
          services/
          repositories/
      api/
      constants/
      core/
      middleware/
      models/
      schemas/
      utils/
      tests/

  database/
    constants/
    scripts/
      generators/
      refresh/
      seeds/
        generated/
        static/
        seed-all.ps1
```

---

## Key Design Decisions

Full reasoning in [docs/DECISIONS.md](docs/DECISIONS.md).

| Decision           | Choice                    | Reason                                                                                    |
| ------------------ | ------------------------- | ----------------------------------------------------------------------------------------- |
| Backend language   | Python/FastAPI            | Adds stack breadth alongside TypeScript frontend; Python used in prior co-op              |
| Database           | PostgreSQL                | NoSQL already on resume; relational experience fills the gap                              |
| Backend caching    | PostgreSQL response cache | Stays within API-Football free tier (100 requests/day) without sacrificing data freshness |
| Frontend caching   | TanStack Query            | Prevents unnecessary reloads during navigation while preserving controlled refetch logic  |
| Sorting            | Server-side via DB query  | Client-side sorting of a visible subset produces incorrect tournament-wide rankings       |
| Player data        | Daily seed job            | Fetching all 48 teams on demand would exhaust the free tier quota in a single page load   |
| Preference storage | localStorage              | Cookies are sent with every HTTP request, unnecessary overhead for a UI-only preference   |
| Branching          | Trunk-based development   | Continuous solo deployment makes a permanent dev branch overhead with no benefit          |

---

## Known Limitations and Future Improvements

- The knockout bracket cannot be tested against real progression data until July 4 when the knockout stage begins
- Player stats refresh daily rather than in real time, a paid API tier would allow more frequent updates
- No user authentication in the current version; saved preferences use localStorage only
- Head-to-head match history between teams is a natural next feature given the existing data model
- Standings refresh on a 1-minute cache TTL during live matches; there may be up to 1 minute of lag between a goal and the standings updating
