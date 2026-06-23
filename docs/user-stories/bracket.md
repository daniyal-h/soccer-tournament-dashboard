# Bracket

## Feature Overview

The Bracket feature allows users to view the knockout stage progression for the selected tournament. The page focuses on displaying tournament matches by knockout round, including participating teams, scores, match status, and winners.

Bracket data is generated from stored tournament match data. Match refresh jobs keep active tournaments updated, so the bracket does not require separate API-Football requests or refresh processing.

---

## User Story 1: Retrieve Tournament Bracket Data

### User Story

As a user, I want tournament bracket data to load from stored matches so that I can view knockout progression without unnecessary external API calls.

### Acceptance Criteria

- A bracket API endpoint returns knockout matches for the selected tournament.
- Bracket data is derived from stored match records.
- API-Football is not called when loading bracket data.
- Matches are grouped by knockout stage:
    - Round of 32
    - Round of 16
    - Quarter Final
    - Semi Final
    - Third Place
    - Final
- Only knockout matches are included.
- Match ordering is deterministic within each stage.
- Each bracket match includes:
    - Match ID
    - Stage
    - Teams
    - Team logos
    - Scores
    - Penalties when available
    - Match status
    - Kickoff time
- Empty bracket data returns a valid empty response.
- Cached/stored data continues to display if match refresh fails.

### Subtasks

- Create bracket response schemas.
- Add repository query for tournament knockout matches.
- Add bracket service layer.
- Add statistics-independent cache key for bracket data.
- Add bracket API endpoint.
- Add backend unit tests.
- Add backend integration tests.

---

## User Story 2: View Tournament Bracket

### User Story

As a user, I want to view the tournament knockout bracket so that I can follow team progression through each round.

### Acceptance Criteria

- A Bracket page is available from the navigation bar.
- Bracket shown matches the currently selected tournament.
- Knockout rounds are displayed in tournament order.
- Each round displays its matches.
- Each match displays:
    - Competing teams
    - Team logos
    - Scores
    - Penalty results when applicable
    - Match status
- Completed matches clearly show the winner.
- Upcoming matches display scheduled information.
- Switching tournaments updates the bracket.
- Loading state is displayed while bracket data loads.
- Empty state is shown before knockout matches are available.
- Error state is shown when bracket data cannot be loaded.
- Layout works on desktop and mobile screens.

### Subtasks

- Create frontend bracket API client.
- Create bracket query hook.
- Create Bracket page route.
- Add Bracket navigation item.
- Create bracket round component.
- Create bracket match card component.
- Add winner highlighting.
- Add responsive horizontal bracket layout.
- Add loading skeleton.
- Add empty and error states.
- Add frontend tests.
