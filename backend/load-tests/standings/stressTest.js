import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:8000";

export const options = {
    scenarios: {
        standings_stress: {
            executor: "ramping-vus",

            stages: [
                // gradual ramp
                { duration: "1m", target: 25 },

                // sustained heavy load
                { duration: "2m", target: 50 },

                // push harder
                { duration: "2m", target: 100 },

                // breaking-point zone
                { duration: "2m", target: 200 },

                // recovery
                { duration: "1m", target: 0 },
            ],

            gracefulRampDown: "30s",
        },
    },

    thresholds: {
        http_req_duration: ["p(95)<2000"],
        checks: ["rate>0.95"],
    },
};

export default function standingsStressTest() {
    const response = http.get(`${BASE_URL}/api/v1/tournaments/1/standings`);

    check(response, {
        "status is 200 or 429": (r) => r.status === 200 || r.status === 429,

        "response under 2000ms": (r) => r.timings.duration < 2000,
    });

    sleep(1);
}
