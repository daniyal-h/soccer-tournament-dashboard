# Statistics

## Feature Overview

The Statistics feature allows users to view top player leaderboards for the selected tournament. The page focuses on tournament-level player rankings for goals, assists, and yellow cards.

Statistics are loaded from stored leaderboard data. Historical tournaments use seeded static leaderboard data, while active tournaments are refreshed through scheduled background jobs. User requests do not call API-Football directly.

---

## User Story 1: View Player Leaderboards

### User Story

As a user, I want to view player leaderboards so that I can see the top performers in a tournament.

### Acceptance Criteria

- A Statistics page is available from the navigation bar.
- Statistics shown match the currently selected tournament.
- The page includes leaderboard tabs for:
    - Top Scorers
    - Top Assists
    - Yellow Cards
- Each leaderboard row displays:
    - Rank
    - Player name
    - Team
    - Player photo when available
    - Statistic value
- Leaderboards display the top 20 players per category.
- Switching tabs updates the displayed leaderboard.
- Switching tournaments updates the leaderboard data.
- Empty leaderboards show a clear empty state.

### Subtasks

- Create player leaderboard database table.
- Add leaderboard category enum.
- Add repository query for tournament leaderboard entries.
- Create leaderboard response schemas.
- Create statistics API endpoint.
- Add backend unit and integration tests.
- Create frontend statistics API client.
- Create Statistics page route.
- Add Statistics navigation item.
- Create leaderboard tab component.
- Create player leaderboard table/card component.
- Add loading, empty, and error states.
- Add frontend tests.

---

## User Story 2: Maintain Static Tournament Statistics

### User Story

As a user, I want historical tournament statistics to be available immediately so that I can view player rankings without waiting for live refreshes.

### Acceptance Criteria

- Historical tournament leaderboards are seeded into the database.
- Seeded data includes the top 20 players for:
    - Goals
    - Assists
    - Yellow cards
- Seed scripts use API-Football leaderboard endpoints.
- Seeded data is stored in a normalized leaderboard table.
- Re-running the seed is idempotent.
- No duplicate leaderboard rows are created.
- Historical tournament data is not refreshed daily.

### Subtasks

- Implement leaderboard seed script.
- Fetch top scorers endpoint data.
- Fetch top assists endpoint data.
- Fetch yellow cards endpoint data.
- Implement shared API response processor.
- Upsert players from leaderboard payloads.
- Upsert leaderboard entries by tournament, category, and player.
- Add seed script tests.
- Document seed workflow.

---

## User Story 3: Refresh Active Tournament Statistics

### User Story

As a user, I want active tournament statistics to stay updated so that leaderboards reflect recent matches.

### Acceptance Criteria

- Active tournament leaderboards refresh automatically.
- Refresh uses one API-Football call per leaderboard category.
- Refresh runs only for active or relevant upcoming tournaments.
- Finished tournaments remain static.
- Failed refresh attempts preserve existing leaderboard data.
- Refresh job history is tracked.
- The frontend continues showing cached/stored data if refresh fails.

### Subtasks

- Add player leaderboard refresh job type.
- Add admin leaderboard refresh endpoint.
- Configure scheduled leaderboard refresh.
- Restrict refreshes to active tournaments.
- Reuse shared leaderboard response processor.
- Add refresh failure handling.
- Add refresh job tests.
- Add cache invalidation for statistics endpoint.
- Add load tests for statistics endpoint.
