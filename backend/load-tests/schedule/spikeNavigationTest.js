import http from "k6/http";
import { check, sleep } from "k6";

import { BASE_URL, MATCH_ID, TOURNAMENT_ID } from "../constants.js";

export const options = {
    scenarios: {
        schedule_navigation_spike: {
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

export default function scheduleNavigationSpikeLoadTest() {
    const scheduleResponse = http.get(
        `${BASE_URL}/api/v1/tournaments/${TOURNAMENT_ID}/matches`,
    );

    check(scheduleResponse, {
        "schedule status is 200 or 429": (r) =>
            r.status === 200 || r.status === 429,
        "schedule response under 1000ms": (r) => r.timings.duration < 1000,
    });

    const matchResponses = http.batch([
        ["GET", `${BASE_URL}/api/v1/matches/${MATCH_ID}`],
        ["GET", `${BASE_URL}/api/v1/matches/${MATCH_ID}/events`],
    ]);

    check(matchResponses[0], {
        "match status is 200 or 429": (r) =>
            r.status === 200 || r.status === 429,
        "match response under 1000ms": (r) => r.timings.duration < 1000,
    });

    check(matchResponses[1], {
        "events status is 200 or 429": (r) =>
            r.status === 200 || r.status === 429,
        "events response under 1000ms": (r) => r.timings.duration < 1000,
    });

    sleep(1);
}
