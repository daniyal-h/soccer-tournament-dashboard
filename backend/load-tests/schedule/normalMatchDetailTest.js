import http from "k6/http";
import { check, sleep } from "k6";

import { BASE_URL, MATCH_ID } from "../constants.js";

export const options = {
    scenarios: {
        match_detail_normal: {
            executor: "constant-arrival-rate",
            rate: 55,
            timeUnit: "1m",
            duration: "10m",
            preAllocatedVUs: 5,
            maxVUs: 10,
        },
    },

    // <1% failed requests, 95% of responses under 500ms, and >99% successful validation checks
    thresholds: {
        http_req_failed: ["rate<0.01"],
        http_req_duration: ["p(95)<500"],
        checks: ["rate>0.99"],
    },
};

export default function matchDetailNormalLoadTest() {
    const responses = http.batch([
        ["GET", `${BASE_URL}/api/v1/matches/${MATCH_ID}`],
        ["GET", `${BASE_URL}/api/v1/matches/${MATCH_ID}/events`],
    ]);

    check(responses[0], {
        "match status is 200": (r) => r.status === 200,
        "match response under 500ms": (r) => r.timings.duration < 500,
    });

    check(responses[1], {
        "events status is 200": (r) => r.status === 200,
        "events response under 500ms": (r) => r.timings.duration < 500,
    });

    sleep(1);
}
