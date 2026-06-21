import http from "k6/http";
import { check, sleep } from "k6";

import { BASE_URL, MATCH_ID, TOURNAMENT_ID } from "../constants.js";

export const options = {
    scenarios: {
        schedule_navigation_stress: {
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

export default function scheduleNavigationStressTest() {
    const scheduleResponse = http.get(
        `${BASE_URL}/api/v1/tournaments/${TOURNAMENT_ID}/matches`,
    );

    check(scheduleResponse, {
        "schedule status is 200 or 429": (r) =>
            r.status === 200 || r.status === 429,
        "schedule response under 2000ms": (r) => r.timings.duration < 2000,
    });

    const matchResponses = http.batch([
        ["GET", `${BASE_URL}/api/v1/matches/${MATCH_ID}`],
        ["GET", `${BASE_URL}/api/v1/matches/${MATCH_ID}/events`],
    ]);

    check(matchResponses[0], {
        "match status is 200 or 429": (r) =>
            r.status === 200 || r.status === 429,
        "match response under 2000ms": (r) => r.timings.duration < 2000,
    });

    check(matchResponses[1], {
        "events status is 200 or 429": (r) =>
            r.status === 200 || r.status === 429,
        "events response under 2000ms": (r) => r.timings.duration < 2000,
    });

    sleep(1);
}
