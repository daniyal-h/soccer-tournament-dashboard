# Schedule Feature Load Testing Report

## Overview

Load testing was performed using k6 against the FastAPI backend running locally with Dockerized PostgreSQL. Tests focused on validating endpoint performance, latency consistency, and rate limiting behaviour under sustained and burst traffic patterns.

This sprint introduced the Schedule feature, including match schedule retrieval and match detail navigation. Testing covers the primary schedule endpoint and the combined match detail flow used when a user selects a match.

---

## Environment

| Component         | Configuration                       |
| ----------------- | ----------------------------------- |
| Backend           | FastAPI                             |
| Database          | PostgreSQL (Docker)                 |
| Load Testing Tool | k6                                  |
| Endpoints Tested  | `GET /api/v1/tournaments/1/matches` |
|                   | `GET /api/v1/matches/1`             |
|                   | `GET /api/v1/matches/1/events`      |
| Rate Limit        | 100 requests/min/IP                 |

---

# 1. Schedule Normal Load Test

## Goal

Validate sustained schedule endpoint performance under expected traffic while remaining below the configured rate limit.

## Endpoint Tested

`GET /api/v1/tournaments/1/matches`

## Configuration

| Setting      | Value                                             |
| ------------ | ------------------------------------------------- |
| Executor     | `constant-arrival-rate`                           |
| Request Rate | 55 requests/minute                                |
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

TODO

---

# 2. Match Detail Flow Normal Load Test

## Goal

Validate performance of loading an individual match page, including both match metadata and timeline event data.

A user navigating from the schedule page triggers both requests, so they are tested together to represent real application behavior.

## Endpoints Tested

`GET /api/v1/matches/1`

`GET /api/v1/matches/1/events`

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

TODO

---

# 3. Combined Schedule Navigation Spike Test

## Goal

Simulate sudden traffic increases during active tournament periods where users frequently refresh schedules and open match details.

The test validates that the backend remains responsive while enforcing rate limits during burst traffic.

## Flow Tested

1. `GET /api/v1/tournaments/1/matches`
2. `GET /api/v1/matches/1`
3. `GET /api/v1/matches/1/events`

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

## Outcome

TODO

---

# 4. Match Events Rate Limit Validation Test

## Goal

Verify that excessive requests to frequently refreshed match event data are correctly limited without backend instability.

## Endpoint Tested

`GET /api/v1/matches/1/events`

## Configuration

| Setting            | Value                                                          |
| ------------------ | -------------------------------------------------------------- |
| Executor           | `constant-arrival-rate`                                        |
| Request Rate       | 120 requests/minute                                            |
| Duration           | 1 minute                                                       |
| Thresholds         | p95 < 500ms, >99% successful checks, at least one 429 response |
| Accepted Responses | 200 OK, 429 Too Many Requests                                  |

## Results

| Metric            | Result |
| ----------------- | ------ |
| Total Requests    |        |
| 200 Responses     |        |
| 429 Responses     |        |
| Successful Checks |        |
| Average Latency   |        |
| p95 Latency       |        |
| Max Latency       |        |

## Outcome

TODO

---

# 5. Combined Schedule Flow Stress Test

## Goal

Evaluate backend behavior under extreme sustained traffic while repeatedly exercising the complete schedule browsing flow.

## Flow Tested

1. `GET /api/v1/tournaments/1/matches`
2. `GET /api/v1/matches/1`
3. `GET /api/v1/matches/1/events`

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

## Outcome

TODO

---

# Conclusion

TODO
