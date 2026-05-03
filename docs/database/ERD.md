# Entity Relationship Diagram

Visual reference for the v1 PostgreSQL schema. All eleven tables are shown with their columns, types, and key constraints.

```mermaid
erDiagram
  tournaments {
    int id PK
    int external_api_id
    string name
    string season
    string logo_url
    date start_date
    date end_date
  }

  teams {
    int id PK
    int external_api_id
    string name
    string short_name
    string type
    string logo_url
    string country
  }

  players {
    int id PK
    int external_api_id
    string first_name
    string last_name
    date date_of_birth
    string nationality
    int height
  }

  tournament_teams {
    int tournament_id PK,FK
    int team_id PK,FK
    string group
  }

  matches {
    int id PK
    int external_api_id
    int tournament_id FK
    int team_a_id FK
    int team_b_id FK
    datetime kickoff_time
    string stage
    string group
    string status
    string venue
    int team_a_score
    int team_b_score
  }

  standings {
    int id PK
    int tournament_id FK
    int team_id FK
    string group
    int position
    int points
    int wins
    int draws
    int losses
    int goals_for
    int goals_against
  }

  player_stats {
    int id PK
    int player_id FK
    int team_id FK
    int tournament_id FK
    int appearances
    int minutes_played
    int goals
    int assists
    int yellow_cards
    int red_cards
  }

  match_events {
    int id PK
    int match_id FK
    int player_id FK
    int secondary_player_id FK
    int team_id FK
    string event_type
    int minute
  }

  cache_entries {
    int id PK
    string cache_key UK
    text payload
    datetime last_updated
    datetime expires_at
  }

  refresh_jobs {
    int id PK
    string job_name
    string status
    datetime started_at
    datetime finished_at
  }

  tournaments ||--o{ tournament_teams : "registers in"
  teams       ||--o{ tournament_teams : "participates in"

  tournaments ||--o{ matches          : "hosts"
  teams       ||--o{ matches          : "plays in (A)"
  teams       ||--o{ matches          : "plays in (B)"

  tournaments ||--o{ standings        : "contains"
  teams       ||--o{ standings        : "appears in"

  tournaments ||--o{ player_stats     : "aggregates"
  teams       ||--o{ player_stats     : "accumulates"
  players     ||--o{ player_stats     : "accumulates"

  matches     ||--o{ match_events     : "contains"
  players     ||--o{ match_events     : "involves (primary)"
  players     ||--o{ match_events     : "involves (secondary)"
  teams       ||--o{ match_events     : "credited in"
```

## Relationship notes

| Relationship | Cardinality | Participation | Notes |
|---|---|---|---|
| tournaments → teams | M:N | Partial / Partial | Resolved via `tournament_teams` junction. `group` lives on the junction row. |
| tournaments → matches | 1:N | Partial / Total | A new tournament has no matches yet. Every match must belong to a tournament. |
| tournaments → standings | 1:N | Partial / Total | Every standings row must reference a tournament. |
| tournaments → player_stats | 1:N | Partial / Total | One stats row per player per tournament. |
| teams → matches (A) | 1:N | Partial / Total | Via `matches.team_a_id`. |
| teams → matches (B) | 1:N | Partial / Total | Via `matches.team_b_id`. Two separate FK relationships on the same table. |
| teams → standings | 1:N | Partial / Total | One row per team per tournament group. |
| teams → player_stats | 1:N | Partial / Total | Captures which team a player represented per tournament. |
| teams → match_events | 1:N | Partial / Total | Every event is attributed to a team. |
| players → player_stats | 1:N | Partial / Total | A player can exist with no stats yet. |
| players → match_events (primary) | 1:N | Partial / Total | `player_id` is always populated, every event has a primary actor. |
| players → match_events (secondary) | 1:N | Partial / Partial | `secondary_player_id` is nullable, only populated for substitutions and goal-linked assists. |
| matches → match_events | 1:N | Partial / Total | A scheduled match has no events yet. Every event must reference a match. |

## Infrastructure tables

`cache_entries` and `refresh_jobs` have no foreign key relationships. They are standalone infrastructure tables. `cache_entries` stores serialized API-Football responses keyed by a unique cache key, and `refresh_jobs` logs background job execution. See `ARCHITECTURE.md` for caching strategy details.