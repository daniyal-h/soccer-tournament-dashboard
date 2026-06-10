# Team Profiles

## Feature Overview

The Team Profiles feature allows users to explore all teams participating in a selected tournament. Users can browse teams from a dedicated Teams page or navigate from standings and match cards to view tournament-specific team details.

Team profiles include group information, recent form, match history, and squad data. Historical tournaments display stored tournament squads, while active tournaments receive updated squad information through scheduled refresh jobs.

---

## User Story 1: Browse Tournament Teams

### User Story

As a user, I want to view all teams in a tournament so that I can explore participating countries.

### Acceptance Criteria

- A Teams page is available from the navigation bar.
- Teams shown match the currently selected tournament.
- Each team displays:
    - Team name
    - Team logo
    - Group
- Pre-tournament teams are sorted alphabetically.
- Active tournaments are sorted by:
    - Points
    - Goal difference
    - Goals scored
    - Alphabetical fallback
- Finished tournaments are sorted by tournament performance.
- Users can filter teams by group.
- Selecting a team opens its tournament profile.
- Team list updates when switching tournaments.

### Subtasks

- Create tournament teams API endpoint.
- Add repository query joining teams with tournament teams.
- Implement tournament-aware team sorting.
- Create team response schemas.
- Add backend unit and integration tests.
- Create frontend team API client.
- Create Teams page route.
- Create team list/card component.
- Add group filtering.
- Connect Teams page to tournament context.
- Add loading, empty, and error states.
- Add frontend tests.

---

## User Story 2: View Team Tournament Profile

### User Story

As a user, I want to view a team's tournament profile so that I can understand their tournament performance.

### Acceptance Criteria

- Users can open a dedicated team details page.
- Teams can be opened from:
    - Teams page
    - Standings
    - Match cards
- The page displays:
    - Team name
    - Team logo
    - Tournament group
- Group stage summary is displayed when available:
    - Points
    - Wins
    - Draws
    - Losses
    - Goal difference
- Recent form displays up to the last five completed matches.
- Form is displayed from the selected team's perspective as:
    - Win
    - Draw
    - Loss
- Invalid teams show an error state.

### Subtasks

- Create team details API endpoint.
- Add team details repository query.
- Add group summary retrieval.
- Add recent form calculation.
- Create team details response schema.
- Add backend tests.
- Create frontend team details API hook.
- Create Team Details page.
- Create team header component.
- Create group summary component.
- Create recent form component.
- Add navigation from standings rows.
- Add navigation from match cards.
- Add frontend tests.

---

## User Story 3: View Team Match History

### User Story

As a user, I want to view a team's matches so that I can follow their tournament journey.

### Acceptance Criteria

- Team profiles display all matches involving the selected team.
- Matches include:
    - Opponent
    - Date/time
    - Match status
    - Score when available
- Completed matches show results from the team's perspective.
- Upcoming matches remain visible.
- Matches are organized in expandable sections.
- Selecting a match opens the match details page.

### Subtasks

- Create team matches API endpoint.
- Add repository query filtering matches by team.
- Add team result calculation logic.
- Reuse existing match schemas where possible.
- Add backend tests.
- Create team matches API hook.
- Create matches accordion component.
- Reuse existing match display components where appropriate.
- Link matches to match details page.
- Add frontend tests.

---

## User Story 4: View Team Squad

### User Story

As a user, I want to view a team's squad so that I can see the players representing the team.

### Acceptance Criteria

- Team profiles display tournament-specific squads.
- Players are grouped by:
    - Goalkeepers
    - Defenders
    - Midfielders
    - Forwards
- Player cards display:
    - Photo
    - Name
    - Number (if available)
    - Position
- Additional player information is available through hover/tap:
    - Full name
    - Age
    - Nationality
    - Height (if available)
- Squad data is loaded from stored tournament data.
- No external API calls occur during user requests.

### Subtasks

- Implement player refresh service.
- Fetch active tournament squads using API-Football players/squads endpoint.
- Create historical tournament squad seed script using players/statistics endpoint.
- Implement player upsert logic.
- Implement team player relationship updates.
- Add refresh job tracking.
- Create team squad API endpoint.
- Add squad repository queries.
- Create player response schemas.
- Add backend tests.
- Create squad API hook.
- Create squad section component.
- Create position accordion components.
- Create reusable player card component.
- Create player hover/tap details component.
- Add frontend tests.

---

## User Story 5: Maintain Team Data Freshness

### User Story

As a user, I want team data to stay updated so that active tournaments display accurate squads.

### Acceptance Criteria

- Active tournament squads refresh automatically.
- Finished tournament squads remain static.
- Failed refresh attempts preserve existing data.
- Squad refresh history is tracked.
- Team pages continue loading from cached data if refreshes fail.

### Subtasks

- Add squad refresh job type.
- Add admin squad refresh endpoint.
- Configure scheduled squad refresh.
- Restrict refreshes to active/upcoming tournaments.
- Add refresh failure handling.
- Add caching strategy for team endpoints.
- Add refresh job tests.
- Add load tests for team endpoints.
