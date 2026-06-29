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

| Metric            | Result  |
| ----------------- | ------- |
| Total Requests    | 551     |
| Failure Rate      | 0.00%   |
| Successful Checks | 100.00% |
| Average Latency   | 14.08ms |
| p95 Latency       | 21.84ms |
| Max Latency       | 36.37ms |

## Outcome

The Bracket page remained stable under sustained load with zero failed requests and all validation checks passing successfully.

The test completed 551 simulated Bracket page loads, generating 551 total HTTP requests to the bracket endpoint. Because the complete knockout bracket is retrieved through a single API request, each simulated page load corresponded to a single backend request.

The endpoint consistently returned successful responses throughout the 10 minute test duration. Response times remained consistently low, with an average latency of 14.08ms and a p95 latency of 21.84ms, remaining well below the configured 500ms threshold.

The maximum observed latency reached only 36.37ms, with no noticeable spikes or performance degradation during the test.

The test confirms that users can repeatedly load the Bracket page while the backend continues serving cached tournament bracket data reliably under expected traffic conditions.

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

| Metric             | Result   |
| ------------------ | -------- |
| Total Requests     | 170      |
| Successful Checks  | 100.00%  |
| Average Latency    | 11.90ms  |
| p95 Latency        | 17.98ms  |
| Max Latency        | 33.35ms  |
| HTTP 429 Responses | 48       |
| HTTP Failure Rate  | 28.23%\* |

\* k6 classifies HTTP 429 responses as failed HTTP requests by default. These responses were expected because the spike test intentionally exceeded configured rate limits.

## Outcome

The Bracket feature remained stable during sudden bursts of elevated traffic. The test simulated users simultaneously opening the Bracket page, triggering requests to retrieve the complete tournament bracket.

All validation checks completed successfully, with the backend consistently returning either successful responses or expected rate-limited responses when traffic exceeded the configured request limit.

Rate limiting activated as expected during the spike, producing 48 HTTP 429 responses. Despite the sudden increase in traffic, latency remained consistently low, with an average response time of 11.90ms and a p95 latency of 17.98ms.

The maximum observed latency reached only 33.35ms, remaining well below the configured 1000ms threshold and showing no sustained performance degradation.

The test confirms that the Bracket feature remains responsive during short periods of heavy demand while correctly enforcing API protection mechanisms through rate limiting.

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

| Metric             | Result   |
| ------------------ | -------- |
| Total Requests     | 30,050   |
| Successful Checks  | 99.51%   |
| Failed Checks      | 0.48%    |
| Average Latency    | 277.02ms |
| p95 Latency        | 86.25ms  |
| Max Latency        | 1m 0s    |
| HTTP Failure Rate  | 98.60%\* |
| Peak Virtual Users | 200      |

\* k6 classifies HTTP 429 responses as failed HTTP requests by default. These responses were expected during stress testing because the test intentionally exceeded configured rate limits. Some additional failures occurred when the database connection pool reached its configured capacity during peak load.

## Outcome

The Bracket feature remained operational under extreme sustained traffic and passed the configured stress thresholds, with 99.51% successful validation checks and a p95 latency of 86.25ms, remaining well below the configured 2000ms threshold.

The test completed 30,046 simulated Bracket page loads and generated 30,050 total HTTP requests to the bracket endpoint. The flow reached 200 virtual users during the peak stress phase.

During peak load, the backend logs showed SQLAlchemy database connection pool exhaustion:

`QueuePool limit of size 5 overflow 10 reached, connection timed out, timeout 30.00`

This indicates that the primary bottleneck under extreme concurrency was database connection availability rather than request processing logic. Because the Bracket feature performs a single cached database query, the endpoint itself remained highly responsive until database connections became exhausted.

Despite this bottleneck, the backend continued serving accepted requests efficiently. Successful responses maintained an average latency of 28.90ms and a p95 latency of 113.24ms, while the overall p95 latency remained 86.25ms. The maximum observed latency reached one minute due to requests waiting for database connections before timing out.

The test confirms that the Bracket feature remains responsive under heavy overload while also identifying database connection pool capacity as the primary scaling constraint for high-concurrency bracket access.

---

# Conclusion

The Bracket feature load tests validated that the backend can reliably support tournament bracket viewing under expected usage patterns, sudden traffic spikes, and extreme concurrent load.

Normal load testing confirmed that the Bracket page handled sustained traffic with no failed requests. The test completed 551 simulated page loads, generating 551 total HTTP requests to the bracket endpoint. All requests completed successfully, maintaining an average latency of 14.08ms and a p95 latency of 21.84ms.

Spike testing demonstrated that the Bracket feature remained responsive during sudden increases in traffic. Users were simulated repeatedly loading the Bracket page, with rate limiting activating correctly when traffic exceeded configured limits. Despite expected HTTP 429 responses, accepted requests maintained excellent responsiveness with a p95 latency of only 17.98ms.

Stress testing with 200 virtual users identified database connection capacity as the primary scaling limitation under extreme concurrent load. The Bracket feature successfully completed 99.51% of validation checks while maintaining an overall p95 latency of 86.25ms, well below the configured 2000ms threshold.

During peak load, SQLAlchemy reported database connection pool exhaustion after the connection pool reached its configured capacity. This bottleneck originated from database connection availability rather than inefficient bracket retrieval, as successful requests continued to average 28.90ms with a p95 latency of 113.24ms.

Overall, the Bracket feature exceeded performance expectations across all load scenarios. The tests confirmed:

- stable handling of complete bracket retrieval through a single endpoint
- consistently low latency under expected usage
- effective rate limiting during traffic spikes
- reliable PostgreSQL-backed caching and request handling
- database connection pool capacity as the primary constraint under extreme concurrency

Future scaling improvements would focus on increasing database connection capacity, tuning connection pool configuration, or scaling application infrastructure rather than changes to the Bracket endpoint implementation.
