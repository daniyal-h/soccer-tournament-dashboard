# Team Profiles

## Feature Overview

The Team Profiles feature allows users to explore all teams participating in a tournament and view detailed tournament-specific information. Users can browse teams from a dedicated Teams page or navigate directly from standings and match cards.

Team pages provide a complete tournament overview including group information, recent form, match history, and squad details. Team data is tournament-specific, allowing historical tournaments to display their original squads and results while active tournaments update through scheduled refresh jobs.

---

## User Story 1: Browse Tournament Teams

### User Story

As a user, I want to view all teams in a tournament so that I can explore the participating countries.

### Acceptance Criteria

- Users can access a Teams page from the navigation bar.
- Teams displayed match the currently selected tournament.
- Each team displays:
    - Team name
    - Team logo
    - Group
- Pre-tournament teams are sorted alphabetically.
- Active tournaments are sorted by current tournament performance:
    - Points
    - Goal difference
    - Goals scored
    - Alphabetical fallback
- Finished tournaments are sorted by final tournament performance.
- Users can filter teams by group.
- Selecting a team opens the team details page.
- Changing tournaments updates the team list.

### Technical Notes

- Retrieve teams from `teams` and `tournament_teams`.
- Use existing standings and match data for tournament-aware ordering.
- Group filtering is handled client-side since tournament team counts are small.

---

## User Story 2: View Team Tournament Profile

### User Story

As a user, I want to view a team's tournament profile so that I can understand their performance and progression.

### Acceptance Criteria

- Each team has a dedicated details page.
- The page displays:
    - Team name
    - Team logo
    - Tournament group
    - Group stage summary when available
- The group summary displays:
    - Points
    - Wins
    - Draws
    - Losses
    - Goal difference
- The page displays recent form using the team's latest completed matches.
- Form displays up to the last five results:
    - Win
    - Draw
    - Loss
- Team pages handle unavailable tournament data gracefully.

### Technical Notes

- Retrieve team identity from `teams` and `tournament_teams`.
- Retrieve group summary from existing standings data.
- Calculate recent form using tournament matches.

---

## User Story 3: View Team Matches

### User Story

As a user, I want to view a team's tournament matches so that I can follow their tournament journey.

### Acceptance Criteria

- Team pages display all matches involving the selected team.
- Matches include:
    - Opponent
    - Match date
    - Match status
    - Score when available
- Completed matches show the result from the selected team's perspective.
- Upcoming matches remain visible.
- Matches are displayed in expandable sections.
- Selecting a match opens the match details page.

### Technical Notes

- Retrieve matches from existing match data.
- Filter matches where the selected team appears as either participant.
- Reuse existing match status and result logic.

---

## User Story 4: View Team Squad

### User Story

As a user, I want to view a team's tournament squad so that I can see the players representing the team.

### Acceptance Criteria

- Team pages display tournament-specific squad data.
- Players are grouped by position:
    - Goalkeepers
    - Defenders
    - Midfielders
    - Forwards
- Each player displays:
    - Player photo
    - Name
    - Number (if available)
    - Position
- Selecting or hovering over a player displays additional information:
    - Full name
    - Age
    - Nationality
    - Height (if available)
- Historical tournaments display their tournament-specific players.
- Active tournament squads update through scheduled refreshes.

### Technical Notes

- Store players in the `players` table.
- Store tournament-specific squad relationships in `team_players`.
- Active tournament squads are populated using:
    - `/players/squads?team={team_id}`
- Historical tournament squads are generated from:
    - `/players/statistics?league={league_id}&season={season}`
- Historical imports only populate player and squad relationships for this feature.

---

## User Story 5: Maintain Team Data Freshness

### User Story

As a user, I want team information to stay updated so that active tournaments show current squads.

### Acceptance Criteria

- Squad data is stored locally after synchronization.
- Loading team pages does not trigger external API requests.
- Active tournament squads refresh automatically.
- Finished tournament squad data remains static.
- Failed refresh attempts do not remove existing squad data.

### Technical Notes

- Add scheduled squad refresh job.
- Refresh only active/upcoming tournament squads.
- Use cached PostgreSQL data for all user requests.
- Track refresh status through existing refresh job infrastructure.
