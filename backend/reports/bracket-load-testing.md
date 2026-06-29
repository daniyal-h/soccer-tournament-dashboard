# Bracket Feature Load Testing Report

## Overview

Load testing was performed using k6 against the FastAPI backend running locally with Dockerized PostgreSQL. Tests focused on validating endpoint performance, latency consistency, cache behavior, and rate limiting for the tournament bracket feature.

The Bracket page retrieves the complete knockout bracket through a single API endpoint. Client-side navigation between bracket rounds is handled entirely in the frontend, so load testing focuses on the single backend request responsible for providing the complete bracket data.

---

## Environment

| Component         | Configuration                       |
| ----------------- | ----------------------------------- |
| Backend           | FastAPI                             |
| Database          | PostgreSQL (Docker)                 |
| Load Testing Tool | k6                                  |
| Endpoint Tested   | `GET /api/v1/tournaments/1/bracket` |
| Rate Limit        | 60 requests/min/IP                  |

---

# 1. Bracket Normal Load Test

## Goal

Validate sustained bracket page performance under expected traffic while remaining below the configured rate limit.

A user opening the Bracket page issues a single request to retrieve the entire tournament bracket. Subsequent navigation between rounds occurs entirely within the frontend without additional API requests.

## Flow Tested

1. `GET /api/v1/tournaments/1/bracket`

## Configuration

| Setting      | Value                                             |
| ------------ | ------------------------------------------------- |
| Executor     | `constant-arrival-rate`                           |
| Request Rate | 55 bracket page loads/minute                      |
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

# 2. Bracket Spike Test

## Goal

Simulate sudden traffic increases during active tournament periods where many users simultaneously open the Bracket page.

The test validates that the backend remains responsive while enforcing configured rate limits during burst traffic.

## Flow Tested

1. `GET /api/v1/tournaments/1/bracket`

## Configuration

| Setting            | Value                                              |
| ------------------ | -------------------------------------------------- |
| Executor           | `ramping-arrival-rate`                             |
| Peak Request Rate  | 120 bracket page loads/minute                      |
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

# 3. Bracket Stress Test

## Goal

Evaluate backend behavior under extreme sustained traffic while repeatedly exercising bracket retrieval.

The test validates system stability, database behavior, caching effectiveness, and rate limiting when many users access tournament bracket data concurrently.

## Flow Tested

1. `GET /api/v1/tournaments/1/bracket`

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

The Bracket feature load tests validate whether the backend can reliably support tournament bracket viewing under expected usage patterns, sudden traffic spikes, and extreme concurrent load.

Normal load testing is expected to confirm that complete bracket retrieval remains stable under sustained traffic. Spike testing validates that rate limiting activates correctly during sudden bursts while maintaining low latency for accepted requests. Stress testing evaluates backend stability under prolonged heavy concurrency and identifies any system bottlenecks.

The tests specifically evaluate:

- sustained bracket page loading
- complete bracket retrieval through a single endpoint
- PostgreSQL-backed cache performance
- latency consistency under normal and burst traffic
- rate limiting behavior under overload
- backend stability under high concurrency

Final conclusions should be completed after the normal, spike, and stress test results are recorded.
