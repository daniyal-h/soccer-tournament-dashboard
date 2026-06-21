# Team Profile Feature Load Testing Report

## Overview

Load testing was performed using k6 against the FastAPI backend running locally with Dockerized PostgreSQL. Tests focused on validating endpoint performance, latency consistency, and rate limiting behaviour under sustained and burst traffic patterns.

This sprint introduced the Team Profile feature, including team overview data, team match history, and squad retrieval. Testing covers the complete team profile page load flow used when a user opens a team profile.

---

## Environment

| Component         | Configuration                               |
| ----------------- | ------------------------------------------- |
| Backend           | FastAPI                                     |
| Database          | PostgreSQL (Docker)                         |
| Load Testing Tool | k6                                          |
| Endpoints Tested  | `GET /api/v1/tournaments/1/teams/1/profile` |
|                   | `GET /api/v1/tournaments/1/teams/1/matches` |
|                   | `GET /api/v1/tournaments/1/teams/1/squad`   |
| Rate Limit        | 60 requests/min/IP                          |

---

# 1. Team Profile Normal Load Test

## Goal

Validate sustained team profile page performance under expected traffic while remaining below the configured rate limit.

A user opening a team profile triggers profile, match history, and squad requests in parallel, so the endpoints are tested together to represent real application behavior.

## Flow Tested

1. `GET /api/v1/tournaments/1/teams/1/profile`
2. `GET /api/v1/tournaments/1/teams/1/matches`
3. `GET /api/v1/tournaments/1/teams/1/squad`

## Configuration

| Setting      | Value                                             |
| ------------ | ------------------------------------------------- |
| Executor     | `constant-arrival-rate`                           |
| Request Rate | 55 user flows/minute                              |
| Duration     | 10 minutes                                        |
| Thresholds   | <1% failures, p95 < 500ms, >99% successful checks |

## Results

| Metric            | Result |
| ----------------- | ------ |
| Total Requests    |        |
| Failure Rate      |        |
| Successful Checks |        |
| Average Latency   |        |
| p95 Latency       |        |
| Max Latency       |        |

## Outcome

---

# 2. Team Profile Navigation Spike Test

## Goal

Simulate sudden traffic increases during active tournament periods where users frequently open team profiles to view team progress, match history, and squad information.

The test validates that the backend remains responsive while enforcing rate limits during burst traffic.

## Flow Tested

1. `GET /api/v1/tournaments/1/teams/1/profile`
2. `GET /api/v1/tournaments/1/teams/1/matches`
3. `GET /api/v1/tournaments/1/teams/1/squad`

## Configuration

| Setting            | Value                                              |
| ------------------ | -------------------------------------------------- |
| Executor           | `ramping-arrival-rate`                             |
| Peak Request Rate  | 120 user flows/minute                              |
| Duration           | 2 minutes 20 seconds                               |
| Stages             | warmup, spike, sustained spike, recovery, cooldown |
| Thresholds         | p95 < 1000ms, >99% successful checks               |
| Accepted Responses | 200 OK, 429 Too Many Requests                      |

## Results

| Metric             | Result |
| ------------------ | ------ |
| Total Requests     |        |
| Successful Checks  |        |
| Average Latency    |        |
| p95 Latency        |        |
| Max Latency        |        |
| HTTP 429 Responses |        |
| HTTP Failure Rate  |        |

\* k6 classifies HTTP 429 responses as failed HTTP requests by default. These responses are expected when the spike test intentionally exceeds configured rate limits.

## Outcome

---

# 3. Team Profile Flow Stress Test

## Goal

Evaluate backend behavior under extreme sustained traffic while repeatedly exercising the complete team profile page loading flow.

The test validates system stability, database behavior, caching effectiveness, and rate limiting when many users access team data concurrently.

## Flow Tested

1. `GET /api/v1/tournaments/1/teams/1/profile`
2. `GET /api/v1/tournaments/1/teams/1/matches`
3. `GET /api/v1/tournaments/1/teams/1/squad`

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
| Total Requests     |        |
| Successful Checks  |        |
| Failed Checks      |        |
| Average Latency    |        |
| p95 Latency        |        |
| Max Latency        |        |
| HTTP Failure Rate  |        |
| Peak Virtual Users |        |

\* k6 classifies HTTP 429 responses as failed HTTP requests by default. These responses are expected during stress testing because the test intentionally exceeds configured rate limits.

## Outcome

---

# Conclusion
