# Database

Seed generation tools and static tournament data for the Soccer Tournament Dashboard.

The database folder is responsible for creating and storing historical tournament snapshots. Runtime data refreshes are handled by the backend through admin refresh endpoints.

---

## Structure

```txt
database/
  constants/
    tournaments.py      supported tournaments with local DB ids, API-Football ids, and seasons

  scripts/
    generators/         one-time scripts that generate SQL seed files from API-Football

    seeds/
      generated/        temporary generated SQL artifacts (gitignored)

      static/           committed tournament snapshots
        global/         shared seed data
        static/         raw API-Football response archives

      seed-all.ps1      seeds all static SQL files into a target database

  utils/
    football_api_client.py       HTTP client for API-Football requests

  .env                  local environment variables (never committed)
  .env.example          template for required environment variables
```

---

## Environmental Variables

Used for generating static data.

```env
API_FOOTBALL_API_KEY=your_api_key_here
DATABASE_URL=postgresql://app_user:app_password@db:5432/app_db
```

---

## Generators

Generators fetch tournament data from API-Football and output SQL files to:

```txt
scripts/seeds/generated/
```

Generated files are gitignored because they are derived artifacts rather than source-of-truth data.

Run locally:

```bash
python database/scripts/generators/generate_teams_seed.py
python database/scripts/generators/generate_standings_seed.py
...
```

The standings generator outputs:

- `tournament_teams.sql`
- `standings.sql`

The remaining generators will output their own seeds.

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