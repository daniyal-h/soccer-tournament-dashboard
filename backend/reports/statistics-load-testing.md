# Statistics Feature Load Testing Report

## Overview

Load testing was performed using k6 against the FastAPI backend running locally with Dockerized PostgreSQL. Tests focused on validating endpoint performance, latency consistency, cache behavior, and rate limiting for the Statistics feature.

This feature includes player leaderboards for goals, assists, and yellow cards. The frontend allows users to switch between leaderboard categories, so testing models the realistic user flow of requesting each category serially rather than in parallel.

---

## Environment

| Component         | Configuration                                                         |
| ----------------- | --------------------------------------------------------------------- |
| Backend           | FastAPI                                                               |
| Database          | PostgreSQL (Docker)                                                   |
| Load Testing Tool | k6                                                                    |
| Endpoints Tested  | `GET /api/v1/tournaments/1/player-leaderboards?category=goals`        |
|                   | `GET /api/v1/tournaments/1/player-leaderboards?category=assists`      |
|                   | `GET /api/v1/tournaments/1/player-leaderboards?category=yellow_cards` |
| Rate Limit        | 60 requests/min/IP                                                    |

---

# 1. Statistics Normal Load Test

## Goal

Validate sustained Statistics page performance under expected traffic while remaining below the configured rate limit.

A user opening the Statistics page initially loads a leaderboard category, then may switch between goals, assists, and yellow cards. The test exercises these category requests serially to represent normal tab-switching behavior.

## Flow Tested

1. `GET /api/v1/tournaments/1/player-leaderboards?category=goals`
2. `GET /api/v1/tournaments/1/player-leaderboards?category=assists`
3. `GET /api/v1/tournaments/1/player-leaderboards?category=yellow_cards`

## Configuration

| Setting      | Value                                             |
| ------------ | ------------------------------------------------- |
| Executor     | `constant-arrival-rate`                           |
| Request Rate | 55 leaderboard category flows/minute              |
| Duration     | 10 minutes                                        |
| Thresholds   | <1% failures, p95 < 500ms, >99% successful checks |

## Results

| Metric            | Result |
| ----------------- | ------ |
| Total Requests    | TBD    |
| Failure Rate      | TBD    |
| Successful Checks | TBD    |
| Average Latency   | TBD    |
| p95 Latency       | TBD    |
| Max Latency       | TBD    |

## Outcome

TBD

---

# 2. Statistics Spike Test

## Goal

Simulate sudden traffic increases during active tournament periods where users frequently check player leaderboards and switch between statistical categories.

The test validates that the backend remains responsive while enforcing rate limits during burst traffic.

## Flow Tested

1. `GET /api/v1/tournaments/1/player-leaderboards?category=goals`
2. `GET /api/v1/tournaments/1/player-leaderboards?category=assists`
3. `GET /api/v1/tournaments/1/player-leaderboards?category=yellow_cards`

## Configuration

| Setting            | Value                                              |
| ------------------ | -------------------------------------------------- |
| Executor           | `ramping-arrival-rate`                             |
| Peak Request Rate  | 120 leaderboard category flows/minute              |
| Duration           | 2 minutes 20 seconds                               |
| Stages             | warmup, spike, sustained spike, recovery, cooldown |
| Thresholds         | p95 < 1000ms, >99% successful checks               |
| Accepted Responses | 200 OK, 429 Too Many Requests                      |

## Results

| Metric             | Result |
| ------------------ | ------ |
| Total Requests     | TBD    |
| Successful Checks  | TBD    |
| Average Latency    | TBD    |
| p95 Latency        | TBD    |
| Max Latency        | TBD    |
| HTTP 429 Responses | TBD    |
| HTTP Failure Rate  | TBD    |

\* k6 classifies HTTP 429 responses as failed HTTP requests by default. These responses are expected when the spike test intentionally exceeds configured rate limits.

## Outcome

TBD

---

# 3. Statistics Stress Test

## Goal

Evaluate backend behavior under extreme sustained traffic while repeatedly exercising the Statistics leaderboard category flow.

The test validates system stability, database behavior, caching effectiveness, and rate limiting when many users access player leaderboard data concurrently.

## Flow Tested

1. `GET /api/v1/tournaments/1/player-leaderboards?category=goals`
2. `GET /api/v1/tournaments/1/player-leaderboards?category=assists`
3. `GET /api/v1/tournaments/1/player-leaderboards?category=yellow_cards`

## Configuration

| Setting            | Value                                                        |
| ------------------ | ------------------------------------------------------------ |
| Executor           | `ramping-vus`                                                |
| Peak Virtual Users | 200                                                          |
| Duration           | 8 minutes                                                    |
| Stages             | gradual ramp-up, sustained heavy load, peak stress, recovery |
| Thresholds         | p95 < 2000ms, >95% successful checks                         |
| Accepted Responses | 200 OK, 429 Too Many Requests                                |

## Results

| Metric             | Result |
| ------------------ | ------ |
| Total Requests     | TBD    |
| Successful Checks  | TBD    |
| Failed Checks      | TBD    |
| Average Latency    | TBD    |
| p95 Latency        | TBD    |
| Max Latency        | TBD    |
| HTTP 429 Responses | TBD    |
| HTTP Failure Rate  | TBD    |
| Peak Virtual Users | TBD    |

\* k6 classifies HTTP 429 responses as failed HTTP requests by default. These responses are expected during stress testing because the test intentionally exceeds configured rate limits.

## Outcome

TBD

---

# Conclusion

The Statistics feature load tests validate whether the backend can reliably support player leaderboard browsing under expected usage patterns, sudden traffic spikes, and extreme concurrent load.

Normal load testing is expected to confirm that cached leaderboard category requests remain stable under sustained traffic. Spike testing validates that rate limiting activates correctly during sudden bursts while keeping accepted responses responsive. Stress testing identifies whether the player leaderboard flow remains stable under overload and whether the main bottleneck is request handling, database connection capacity, or rate limiting.

The tests specifically evaluate:

- sustained leaderboard category browsing
- serial category switching behavior
- PostgreSQL-backed cache performance
- latency consistency under normal and burst traffic
- rate limiting behavior under overload
- backend stability under high concurrency

Final conclusions should be completed after the normal, spike, and stress test results are recorded.
