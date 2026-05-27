# Load Testing Report

## Overview

Load testing was performed using k6 against the FastAPI backend running locally with Dockerized PostgreSQL. Tests focused on validating endpoint performance, latency consistency, and rate limiting behaviour under sustained and burst traffic patterns.

The current sprint only includes the standings endpoint, so load testing was limited to standings retrieval scenarios.

---

## Environment

| Component         | Configuration             |
| ----------------- | ------------------------- |
| Backend           | FastAPI                   |
| Database          | PostgreSQL (Docker)       |
| Load Testing Tool | k6                        |
| Endpoint Tested   | `GET /api/v1/standings/1` |
| Rate Limit        | 60 requests/min/IP        |

---

# 1. Normal Load Test

## Goal

Validate sustained endpoint performance under expected traffic while remaining below the configured rate limit (60 req/min/IP).

## Configuration

| Setting      | Value                                             |
| ------------ | ------------------------------------------------- |
| Executor     | `constant-arrival-rate`                           |
| Request Rate | 55 requests/minute                                |
| Duration     | 10 minutes                                        |
| Thresholds   | <1% failures, p95 < 500ms, >99% successful checks |

## Results

| Metric            | Result  |
| ----------------- | ------- |
| Total Requests    | 550     |
| Failure Rate      | 0.00%   |
| Successful Checks | 100.00% |
| Average Latency   | 7.53ms  |
| p95 Latency       | 12.28ms |
| Max Latency       | 15.16ms |

## Outcome

The standings endpoint remained stable under sustained load with zero failed requests and consistently low latency. No degradation in performance or instability was observed during the test duration.

The backend demonstrated significantly higher throughput capacity than the configured rate limit, indicating that the limiter itself becomes the controlling factor before backend resource exhaustion occurs.

---

# 2. Spike Test

## Goal

Simulate sudden bursts of traffic similar to high-activity periods during live matches while verifying that the backend remains responsive and that rate limiting behaves correctly under elevated load.

## Configuration

| Setting            | Value                                              |
| ------------------ | -------------------------------------------------- |
| Executor           | `ramping-arrival-rate`                             |
| Peak Request Rate  | 120 requests/minute                                |
| Duration           | 2 minutes 20 seconds                               |
| Stages             | warmup, spike, sustained spike, recovery, cooldown |
| Thresholds         | p95 < 1000ms, >99% successful checks               |
| Accepted Responses | 200 OK, 429 Too Many Requests                      |

## Results

| Metric             | Result   |
| ------------------ | -------- |
| Total Requests     | 169      |
| Successful Checks  | 100.00%  |
| Average Latency    | 8.28ms   |
| p95 Latency        | 13.46ms  |
| Max Latency        | 15.30ms  |
| HTTP 429 Responses | 48       |
| HTTP Failure Rate  | 28.40%\* |

\* k6 classifies HTTP 429 responses as failed HTTP requests by default. These responses were expected and intentionally accepted during spike testing.

## Outcome

The backend remained stable and highly responsive during sudden bursts of elevated traffic. Rate limiting activated correctly under spike conditions by returning HTTP 429 responses once the configured request threshold was exceeded.

Despite the elevated request rate and intentional triggering of rate limiting, latency remained consistently low throughout the scenario, with a p95 latency of 13.46ms and no observed instability, crashes, or response degradation.

The spike test confirms that the backend can gracefully handle abrupt traffic surges while maintaining responsiveness and enforcing protective traffic controls.

---

# 3. Rate Limit Validation Test

## Goal

Verify that the API correctly rejects excessive traffic using HTTP 429 responses without crashing or degrading backend responsiveness.

## Configuration

| Setting            | Value                                                          |
| ------------------ | -------------------------------------------------------------- |
| Executor           | `constant-arrival-rate`                                        |
| Request Rate       | 120 requests/minute                                            |
| Duration           | 1 minute                                                       |
| Thresholds         | p95 < 500ms, >99% successful checks, at least one 429 response |
| Accepted Responses | 200 OK, 429 Too Many Requests                                  |

## Results

| Metric            | Result  |
| ----------------- | ------- |
| Total Requests    | 121     |
| 200 Responses     | 60      |
| 429 Responses     | 61      |
| Successful Checks | 100.00% |
| Average Latency   | 7.21ms  |
| p95 Latency       | 12.90ms |
| Max Latency       | 25.79ms |

## Outcome

The standings endpoint correctly enforced the configured rate limit of 60 requests per minute per IP by returning HTTP 429 responses once the threshold was exceeded.

Despite rejecting approximately half of incoming requests, backend latency remained consistently low throughout the test, with a p95 latency of 12.90ms and no observed instability or degradation. The test confirms that rate limiting functions correctly while maintaining backend responsiveness under excessive traffic conditions.

---

# 4. Stress Test

## Goal

Evaluate backend behavior under extreme sustained traffic and verify that the system remains stable while enforcing protective rate limiting.

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
| Total Requests     | 36,222   |
| Successful Checks  | 100.00%  |
| Failed Checks      | 0.00%    |
| Average Latency    | 54.18ms  |
| p95 Latency        | 201.01ms |
| Max Latency        | 1.83s    |
| HTTP Failure Rate  | 98.67%\* |
| Peak Virtual Users | 200      |

\* k6 classifies HTTP 429 responses as failed HTTP requests by default. These responses were expected during stress testing because the test intentionally exceeded the configured rate limit.

## Outcome

The stress scenario subjected the standings endpoint to sustained high-concurrency traffic with up to 200 virtual users over 8 minutes.

The backend remained stable throughout the test and completed all validation checks successfully. Although the HTTP failure rate was high, this was caused by expected HTTP 429 responses from the rate limiter rather than backend crashes or unhandled failures.

Latency remained within the stress-test threshold, with a p95 latency of 201.01ms and a maximum observed latency of 1.83s. The result confirms that the backend can remain responsive under extreme overload while continuing to enforce traffic protection through rate limiting.

---

# Conclusion

Load testing results indicate that the standings endpoint performs reliably under sustained traffic, sudden traffic spikes, and extreme overload conditions.

Under normal load, the backend maintained extremely low latency with zero failed validation checks while sustaining continuous traffic below configured rate limits. Spike testing confirmed that the backend remained responsive during abrupt bursts of traffic while correctly enforcing HTTP 429 rate limiting responses once thresholds were exceeded.

Stress testing further demonstrated that the backend remained stable under prolonged high-concurrency traffic, processing tens of thousands of requests without crashes or severe latency degradation. Although a large percentage of requests were rejected during overload conditions, these responses were expected and reflected the correct operation of the API protection mechanisms rather than backend instability.

Overall, the load testing process validated:

- sustained backend responsiveness
- effective rate limiting behavior
- stable request handling under heavy load
- low latency under realistic operating conditions
- resilience against excessive traffic

Additional load testing will expand to match retrieval, search functionality, and combined multi-endpoint traffic scenarios as the application continues development.
