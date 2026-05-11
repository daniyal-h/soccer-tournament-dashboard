# Tournament Selection & Standings

## Feature Overview

A navbar dropdown allows users to switch between tournaments, defaulting to World Cup 2026. The selected tournament is persisted in `localStorage`, while all backend routes accept a `tournament_id` parameter to support a tournament-agnostic architecture. Standings are displayed in collapsible group cards, each containing a table ranked by FIFA tiebreaker rules (points, goal difference, goals scored). The top two teams are highlighted for advancement, and a pre-tournament zero state is shown before matches begin.

---

# User Stories

## 1. Tournament Selection

### User Story

As a user, I want to select a tournament so that I can view data specific to that competition.

### Acceptance Criteria

- A tournament dropdown exists in the navbar.
- The dropdown displays available tournaments.
- World Cup 2026 is selected by default on first visit.
- Changing the selected tournament updates displayed standings.
- Invalid tournaments cannot be selected.

### Subtasks

- Create tournament selector component.
- Create tournament API endpoint.
- Fetch available tournaments from backend.
- Add global tournament state management.
- Connect standings view to selected tournament.
- Add loading and error states.
- Add unit tests for selector behavior.

---

## 2. Tournament Preference Persistence

### User Story

As a user, I want my selected tournament to persist across sessions so that I do not need to reselect it every visit.

### Acceptance Criteria

- Selected tournament is stored in `localStorage`.
- Refreshing the page restores the previously selected tournament.
- If no saved value exists, the app defaults to World Cup 2026.
- Invalid or outdated saved values fall back safely to the default tournament.

### Subtasks

- Implement `localStorage` persistence utility.
- Restore tournament state during app initialization.
- Add fallback validation for invalid tournament IDs.
- Add tests for persistence behavior.

---

## 3. Group Standings Display

### User Story

As a user, I want to view group standings so that I can see team rankings.

### Acceptance Criteria

- Standings are grouped by tournament group.
- Each group is displayed inside a collapsible card.
- Each standings table displays:
  - Position
  - Team
  - Points
  - Wins
  - Draws
  - Losses
  - Goals For
  - Goals Against
  - Goal Difference
- Teams are ordered correctly by ranking rules.
- The top two teams are visually highlighted.

### Subtasks

- Create standings API endpoint.
- Create standings repository query.
- Implement standings service layer.
- Build collapsible group card component.
- Build standings table component.
- Add ranking sort logic.
- Add advancement highlighting styles.
- Add loading skeleton state.
- Add responsive/mobile layout support.
- Add unit tests for standings rendering.

---

## 4. Accurate Standings Ranking

### User Story

As a user, I want standings to reflect real tournament data so that rankings are accurate.

### Acceptance Criteria

- Standings reflect the latest stored tournament data.
- Teams are ranked by:
  1. Points
  2. Goal Difference
  3. Goals Scored
- Rankings update after match results change.
- Cached standings refresh correctly after data synchronization jobs.

### Subtasks

- Implement standings ranking logic.
- Add standings refresh/update service.
- Integrate cache invalidation behavior.
- Connect standings updates to background refresh jobs.
- Add integration tests for ranking correctness.
- Add tests for standings refresh behavior.

---

## 5. Pre-Tournament Zero State

### User Story

As a user, I want a pre-tournament state so that the UI is usable before matches begin.

### Acceptance Criteria

- Groups display even before matches are played.
- Teams appear with zeroed statistics before kickoff.
- Empty standings do not crash or break the layout.
- A clear pre-tournament message or indicator is displayed.
- Advancement highlighting is disabled before standings exist.

### Subtasks

- Seed tournament groups before match data exists.
- Create zero-state standings mapper.
- Add pre-tournament UI state.
- Add conditional advancement highlighting logic.
- Add tests for empty/pre-tournament rendering.