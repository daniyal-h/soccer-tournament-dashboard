# Architecture Decision Records

This document records every significant technical decision made in this project, the alternatives considered, and the reasoning behind each choice. The goal is to make the thinking behind the codebase visible to anyone reading it, including future contributors and anyone reviewing this project.

---

## 1. Backend Language: Python with FastAPI

**Decision:** Use Python and FastAPI for the backend API.

**Alternatives considered:**
- Node.js with Express (TypeScript)
- Node.js with Express (JavaScript)

**Reasoning:**

The frontend is already written in TypeScript, so using Node.js for the backend would mean a single language across the full stack. While this reduces context switching, it also means the project demonstrates only one language. Python was used during a prior co-op placement for statistical data analysis, so the language itself is not new. What is new is using Python in a backend web service context with FastAPI.

FastAPI was chosen over Flask because it is modern, async-first, and generates automatic interactive API documentation at `/docs` out of the box via OpenAPI. It also has a strong dependency injection system via `Depends()` which maps directly to the Dependency Inversion principle from SOLID.

Using Python on the backend alongside TypeScript on the frontend demonstrates stack breadth, which is a deliberate resume differentiator for software engineering roles.

---

## 2. Database: PostgreSQL

**Decision:** Use PostgreSQL as the primary database.

**Alternatives considered:**
- MongoDB (NoSQL)
- SQLite

**Reasoning:**

MongoDB and NoSQL experience already exists from a prior co-op where it was used for a React Native health application. Using it again here would add nothing new to the resume. PostgreSQL fills a gap by demonstrating relational database experience including schema design, migrations, indexing, and SQL queries.

PostgreSQL also provides full-text search via `tsvector` and `tsquery` which powers the Global Search feature without needing a separate search service. This keeps the stack simple while still delivering a real search implementation.

SQLite was ruled out because it is not suitable for a deployed production environment with concurrent requests.

---

## 3. Frontend Hosting: Vercel

**Decision:** Deploy the React frontend on Vercel.

**Alternatives considered:**
- Netlify
- Render static sites
- GitHub Pages

**Reasoning:**

Vercel is purpose-built for React and Next.js deployments. It provides automatic preview deployments on every pull request, which serves as a staging environment for the frontend without any additional configuration. Deploys trigger automatically on merge to main with no extra CI step required. The free tier is generous and well suited for a portfolio project with low traffic.

Vercel preview deployments also mean every PR has a live URL that can be reviewed before merging, which is a professional workflow worth demonstrating.

---

## 4. Backend Hosting: Render with Docker

**Decision:** Deploy the FastAPI backend on Render using a Docker container.

**Alternatives considered:**
- Railway
- Fly.io
- Heroku

**Reasoning:**

Render supports Docker deployments on its free tier, which means the same `docker-compose` setup used locally translates directly to production. This keeps the local and production environments consistent and avoids the "works on my machine" problem.

Render also provides a managed PostgreSQL database on the free tier, which means the backend and database are co-located on the same platform and the connection between them is straightforward to configure.

Railway and Fly.io are both strong alternatives but Render was chosen for its simplicity and the convenience of having the database and backend on the same platform.

---

## 5. External Data Source: API-Football

**Decision:** Use API-Football as the external soccer data provider.

**Alternatives considered:**
- football-data.org
- SportMonks
- Scraping public sources

**Reasoning:**

API-Football provides comprehensive coverage of the FIFA World Cup including standings, fixtures, player statistics, and team data. The free tier offers 100 requests per day which is sufficient when combined with the PostgreSQL caching layer. The paid tier is available if needed and switching to it requires only a single environment variable change with no code modifications.

football-data.org was considered but has less comprehensive player statistics coverage. Scraping was ruled out entirely due to reliability and legal concerns.

---

## 6. Caching Strategy: PostgreSQL Response Cache

**Decision:** Cache all API-Football responses in PostgreSQL with a TTL per data type.

**Alternatives considered:**
- Redis
- In-memory caching
- No caching, direct API calls

**Reasoning:**

The API-Football free tier allows 100 requests per day. Without caching, a single user loading the app could exhaust this quota in minutes. Caching responses in PostgreSQL means the API is called once per data type per TTL window, and all subsequent requests are served from the database.

Redis would be a more conventional caching solution but adds another service to the stack and the free tier on Render does not include Redis. Since PostgreSQL is already in the stack, using it for caching keeps the architecture simple. The cache table stores a `cache_key`, `payload`, `last_updated`, and `expires_at` column, which is sufficient for a cache-aside strategy.

A stale fallback is also implemented: if API-Football is unavailable when the cache expires, the last known good response is served with a "data may be delayed" notice rather than returning an error to the user.

---

## 7. Player Stats: Daily Seed Job via GitHub Actions

**Decision:** Pre-seed all player statistics into PostgreSQL once per day via a scheduled GitHub Actions workflow rather than fetching on demand.

**Alternatives considered:**
- Fetch player stats live on page load
- Fetch and cache per team on demand

**Reasoning:**

Fetching player stats for all 48 World Cup teams requires 48 separate API requests (one per team). Doing this on demand when a user visits the leaderboard would exhaust the entire free tier daily quota in a single page load. Pre-seeding on a daily schedule means the quota is used once per day in a controlled, predictable way.

The trade-off is that player stats are updated daily rather than in real time. This is acceptable because player statistics (goals, assists, cards) only change when a match is played, which happens a few times per day at most during the tournament. A "stats updated daily" label on the leaderboard sets the correct expectation for users.

---

## 8. Preference Storage: localStorage over Cookies

**Decision:** Store the tournament selector preference in localStorage rather than a cookie.

**Alternatives considered:**
- Browser cookies
- Backend user session (requires authentication)

**Reasoning:**

Cookies are sent with every HTTP request to the backend automatically by the browser. For a UI-only preference like the selected tournament, this is unnecessary overhead. The backend has no use for this value and does not need to receive it on every request.

localStorage is the standard browser mechanism for storing client-side preferences. It persists across sessions, is easy to read and write in JavaScript, and keeps the preference entirely on the client where it belongs.

A backend user session was ruled out because the app has no authentication system. Adding auth solely to persist a tournament preference would be significant over-engineering.

---

## 9. Sorting: Server-side via Database Query

**Decision:** Sort player leaderboard results server-side via a PostgreSQL `ORDER BY` query rather than client-side in React.

**Alternatives considered:**
- Client-side sorting in React after fetching results

**Reasoning:**

Client-side sorting only operates on the data that has already been fetched. If the backend returns the top 10 players sorted by goals and the user then sorts by assists, the result is the top 10 assist providers within that goals-sorted subset, not the actual top 10 assist providers in the tournament. This produces incorrect rankings.

Server-side sorting ensures the database applies the sort across all players before returning the top 10, which guarantees correct results regardless of which column the user sorts by. Each sort triggers a new request to the backend with the sort parameter, and the backend queries the database accordingly.

---

## 10. Branching Strategy: Trunk-based Development

**Decision:** Use trunk-based development where `main` is always production and all work happens on short-lived feature branches merged directly to `main` via pull request.

**Alternatives considered:**
- Gitflow with a permanent `development` branch between features and `main`

**Reasoning:**

Gitflow was used in a prior group project where a `development` branch accumulated work from multiple contributors before being merged to `main` at the end of each sprint. For a solo project deploying continuously, this adds overhead with no benefit. There are no other contributors to coordinate with and no sprint-based release schedule.

Trunk-based development with squash-and-merge to `main` keeps the main branch history clean and readable. Each squash commit represents one meaningful unit of work. The CI pipeline and branch protection rules on `main` provide the safety gate that the `development` branch provided in Gitflow.

---

## 11. API Versioning: Routes under /api/v1

**Decision:** Structure all backend routes under the `/api/v1/` prefix from day one.

**Alternatives considered:**
- No versioning, flat route structure

**Reasoning:**

Adding versioning from the start costs nothing and makes future changes safer. If the response contract for an endpoint needs to change in a breaking way, a `/api/v2/` version can be introduced without removing the existing `/api/v1/` endpoints. This means the frontend can be updated independently without a coordinated cutover.

Flat routes with no versioning make breaking changes significantly harder to manage once the frontend is deployed and consuming the API.

---

## 12. Tournament-agnostic Architecture

**Decision:** Design the entire backend to be tournament-agnostic by passing a `tournament_id` parameter through every route rather than hardcoding World Cup 2026.

**Alternatives considered:**
- Hardcode World Cup 2026 throughout the codebase

**Reasoning:**

The World Cup begins in June 2026, which means there is no live World Cup data available during development. By making the architecture tournament-agnostic, any tournament supported by API-Football (Champions League, domestic leagues, Copa America) can be used as a data source during development and testing. A dropdown in the navbar allows the user to select the tournament, with World Cup 2026 as the default.

Hardcoding the tournament would have made it impossible to test against real live data before the tournament begins and would have produced a less reusable and less interesting architecture.