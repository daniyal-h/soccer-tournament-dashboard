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

| Metric            | Result  |
| ----------------- | ------- |
| Total Requests    | 543     |
| Failure Rate      | 0.00%   |
| Successful Checks | 100.00% |
| Average Latency   | 12.68ms |
| p95 Latency       | 19.87ms |
| Max Latency       | 32.49ms |

## Outcome

The Statistics page flow remained stable under sustained load with zero failed requests and all validation checks passing successfully.

The test completed 181 simulated Statistics page loads, generating 543 total HTTP requests across the goals, assists, and yellow cards leaderboard categories. These requests were executed sequentially to represent typical frontend behaviour where users switch between leaderboard categories rather than loading them simultaneously.

All leaderboard endpoints consistently returned successful responses throughout the 10 minute test duration. The complete flow maintained very low response times, with an average latency of 12.68ms and a p95 latency of 19.87ms, remaining well below the configured 500ms threshold.

The maximum observed latency reached only 32.49ms, with no noticeable spikes or performance degradation during the test.

An initial calibration run exceeded the application's configured rate limit because each simulated Statistics page flow requested all three leaderboard categories, producing approximately 165 requests per minute. The test was adjusted to 18 simulated page loads per minute, resulting in approximately 54 requests per minute and keeping traffic below the configured rate limit.

The test confirms that users can repeatedly browse player leaderboards and switch between statistical categories while the backend continues serving cached leaderboard data reliably under expected traffic conditions.

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

| Metric             | Result   |
| ------------------ | -------- |
| Total Requests     | 507      |
| Successful Checks  | 100.00%  |
| Average Latency    | 8.41ms   |
| p95 Latency        | 14.45ms  |
| Max Latency        | 95.33ms  |
| HTTP 429 Responses | 385      |
| HTTP Failure Rate  | 75.93%\* |

\* k6 classifies HTTP 429 responses as failed HTTP requests by default. These responses were expected because the spike test intentionally exceeded configured rate limits.

## Outcome

The Statistics feature remained stable during sudden bursts of elevated traffic. The test simulated users rapidly opening the Statistics page and switching between the goals, assists, and yellow cards leaderboard categories.

All validation checks completed successfully, with the backend consistently returning either successful responses or expected rate-limited responses when traffic exceeded the configured request limit.

Rate limiting activated as expected during the spike, producing 385 HTTP 429 responses. Despite this sudden increase in traffic, latency remained consistently low, with an average response time of 8.41ms and a p95 latency of 14.45ms.

The maximum observed latency reached only 95.33ms, remaining well below the configured 1000ms threshold and showing no sustained performance degradation.

The test confirms that the Statistics feature remains responsive during short periods of heavy demand while correctly enforcing API protection mechanisms through rate limiting.

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

| Metric             | Result   |
| ------------------ | -------- |
| Total Requests     | 18,766   |
| Successful Checks  | 98.30%   |
| Failed Checks      | 1.69%    |
| Average Latency    | 1.04s    |
| p95 Latency        | 490.68ms |
| Max Latency        | 1m 0s    |
| HTTP Failure Rate  | 98.08%\* |
| Peak Virtual Users | 200      |

\* k6 classifies HTTP 429 responses as failed HTTP requests by default. These responses were expected during stress testing because the test intentionally exceeded configured rate limits. Some additional failures occurred when the database connection pool reached its configured capacity during peak load.

## Outcome

The Statistics feature remained operational under extreme sustained traffic and passed the configured stress thresholds, with 98.30% successful validation checks and a p95 latency of 490.68ms, remaining well below the configured 2000ms threshold.

The test completed 6,191 simulated Statistics page flows and generated 18,766 total HTTP requests across the goals, assists, and yellow cards leaderboard endpoints. The flow reached 200 virtual users during the peak stress phase.

During peak load, the backend logs showed SQLAlchemy database connection pool exhaustion:

`QueuePool limit of size 5 overflow 10 reached, connection timed out, timeout 30.00`

This indicates that the primary bottleneck under extreme concurrency was database connection availability rather than request processing logic. Although each leaderboard request performs a single cached query, the sustained volume of concurrent requests eventually exhausted the available database connections.

Despite this bottleneck, the backend continued serving accepted requests efficiently. Successful responses maintained an average latency of 32.68ms and a p95 latency of 124.02ms, while the overall p95 latency remained 490.68ms. The maximum observed latency reached one minute due to requests waiting for database connections before timing out.

The test confirms that the Statistics feature remains responsive under heavy overload while also identifying database connection pool capacity as the primary scaling constraint for high-concurrency leaderboard browsing.

---

# Conclusion

The Statistics feature load tests validated that the backend can reliably support player leaderboard browsing under expected usage patterns, sudden traffic spikes, and extreme concurrent load.

Normal load testing confirmed that the Statistics page flow handled sustained traffic with no failed requests. The test completed 181 simulated Statistics page loads, generating 543 total HTTP requests across the goals, assists, and yellow cards leaderboard categories. All requests completed successfully, maintaining an average latency of 12.68ms and a p95 latency of 19.87ms.

Spike testing demonstrated that the Statistics feature remained responsive during sudden increases in traffic. Users were simulated browsing the leaderboard categories in sequence, generating requests across all three statistical endpoints. Rate limiting activated correctly when traffic exceeded configured limits, producing HTTP 429 responses while maintaining excellent responsiveness with a p95 latency of only 14.45ms.

Stress testing with 200 virtual users identified database connection capacity as the primary scaling limitation under extreme concurrent load. The Statistics feature successfully completed 98.30% of validation checks while maintaining an overall p95 latency of 490.68ms, well below the configured 2000ms threshold.

During peak load, SQLAlchemy reported database connection pool exhaustion after the connection pool reached its configured capacity. This bottleneck originated from concurrent access to cached leaderboard data rather than inefficient endpoint processing, as successful requests continued to average 32.68ms with a p95 latency of 124.02ms.

Overall, the Statistics feature met performance expectations for normal and burst traffic scenarios. The tests confirmed:

- stable handling of sequential leaderboard category requests
- consistently low latency under expected usage
- effective rate limiting during traffic spikes
- reliable PostgreSQL-backed caching and request handling
- database connection pool capacity as the primary constraint under extreme concurrency

Future scaling improvements would focus on increasing database connection capacity, tuning connection pool configuration, or scaling application infrastructure rather than changes to the Statistics endpoint implementation.
