# Database

Seed scripts, refresh jobs, and database utilities for the Soccer Tournament Dashboard.

Static data is seeded manually via SQL files. Dynamic data (standings, matches, player stats) is kept current by scheduled refresh scripts that call the backend admin API.

---

## Structure

```txt
database/
  constants/
    tournaments.py      supported tournaments with local DB ids, API-Football ids, and seasons
  scripts/
    generators/         one-time scripts that generate SQL seed files from API-Football
    refresh/            scheduled scripts that refresh live data via the backend admin API
    seeds/              static SQL seed files (committed to version control)
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

Defined in `constants/tournaments.py` as a list of tuples:

```txt
(local_db_id, external_api_id, season)
```

All generators and refresh scripts iterate over this list. To add a new tournament, insert it into the DB first then add the tuple here.

---

## Seed Scripts

### Static seeds

SQL files in `scripts/seeds/` are committed to version control and run manually in Neon or any PostgreSQL client:

```txt
seeds/
  tournaments.sql     insert supported tournaments
```

Run order matters — tournaments must exist before teams, teams before standings.

### Generators

One-time scripts that fetch from API-Football and output SQL files to `scripts/seeds/generated/`. Run locally, review the output, then paste into Neon.

```bash
python database/scripts/generators/generate_teams_seed.py
python database/scripts/generators/generate_standings_seed.py
```

Generated files are gitignored — they are derived artifacts, not source of truth.

---

## Refresh Scripts

Scheduled scripts that keep live data current by calling the backend admin API directly.

```bash
python database/scripts/refresh/refresh_standings.py
```

The standings refresh script:

1. Iterates over all supported tournaments
2. Fetches fresh standings from API-Football
3. Transforms the response into the backend's expected shape
4. Calls `PUT /api/v1/admin/standings/{tournament_id}` on the backend
5. Backend writes new rows to DB and invalidates cache

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
