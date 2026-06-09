import http from "k6/http";
import { check } from "k6";
import { Counter } from "k6/metrics";

import { BASE_URL, MATCH_ID } from "../constants.js";

const rateLimitedResponses = new Counter("rate_limited_responses");

export const options = {
    scenarios: {
        match_events_rate_limit: {
            executor: "constant-arrival-rate",
            rate: 120,
            timeUnit: "1m",
            duration: "1m",
            preAllocatedVUs: 10,
            maxVUs: 20,
        },
    },

    thresholds: {
        http_req_duration: ["p(95)<500"],
        checks: ["rate>0.99"],
        rate_limited_responses: ["count>0"],
    },
};

export default function matchEventsRateLimitTest() {
    const response = http.get(`${BASE_URL}/api/v1/matches/${MATCH_ID}/events`);

    if (response.status === 429) {
        rateLimitedResponses.add(1);
    }

    check(response, {
        "status is 200 or 429": (r) => r.status === 200 || r.status === 429,
    });
}
