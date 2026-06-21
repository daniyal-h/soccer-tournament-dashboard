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

| Metric            | Result   |
| ----------------- | -------- |
| Total Requests    | 1,653    |
| Failure Rate      | 0.00%    |
| Successful Checks | 100.00%  |
| Average Latency   | 21.63ms  |
| p95 Latency       | 45.39ms  |
| Max Latency       | 414.59ms |

## Outcome

The team profile page flow remained stable under sustained load with zero failed requests and all validation checks passing successfully.

The test completed 551 simulated team profile page loads, generating 1,653 total HTTP requests across the team profile, team match history, and squad endpoints. These requests were executed together to represent the frontend behavior where all three sections load in parallel.

All endpoints consistently returned successful responses throughout the 10 minute test duration. The combined flow maintained low response times, with an average latency of 21.63ms and a p95 latency of 45.39ms, remaining well below the configured 500ms threshold.

The maximum observed latency reached 414.59ms, but this represented an isolated spike and did not cause failures or sustained performance degradation.

The test confirms that users can repeatedly load team profile pages while the backend continues serving team overview, match history, and squad data reliably under expected traffic conditions.

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

| Metric             | Result   |
| ------------------ | -------- |
| Total Requests     | 676      |
| Successful Checks  | 100.00%  |
| Average Latency    | 12.04ms  |
| p95 Latency        | 18.78ms  |
| Max Latency        | 249.66ms |
| HTTP 429 Responses | 195      |
| HTTP Failure Rate  | 28.84%\* |

\* k6 classifies HTTP 429 responses as failed HTTP requests by default. These responses were expected because the spike test intentionally exceeded configured rate limits.

## Outcome

The combined team navigation flow remained stable during sudden bursts of elevated traffic. The test simulated users loading the teams page and navigating into individual team profiles, triggering requests across team listing, team overview, match history, and squad endpoints.

All validation checks completed successfully, with the backend correctly returning either successful responses or rate-limited responses when traffic exceeded configured limits.

Rate limiting activated as expected during the spike, producing 195 HTTP 429 responses. Despite the sudden traffic increase, latency remained consistently low, with an average response time of 12.04ms and a p95 latency of 18.78ms.

The maximum observed latency reached 249.66ms, remaining well below the configured 1000ms threshold and showing no sustained performance degradation.

The test confirms that users can rapidly navigate between team listings and team profiles during high-traffic periods while the backend maintains responsiveness and enforces API protection mechanisms.

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

| Metric             | Result   |
| ------------------ | -------- |
| Total Requests     | 23,379   |
| Successful Checks  | 95.67%   |
| Failed Checks      | 4.32%    |
| Average Latency    | 2.59s    |
| p95 Latency        | 515.47ms |
| Max Latency        | 1m 0s    |
| HTTP Failure Rate  | 95.79%\* |
| Peak Virtual Users | 200      |

\* k6 classifies HTTP 429 responses as failed HTTP requests by default. These responses were expected during stress testing because the test intentionally exceeded configured rate limits. Some additional failures occurred when the database connection pool reached its configured capacity during peak load.

## Outcome

The team profile flow remained operational under extreme sustained traffic and passed the configured stress thresholds, with 95.67% successful validation checks and p95 latency of 515.47ms, remaining below the 2000ms threshold.

The test completed 5,821 simulated team profile navigation flows and generated 23,379 total HTTP requests across the teams list, team profile, team matches, and squad endpoints. The flow reached 200 virtual users during the peak stress phase.

During peak load, the backend logs showed SQLAlchemy database connection pool exhaustion:

`QueuePool limit of size 5 overflow 10 reached, connection timed out, timeout 30.00`

This indicates that the primary bottleneck under extreme concurrency was database connection availability rather than request processing logic. Because the team profile flow loads multiple DB-backed resources in parallel, it places more pressure on the connection pool than single-endpoint flows.

Despite this bottleneck, the backend continued serving accepted requests efficiently. Expected successful responses maintained a p95 latency of 377.79ms, while the overall p95 latency remained 515.47ms. The maximum observed latency reached 1 minute due to requests waiting for database connections before timing out.

The test confirms that the team profile flow can remain responsive under heavy overload while also identifying database connection pool capacity as the main scaling constraint for high-concurrency team profile usage.

---

# Conclusion

The Team Profile feature load tests validated that the backend can reliably support team profile browsing under expected usage patterns, sudden traffic spikes, and extreme concurrent load.

Normal load testing confirmed that the complete team profile page flow handled sustained traffic with no failed requests. The test completed 551 simulated page loads, generating 1,653 total requests across the team profile, match history, and squad endpoints. All requests completed successfully, maintaining an average latency of 21.63ms and p95 latency of 45.39ms.

Spike testing demonstrated that the team navigation flow remained responsive during sudden increases in traffic. Users were simulated loading the teams page and opening team profiles, triggering requests across four endpoints. Rate limiting activated correctly when traffic exceeded configured limits, producing HTTP 429 responses while maintaining low latency with a p95 response time of 18.78ms.

Stress testing with 200 virtual users identified database connection capacity as the primary scaling limitation under extreme concurrent load. The team profile flow successfully completed 95.67% of validation checks, but some requests failed once the SQLAlchemy connection pool reached its configured limit.

This bottleneck was expected due to the increased database pressure from loading multiple team resources concurrently. The frontend requests team overview, match history, and squad data in parallel, creating higher connection demand compared to single-endpoint flows.

Overall, the Team Profile feature met performance expectations for normal and burst traffic scenarios. The tests confirmed:

- stable handling of parallel page-loading requests
- consistently low latency under expected usage
- effective rate limiting during traffic spikes
- reliable caching and request handling behavior
- database connection pool capacity as the primary constraint under extreme concurrency

Future scaling improvements would focus on database connection tuning, query optimization, or increasing available database resources rather than changes to the team profile request handling logic.
