import http from "k6/http";
import { check, sleep } from "k6";

import { BASE_URL, TEAM_ID, TOURNAMENT_ID } from "../constants.js";

export const options = {
    scenarios: {
        team_profile_stress: {
            executor: "ramping-vus",

            stages: [
                { duration: "1m", target: 25 },
                { duration: "2m", target: 50 },
                { duration: "2m", target: 100 },
                { duration: "2m", target: 200 },
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

export default function teamProfileStressTest() {
    const teamsResponse = http.get(
        `${BASE_URL}/api/v1/tournaments/${TOURNAMENT_ID}/teams`,
    );

    check(teamsResponse, {
        "teams status is 200 or 429": (r) =>
            r.status === 200 || r.status === 429,
        "teams response under 2000ms": (r) => r.timings.duration < 2000,
    });

    const profileResponses = http.batch([
        [
            "GET",
            `${BASE_URL}/api/v1/tournaments/${TOURNAMENT_ID}/teams/${TEAM_ID}/profile`,
        ],
        [
            "GET",
            `${BASE_URL}/api/v1/tournaments/${TOURNAMENT_ID}/teams/${TEAM_ID}/matches`,
        ],
        [
            "GET",
            `${BASE_URL}/api/v1/tournaments/${TOURNAMENT_ID}/teams/${TEAM_ID}/squad`,
        ],
    ]);

    check(profileResponses[0], {
        "profile status is 200 or 429": (r) =>
            r.status === 200 || r.status === 429,
        "profile response under 2000ms": (r) => r.timings.duration < 2000,
    });

    check(profileResponses[1], {
        "team matches status is 200 or 429": (r) =>
            r.status === 200 || r.status === 429,
        "team matches response under 2000ms": (r) => r.timings.duration < 2000,
    });

    check(profileResponses[2], {
        "squad status is 200 or 429": (r) =>
            r.status === 200 || r.status === 429,
        "squad response under 2000ms": (r) => r.timings.duration < 2000,
    });

    sleep(1);
}
