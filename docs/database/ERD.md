# Entity Relationship Diagram

Visual reference for the v1 PostgreSQL schema. All eleven current tables are shown with their columns, types, and key constraints.

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
    string display_name
    string first_name
    string last_name
    date date_of_birth
    string photo_url
    string nationality
    int height
  }

  tournament_teams {
    int tournament_id PK,FK
    int team_id PK,FK
    string group
    int final_rank
    string stage_reached
  }

  team_players {
    int tournament_id PK,FK
    int team_id PK,FK
    int player_id PK,FK
    int squad_number
    string position
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
    int team_a_penalties
    int team_b_penalties
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

  player_leaderboards {
    int id PK
    int tournament_id FK
    int team_id FK
    int player_id FK
    string category
    int rank
    int value
    int appearances
    int minutes_played
    decimal rating
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

  tournaments ||--o{ team_players     : "scopes"
  teams       ||--o{ team_players     : "registers"
  players     ||--o{ team_players     : "registered via"

  tournaments ||--o{ matches          : "hosts"
  teams       ||--o{ matches          : "plays in (A)"
  teams       ||--o{ matches          : "plays in (B)"

  tournaments ||--o{ standings        : "contains"
  teams       ||--o{ standings        : "appears in"

  tournaments ||--o{ player_leaderboards : "ranks"
  teams       ||--o{ player_leaderboards : "represents"
  players     ||--o{ player_leaderboards : "appears in"

  matches     ||--o{ match_events     : "contains"
  players     ||--o{ match_events     : "involves (primary)"
  players     ||--o{ match_events     : "involves (secondary)"
  teams       ||--o{ match_events     : "credited in"
```

## Relationship notes

| Relationship                       | Cardinality | Participation     | Notes                                                                                                                                          |
| ---------------------------------- | ----------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| tournaments → teams                | M:N         | Partial / Partial | Resolved via `tournament_teams`. `group` lives on the junction row.                                                                            |
| tournaments → players              | M:N         | Partial / Partial | Resolved via `team_players`. A player is always registered through a team.                                                                     |
| teams → players                    | M:N         | Partial / Partial | Resolved via `team_players`. `squad_number` and `position` live on the junction row — they are registration attributes, not player attributes. |
| tournaments → matches              | 1:N         | Partial / Total   | A new tournament has no matches yet. Every match must belong to a tournament.                                                                  |
| tournaments → standings            | 1:N         | Partial / Total   | Every standings row must reference a tournament.                                                                                               |
| tournaments → player_leaderboards  | 1:N         | Partial / Total   | Contains tournament-specific player leaderboard rows by category.                                                                              |
| teams → matches (A)                | 1:N         | Partial / Total   | Via `matches.team_a_id`.                                                                                                                       |
| teams → matches (B)                | 1:N         | Partial / Total   | Via `matches.team_b_id`. Two separate FK relationships on the same table.                                                                      |
| teams → standings                  | 1:N         | Partial / Total   | One row per team per tournament group.                                                                                                         |
| teams → player_leaderboards        | 1:N         | Partial / Total   | Captures which team a ranked player represented for the leaderboard entry.                                                                     |
| teams → match_events               | 1:N         | Partial / Total   | Every event is attributed to a team.                                                                                                           |
| players → player_leaderboards      | 1:N         | Partial / Total   | A player can exist with no leaderboard entries yet.                                                                                            |
| players → match_events (primary)   | 1:N         | Partial / Total   | `player_id` is always populated, every event has a primary actor.                                                                              |
| players → match_events (secondary) | 1:N         | Partial / Partial | `secondary_player_id` is nullable, only populated for substitutions and goal-linked assists.                                                   |
| matches → match_events             | 1:N         | Partial / Total   | A scheduled match has no events yet. Every event must reference a match.                                                                       |

## Infrastructure tables

`cache_entries` and `refresh_jobs` have no foreign key relationships. They are standalone infrastructure tables. `cache_entries` stores serialized API-Football responses keyed by a unique cache key, and `refresh_jobs` logs background job execution. See `ARCHITECTURE.md` for caching strategy details.
