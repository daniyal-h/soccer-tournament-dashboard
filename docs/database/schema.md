# Soccer Tournament Dashboard · Database Schema · v1

## Overview

This document defines the v1 PostgreSQL schema for the Soccer Tournament Dashboard.  
It covers the eleven current tables in the schema, including two junction tables: `tournament_teams` and `team_players`.

All timestamps are stored in UTC.

---

## Core Data

### tournaments

| Column          | Type         | Description                                |
| --------------- | ------------ | ------------------------------------------ |
| id              | Integer (PK) | Auto-incrementing primary key              |
| external_api_id | Integer      | API-Football ID                            |
| name            | String       | Tournament name (e.g. FIFA World Cup 2026) |
| season          | String       | Season identifier (e.g. 2026)              |
| logo_url        | String       | Logo image URL                             |
| start_date      | Date         | Start date                                 |
| end_date        | Date         | End date                                   |

---

### teams

| Column          | Type         | Description                   |
| --------------- | ------------ | ----------------------------- |
| id              | Integer (PK) | Auto-incrementing primary key |
| external_api_id | Integer      | API-Football ID               |
| name            | String       | Full team name                |
| short_name      | String       | Abbreviation (e.g. ENG, BRA)  |
| type            | Enum         | national \| club              |
| logo_url        | String       | Team crest                    |
| country         | String       | Country                       |

---

### players

| Column          | Type         | Description                              |
| --------------- | ------------ | ---------------------------------------- |
| id              | Integer (PK) | Auto-incrementing primary key            |
| external_api_id | Integer      | API-Football ID                          |
| display_name    | String       | Preferred display name from API-Football |
| first_name      | String       | First name, nullable when unavailable    |
| last_name       | String       | Last name, nullable when unavailable     |
| date_of_birth   | Date         | DOB, nullable when unavailable           |
| photo_url       | String       | Player image                             |
| nationality     | String       | Nationality                              |
| height          | Integer      | Height (cm)                              |

---

## Match Data

### matches

| Column           | Type         | Description                                             |
| ---------------- | ------------ | ------------------------------------------------------- |
| id               | Integer (PK) | Auto-incrementing primary key                           |
| external_api_id  | Integer      | API-Football ID                                         |
| tournament_id    | Integer (FK) | → tournaments.id                                        |
| team_a_id        | Integer (FK) | → teams.id                                              |
| team_b_id        | Integer (FK) | → teams.id                                              |
| kickoff_time     | DateTime     | UTC kickoff                                             |
| stage            | Enum         | group \| knockout \| other                              |
| group            | String       | Group label                                             |
| status           | Enum         | scheduled \| live \| finished \| postponed \| cancelled |
| venue            | String       | Stadium + city                                          |
| team_a_score     | Integer      | Goals                                                   |
| team_b_score     | Integer      | Goals                                                   |
| team_a_penalties | Integer      | Team A penalty shootout score, nullable                 |
| team_b_penalties | Integer      | Team B penalty shootout score, nullable                 |

**Notes:**

- `matches_played` and `goal_difference` are derived (not stored).
- The `knockout bracket` is not stored separately. It is derived from match rows using knockout-stage metadata, scores, penalty scores, and match status.

---

### standings

| Column        | Type         | Description                   |
| ------------- | ------------ | ----------------------------- |
| id            | Integer (PK) | Auto-incrementing primary key |
| tournament_id | Integer (FK) | → tournaments.id              |
| team_id       | Integer (FK) | → teams.id                    |
| group         | String       | Group label                   |
| position      | Integer      | Rank (denormalized)           |
| points        | Integer      | Points                        |
| wins          | Integer      | Wins                          |
| draws         | Integer      | Draws                         |
| losses        | Integer      | Losses                        |
| goals_for     | Integer      | Goals scored                  |
| goals_against | Integer      | Goals conceded                |

---

### match_events

| Column              | Type         | Description                                                                                           |
| ------------------- | ------------ | ----------------------------------------------------------------------------------------------------- |
| id                  | Integer (PK) | Auto-incrementing primary key                                                                         |
| match_id            | Integer (FK) | → matches.id                                                                                          |
| player_id           | Integer (FK) | Primary player                                                                                        |
| secondary_player_id | Integer (FK) | Secondary player (nullable)                                                                           |
| team_id             | Integer (FK) | → teams.id                                                                                            |
| event_type          | Enum         | goal \| own_goal \| penalty_goal \| penalty_miss \| assist \| yellow_card \| red_card \| substitution |
| minute              | Integer      | Match minute                                                                                          |

---

## Player Data

### player_leaderboards

Stores tournament-specific player leaderboard rows for the Statistics page. The table is intentionally leaderboard-focused rather than a full per-player statistics table. Supported categories are `goals`, `assists`, and `yellow_cards`.

Each row represents one player's ranking in one category for one tournament. The `(tournament_id, category, player_id)` combination is unique so refreshes can upsert leaderboard rows idempotently.

| Column         | Type         | Description                                      |
| -------------- | ------------ | ------------------------------------------------ |
| id             | Integer (PK) | Auto-incrementing primary key                    |
| tournament_id  | Integer (FK) | → tournaments.id                                 |
| team_id        | Integer (FK) | → teams.id                                       |
| player_id      | Integer (FK) | → players.id                                     |
| category       | Enum         | goals \| assists \| yellow_cards                 |
| rank           | Integer      | Rank within the selected leaderboard category    |
| value          | Integer      | Category value, such as goals, assists, or cards |
| appearances    | Integer      | Matches played (nullable)                        |
| minutes_played | Integer      | Minutes played (nullable)                        |
| rating         | Numeric      | API-Football player rating, if provided          |

---

## Junction Tables

### tournament_teams

Resolves the M:N relationship between tournaments and teams. A team's group assignment is stored here because it is a property of the registration, not of the team itself.

| Column        | Type             | Description                                                                 |
| ------------- | ---------------- | --------------------------------------------------------------------------- |
| tournament_id | Integer (FK, PK) | → tournaments.id                                                            |
| team_id       | Integer (FK, PK) | → teams.id                                                                  |
| group         | String           | Group assignment                                                            |
| final_rank    | Integer          | Final tournament placement, nullable until known                            |
| stage_reached | Enum/String      | Furthest stage reached: group, R32, R16, QF, SF, third_place, final, winner |

---

### team_players

Resolves the M:N relationship between teams and players, scoped per tournament. A player's squad number and position are stored here because they are properties of the registration, not permanent attributes of the player.

The three-column composite PK is intentional: the same player can be registered to different teams across different tournaments (e.g. club vs national team).

| Column        | Type             | Description                        |
| ------------- | ---------------- | ---------------------------------- |
| tournament_id | Integer (FK, PK) | → tournaments.id                   |
| team_id       | Integer (FK, PK) | → teams.id                         |
| player_id     | Integer (FK, PK) | → players.id                       |
| squad_number  | Integer          | Shirt number (nullable)            |
| position      | Enum             | GK \| DEF \| MID \| FWD (nullable) |

---

## Infrastructure

### cache_entries

| Column       | Type            | Description                   |
| ------------ | --------------- | ----------------------------- |
| id           | Integer (PK)    | Auto-incrementing primary key |
| cache_key    | String (Unique) | Cache identifier              |
| payload      | Text            | JSON response                 |
| last_updated | DateTime        | Last write                    |
| expires_at   | DateTime        | Expiry                        |

**Note:** `cache_entries` stores serialized endpoint responses keyed by feature-specific cache keys.

---

### refresh_jobs

| Column      | Type         | Description                   |
| ----------- | ------------ | ----------------------------- |
| id          | Integer (PK) | Auto-incrementing primary key |
| job_name    | String       | Job identifier                |
| status      | Enum         | running \| success \| failed  |
| started_at  | DateTime     | Start time                    |
| finished_at | DateTime     | End time                      |

**Note:** `refresh_jobs` logs background refresh execution status.

---

## Relationships (Summary)

| From        | To                  | Cardinality | Participation     | Resolved via                                 |
| ----------- | ------------------- | ----------- | ----------------- | -------------------------------------------- |
| tournaments | teams               | M:N         | Partial / Partial | tournament_teams                             |
| tournaments | players             | M:N         | Partial / Partial | team_players                                 |
| tournaments | matches             | 1:N         | Partial / Total   | matches.tournament_id                        |
| tournaments | standings           | 1:N         | Partial / Total   | standings.tournament_id                      |
| tournaments | player_leaderboards | 1:N         | Partial / Total   | player_leaderboards.tournament_id            |
| teams       | players             | M:N         | Partial / Partial | team_players                                 |
| teams       | matches             | 1:N         | Partial / Total   | matches.team_a_id / team_b_id                |
| teams       | standings           | 1:N         | Partial / Total   | standings.team_id                            |
| teams       | player_leaderboards | 1:N         | Partial / Total   | player_leaderboards.team_id                  |
| teams       | match_events        | 1:N         | Partial / Total   | match_events.team_id                         |
| players     | player_leaderboards | 1:N         | Partial / Total   | player_leaderboards.player_id                |
| players     | match_events        | 1:N         | Partial / Partial | match_events.player_id / secondary_player_id |
| matches     | match_events        | 1:N         | Partial / Total   | match_events.match_id                        |
