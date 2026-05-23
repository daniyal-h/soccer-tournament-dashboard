# Database

Seed scripts, refresh jobs, and database utilities for the Soccer Tournament Dashboard.

Static data is seeded manually via SQL files. Dynamic data (standings, matches, player stats) is kept current by scheduled refresh scripts that call the backend admin API.

---

## Structure

```txt
database/
  constants/
    tournaments.py      supported tournaments with local DB ids, API-Football ids, seasons, and end dates

  scripts/
    generators/         one-time scripts that generate SQL seed files from API-Football

    refresh/            scheduled scripts that refresh live data via the backend admin API

    seeds/
      generated/        temporary generated SQL artifacts (gitignored)
      static/           committed historical tournament snapshots
      seed-all.ps1      seeds all static SQL files into a target database

  utils/
    api_client.py       shared HTTP client for API-Football and backend admin requests

  .env                  local environment variables (never committed)
  .env.example          template for required environment variables
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
API_FOOTBALL_API_KEY=your_api_football_key_here
BACKEND_URL=http://localhost:8000
ADMIN_TOKEN=your_admin_token_here
```

- `API_FOOTBALL_API_KEY` — used by generators and refresh scripts to fetch data
- `BACKEND_URL` — backend to send refresh data to (local or deployed)
- `ADMIN_TOKEN` — must match the `ADMIN_TOKEN` set in the backend

---

## Supported Tournaments

Defined in `constants/tournaments.py` as tuples:

```txt
(local_db_id, external_api_id, season, end_date)
```

- `local_db_id` — internal DB id used by backend/admin routes
- `external_api_id` — API-Football league id
- `season` — tournament season/year
- `end_date` — used by refresh jobs to stop polling concluded tournaments

All generators and refresh scripts iterate over this list.

---

## Seed Scripts

### Static Seeds

Historical tournament snapshots are committed to version control under:

```txt
scripts/seeds/static/
```

Structure is organized by tournament:

```txt
static/
  global/
    tournaments.sql

  world-cup-2022/
    01-teams.sql
    02-tournament-teams.sql
    03-standings.sql
```

Files are executed in numeric order due to FK dependencies.

### Generators

### Generators

Generators fetch tournament data from API-Football and output SQL files to:

```txt
scripts/seeds/generated/
```

Generated files are gitignored because they are derived artifacts rather than source-of-truth data.

Run locally:

```bash
python database/scripts/generators/generate_teams_seed.py
python database/scripts/generators/generate_standings_seed.py
```

The standings generator outputs:

- `tournament_teams.sql`
- `standings.sql`

After verifying generated output locally, promote stable snapshots into `scripts/seeds/static/`.

---

## Seeding Databases

### Local Docker Database

Seed all committed static data:

```powershell
.\database\scripts\seeds\seed-all.ps1
```

### Remote PostgreSQL / Neon

Install PostgreSQL client tools (`psql`) and set `DATABASE_URL` in `database/.env`.

The same script automatically switches to direct PostgreSQL mode when the connection string is not a local Docker Compose database.

---

## Refresh Scripts

Scheduled scripts that keep live data current by calling the backend admin API directly. Finished tournaments are skipped automatically using the configured `end_date`.

```bash
python database/scripts/refresh/refresh_standings.py
```

The standings refresh script:

1. Iterates over all supported tournaments
2. Fetches fresh standings from API-Football
3. Transforms the response into the backend's expected shape
4. Calls `PUT /api/v1/admin/standings/{tournament_id}` on the backend
5. Backend upserts standings rows and invalidates cache

---

## GitHub Actions

Refresh scripts run on a cron schedule via `.github/workflows/refresh.yml`.

Required secrets:

| Secret                 | Scope       | Description                            |
| ---------------------- | ----------- | -------------------------------------- |
| `API_FOOTBALL_API_KEY` | Repository  | API-Football key                       |
| `ADMIN_TOKEN`          | Repository  | Admin token matching backend           |
| `BACKEND_URL`          | Environment | Differs between Staging and Production |

Trigger manually via `workflow_dispatch` to test before relying on the schedule.
