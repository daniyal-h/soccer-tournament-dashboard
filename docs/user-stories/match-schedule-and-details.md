# Match Schedule

## Feature Overview

The Match Schedule feature is the default homepage of the application. Matches are grouped by date and displayed in a responsive card grid layout that adapts across mobile and desktop screen sizes. Live matches automatically refresh while in progress, while completed and scheduled matches remain static. Match data is cached to reduce API usage, and stale cached data is served gracefully if the external API becomes unavailable. Individual match cards provide high-level match information, while a dedicated match details page displays the full event timeline.

---

# User Stories

## 1. Match Schedule Display

### User Story

As a user, I want to view matches grouped by date so that I can easily browse fixtures.

### Acceptance Criteria

- The homepage displays match schedules by default.
- Matches are grouped chronologically by date.
- Each date section displays all matches scheduled for that day.
- Match cards display:
    - Home team
    - Away team
    - Team logos/flags
    - Kickoff time
    - Match status
    - Group/stage label

- The layout is responsive:
    - Single column on mobile
    - Two columns on tablet
    - Two to three columns on desktop

- Empty match dates are not displayed.

### Subtasks

- Create matches API endpoint.
- Create matches repository query.
- Implement match schedule service layer.
- Create grouped-by-date response mapper.
- Build date accordion component.
- Build match card component.
- Add responsive grid layout.
- Add loading skeleton state.
- Add empty state handling.
- Add unit tests for grouped rendering.

---

## 2. Live Match Updates

### User Story

As a user, I want to see live match updates so that I can follow ongoing games.

### Acceptance Criteria

- Live matches are visually distinguishable from scheduled and finished matches.
- Live match cards display:
    - Current score
    - Live match minute
    - Live status indicator

- Match data auto-refreshes only while at least one live match exists.
- Polling stops automatically when no live matches remain.
- Refreshing updates scores and match statuses without requiring a page reload.

### Subtasks

- Add live match polling hook.
- Detect active live matches from API response.
- Implement conditional polling logic.
- Add live badge/status styling.
- Add live minute display.
- Add score update rendering.
- Prevent unnecessary polling when no live matches exist.
- Add tests for polling behavior.
- Add tests for live match rendering.

---

## 3. Match Details Page

### User Story

As a user, I want to view detailed match events so that I can follow the progression of a match.

### Acceptance Criteria

- Clicking a match card navigates to a dedicated match details page.
- The details page displays:
    - Teams
    - Current/final score
    - Kickoff time
    - Venue
    - Match status
    - Group/stage

- Match events are displayed chronologically.
- Event timeline supports:
    - Goals
    - Assists
    - Yellow cards
    - Red cards
    - Substitutions
    - Penalty events

- Live matches continue refreshing while active.

### Subtasks

- Create match details API endpoint.
- Create match events repository query.
- Implement match details service layer.
- Build match details page.
- Build event timeline component.
- Create event display mapper.
- Add event icons/styling.
- Add live update support for details page.
- Add loading/error states.
- Add integration tests for match event responses.

---

## 4. Graceful Cached Fallback

### User Story

As a user, I want the app to still work if the API fails so that I am not blocked.

### Acceptance Criteria

- Cached match data is served if the external API fails.
- Users are informed when stale cached data is displayed.
- The application does not crash when API requests fail.
- Match schedules remain viewable during outages.
- Cache fallback behavior works for:
    - Match schedules
    - Match details
    - Live matches

- Delay notices clearly indicate data may not be current.

### Subtasks

- Extend cache service for match schedule responses.
- Implement stale cache fallback logic.
- Add cache TTL strategy for live vs scheduled matches.
- Create stale-data response metadata.
- Add frontend stale-data banner component.
- Add error logging for failed refreshes.
- Add integration tests for cache fallback behavior.
- Add tests for stale response handling.

---

## 5. Match Status Handling

### User Story

As a user, I want match statuses to be clearly represented so that I understand the current state of each fixture.

### Acceptance Criteria

- Scheduled matches display kickoff time.
- Live matches display current score and minute.
- Finished matches display final score and full-time status.
- Postponed and cancelled matches are visually distinguishable.
- Status changes update correctly after refresh.

### Subtasks

- Create match status display utility.
- Add status badge component.
- Add conditional rendering for status states.
- Add postponed/cancelled styling.
- Add tests for status formatting.
- Add tests for status transition rendering.

---

## 6. Match Schedule Performance

### User Story

As a user, I want the match schedule to load quickly so that the app feels responsive.

### Acceptance Criteria

- Match schedule loads within acceptable response times under normal usage.
- Live polling does not create excessive API requests.
- Date grouping does not noticeably delay rendering.
- Cached responses reduce unnecessary external API usage.

### Subtasks

- Optimize grouped match queries.
- Add database indexes for kickoff time and status.
- Add frontend memoization for grouped data.
- Add k6 load tests for match endpoints.
- Add polling performance tests.
- Add cache hit/miss logging.
