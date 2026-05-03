# Soccer Tournament Dashboard · Database Schema · v1

## Overview

This document defines the v1 PostgreSQL schema for the Soccer Tournament Dashboard.  
It covers the eleven tables created in the initial Alembic migration, including the `tournament_teams` junction table used to resolve the M:N relationship between tournaments and teams.

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

| Column          | Type         | Description                   |
| --------------- | ------------ | ----------------------------- |
| id              | Integer (PK) | Auto-incrementing primary key |
| external_api_id | Integer      | API-Football ID               |
| first_name      | String       | First name                    |
| last_name       | String       | Last name                     |
| date_of_birth   | Date         | DOB                           |
| photo_url       | String       | Player image                  |
| nationality     | String       | Nationality                   |
| height          | Integer      | Height (cm)                   |

---

## Match Data

### matches

| Column          | Type         | Description                                             |
| --------------- | ------------ | ------------------------------------------------------- |
| id              | Integer (PK) | Auto-incrementing primary key                           |
| external_api_id | Integer      | API-Football ID                                         |
| tournament_id   | Integer (FK) | → tournaments.id                                        |
| team_a_id       | Integer (FK) | → teams.id                                              |
| team_b_id       | Integer (FK) | → teams.id                                              |
| kickoff_time    | DateTime     | UTC kickoff                                             |
| stage           | Enum         | group \| knockout \| other                              |
| group           | String       | Group label                                             |
| status          | Enum         | scheduled \| live \| finished \| postponed \| cancelled |
| venue           | String       | Stadium + city                                          |
| team_a_score    | Integer      | Goals                                                   |
| team_b_score    | Integer      | Goals                                                   |

**Note:** `goal_difference` is derived (not stored).

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

### player_stats

| Column         | Type         | Description                   |
| -------------- | ------------ | ----------------------------- |
| id             | Integer (PK) | Auto-incrementing primary key |
| player_id      | Integer (FK) | → players.id                  |
| team_id        | Integer (FK) | → teams.id                    |
| tournament_id  | Integer (FK) | → tournaments.id              |
| appearances    | Integer      | Matches played                |
| minutes_played | Integer      | Minutes                       |
| goals          | Integer      | Goals                         |
| assists        | Integer      | Assists                       |
| yellow_cards   | Integer      | Yellow cards                  |
| red_cards      | Integer      | Red cards                     |

---

## Junction Tables

### tournament_teams

| Column        | Type             | Description      |
| ------------- | ---------------- | ---------------- |
| tournament_id | Integer (FK, PK) | → tournaments.id |
| team_id       | Integer (FK, PK) | → teams.id       |
| group         | String           | Group assignment |

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

---

### refresh_jobs

| Column      | Type         | Description                   |
| ----------- | ------------ | ----------------------------- |
| id          | Integer (PK) | Auto-incrementing primary key |
| job_name    | String       | Job identifier                |
| status      | Enum         | running \| success \| failed  |
| started_at  | DateTime     | Start time                    |
| finished_at | DateTime     | End time                      |

---

## Relationships (Summary)

| From        | To           | Cardinality | Participation     | Resolved via                                 |
| ----------- | ------------ | ----------- | ----------------- | -------------------------------------------- |
| tournaments | teams        | M:N         | Partial / Partial | tournament_teams                             |
| tournaments | matches      | 1:N         | Partial / Total   | matches.tournament_id                        |
| tournaments | standings    | 1:N         | Partial / Total   | standings.tournament_id                      |
| tournaments | player_stats | 1:N         | Partial / Total   | player_stats.tournament_id                   |
| teams       | matches      | 1:N         | Partial / Total   | matches.team_a_id / team_b_id                |
| teams       | standings    | 1:N         | Partial / Total   | standings.team_id                            |
| teams       | player_stats | 1:N         | Partial / Total   | player_stats.team_id                         |
| teams       | match_events | 1:N         | Partial / Total   | match_events.team_id                         |
| players     | player_stats | 1:N         | Partial / Total   | player_stats.player_id                       |
| players     | match_events | 1:N         | Partial / Partial | match_events.player_id / secondary_player_id |
| matches     | match_events | 1:N         | Partial / Total   | match_events.match_id                        |
