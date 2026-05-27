# Soccer Tournament Dashboard - Test Plan

## 1. Overview

This document defines the testing strategy for the Soccer Tournament Dashboard across the frontend, backend, database, infrastructure, and deployment environments.

Testing covers both functional and non-functional behaviour, including:

- API correctness
- database interaction
- frontend rendering and interaction flows
- caching behaviour
- rate limiting
- error handling
- mutation resistance
- load and stress behaviour
- deployment validation

The goal is to ensure the application remains stable, performant, maintainable, and observable throughout development and deployment.

---

# 2. Testing Scope

## Functional Areas

| Area                    | Description                          |
| ----------------------- | ------------------------------------ |
| Tournament Selector     | Tournament switching and persistence |
| Group Standings         | Standings retrieval and ranking      |
| Match Schedule          | Match retrieval and grouping         |
| Team Profiles           | Team detail retrieval                |
| Player Statistics       | Player rankings and filtering        |
| Global Search           | Team/player search behaviour         |
| Knockout Bracket        | Tournament progression visualization |
| Admin Refresh Endpoints | Manual refresh workflows             |

---

## Non-Functional Areas

| Area                 | Description                               |
| -------------------- | ----------------------------------------- |
| Performance          | Endpoint latency and sustained throughput |
| Rate Limiting        | Abuse protection and traffic rejection    |
| Caching              | Cache hit/miss/stale fallback behaviour   |
| Reliability          | Graceful handling of failures             |
| Observability        | Logging, tracing, and error visibility    |
| Deployment Stability | Hosted environment validation             |
| Mutation Resistance  | Test effectiveness validation             |

---

# 3. Testing Strategy

## Unit Testing

Unit tests validate isolated business logic and utility behaviour.

### Backend

Tooling:

- `pytest`

Coverage areas:

- service logic
- cache helpers
- TTL calculations
- ranking/tiebreak logic
- utility functions
- validation behaviour

Run:

```bash
pytest tests/unit
```

### Frontend

Tooling:

- `Vitest`

Coverage areas:

- hooks
- utility functions
- context providers
- API helpers
- isolated UI components

Run:

```bash
npm run test:run -- src/hooks src/utils src/lib src/context src/api src/components
```

---

## Integration Testing

Integration tests validate interaction between application layers.

### Backend

Tooling:

- `pytest`
- `HTTPX`
- PostgreSQL (Docker)

Coverage areas:

- API routes
- request/response contracts
- database interaction
- repository behaviour
- middleware behaviour
- cache integration

Run:

```bash
pytest tests/integration
```

### Frontend

Tooling:

- `Vitest`

Coverage areas:

- routed pages
- component interaction flows
- API integration behaviour
- loading/error states

Run:

```bash
npm run test:run -- src/pages src/components
```

---

## Acceptance Testing

Acceptance testing validates user-facing flows against user stories.

Planned tooling:

- `Playwright`

Coverage areas:

- tournament selection
- standings browsing
- navigation flows
- search interaction
- error handling
- responsive layouts

Acceptance scenarios are derived directly from documented user stories.

---

## Regression Testing

Regression testing is automated through GitHub Actions and executed on pull requests.

CI validation includes:

- frontend linting
- backend linting
- type checking
- unit tests
- integration tests
- mutation testing
- Docker build validation

All required checks must pass before merge into `main`.

---

# 4. Mutation Testing

Mutation testing validates the effectiveness of the automated test suite by intentionally modifying code and ensuring tests fail appropriately.

## Backend

Tooling:

- `mutmut`

Run:

```bash
mutmut run
mutmut results
```

## Frontend

Tooling:

- `StrykerJS`

Run:

```bash
npm run test:mutation
```

## Goals

- maintain high mutation kill rates
- detect weak or superficial assertions
- improve regression confidence

Mutation testing is performed after implementing stable feature logic rather than during early scaffolding work.

---

# 5. Load Testing

Load testing validates backend performance, traffic handling, and rate limiting behaviour.

## Tooling

- `k6`

Load tests are organized by feature area:

```txt
load-tests/
  standings/
  matches/
  search/
```

---

## Scenarios

### Normal Load

Validates sustained traffic under expected operating conditions while remaining below configured API rate limits.

### Spike Testing

Validates backend stability and rate limiting behaviour during sudden traffic bursts similar to live-match traffic surges.

### Rate Limit Validation

Verifies that excessive traffic is rejected correctly using HTTP 429 responses without degrading backend responsiveness.

### Stress Testing

Validates backend behaviour under extreme sustained traffic and confirms that protective controls remain functional under overload conditions.

---

## Current Endpoint Coverage

| Endpoint  | Status      |
| --------- | ----------- |
| Standings | Implemented |
| Matches   | Planned     |
| Search    | Planned     |

---

## Current Rate Limits

| Endpoint Type     | Limit               |
| ----------------- | ------------------- |
| General Endpoints | 100 requests/min/IP |
| Standings         | 60 requests/min/IP  |
| Search            | 30 requests/min/IP  |
| Admin Endpoints   | 3 requests/min/IP   |

Rate limiting is implemented using `slowapi`.

---

# 6. Observability and Runtime Monitoring

Observability is implemented across both frontend and backend environments.

## Sentry

Sentry is integrated into both applications for centralized error tracking.

### Frontend

Coverage:

- unhandled exceptions
- React error boundaries
- failed API requests
- session replay

### Backend

Coverage:

- unhandled exceptions
- runtime failures
- request-level errors

---

## Logging

### Backend Request Logging

Request middleware logs:

```txt
method
path
status_code
duration_ms
request_id
```

Successful request logs are emitted to Render runtime logs.

Unexpected exceptions and failures are captured in Sentry.

### Additional Logging

- cache hit/miss/stale logs
- refresh job logs
- deployment logs
- GitHub Actions workflow logs

---

# 7. Caching Validation

Caching behaviour is validated through automated testing and runtime verification.

Coverage includes:

- cache hits
- cache misses
- stale fallback behaviour
- cache invalidation
- refresh cooldown behaviour
- TTL handling

The backend uses PostgreSQL as both the primary database and cache layer.

---

# 8. Deployment Validation

Deployment validation ensures hosted environments remain operational after changes.

## Environments

| Environment  | Purpose                                     |
| ------------ | ------------------------------------------- |
| Local Docker | primary development and performance testing |
| Staging      | deployment validation                       |
| Production   | live hosted environment                     |

---

# 9. Security Validation

Testing includes validation of key security controls.

Coverage areas:

- CORS enforcement
- token-protected admin endpoints
- SQL query parameterization
- request validation
- rate limiting
- environment variable handling

Sensitive values must never appear in logs, frontend code, or client-visible responses.

---

# 10. Test Environments

## Local Development

| Component | Environment         |
| --------- | ------------------- |
| Backend   | FastAPI             |
| Frontend  | Vite                |
| Database  | PostgreSQL (Docker) |

Primary environment for:

- unit testing
- integration testing
- mutation testing
- load testing
- stress testing

---

## Hosted Environment

| Component | Platform        |
| --------- | --------------- |
| Frontend  | Vercel          |
| Backend   | Render          |
| Database  | Neon PostgreSQL |

Used primarily for:

- deployment validation
- smoke testing
- observability validation

---

# 11. Success Criteria

The application is considered test-stable when:

- automated tests pass consistently
- mutation testing maintains high kill rates
- no critical Sentry issues remain unresolved
- load testing confirms acceptable latency
- rate limiting behaves correctly
- deployments succeed without regression
- health checks remain operational
- critical user flows remain functional

---

# 12. Future Testing Expansion

Planned future testing areas include:

- combined multi-endpoint load scenarios
- search throughput benchmarking
- live polling simulation
- background job concurrency testing
- frontend E2E automation expansion
- deployment performance comparison
- CI performance baselining

This document will evolve alongside the application architecture and infrastructure.
