import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8000";

export const options = {
    scenarios: {
        standings_spike: {
            executor: "ramping-arrival-rate",

            stages: [
                // warmup
                { duration: "30s", target: 30 },

                // sudden spike
                { duration: "10s", target: 120 },

                // sustain spike briefly
                { duration: "1m", target: 120 },

                // recovery
                { duration: "20s", target: 30 },

                // cooldown
                { duration: "20s", target: 0 },
            ],

            timeUnit: "1m",

            preAllocatedVUs: 10,
            maxVUs: 50,
        },
    },

    // Accept 429 responses during spike traffic
    thresholds: {
        http_req_duration: ["p(95)<1000"],
        checks: ["rate>0.99"],
    },
};

export default function standingsSpikeLoadTest() {
    const response = http.get(`${BASE_URL}/api/v1/tournaments/1/standings`);

    check(response, {
        "status is 200 or 429": (r) => r.status === 200 || r.status === 429,

        "response under 1000ms": (r) => r.timings.duration < 1000,
    });

    sleep(1);
}
