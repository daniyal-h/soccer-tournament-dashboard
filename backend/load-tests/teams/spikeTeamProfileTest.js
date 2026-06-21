import http from "k6/http";
import { check, sleep } from "k6";

import { BASE_URL, TEAM_ID, TOURNAMENT_ID } from "../constants.js";

export const options = {
    scenarios: {
        team_profile_navigation_spike: {
            executor: "ramping-arrival-rate",
            stages: [
                { duration: "30s", target: 30 },
                { duration: "10s", target: 120 },
                { duration: "1m", target: 120 },
                { duration: "20s", target: 30 },
                { duration: "20s", target: 0 },
            ],
            timeUnit: "1m",
            preAllocatedVUs: 10,
            maxVUs: 50,
        },
    },

    thresholds: {
        http_req_duration: ["p(95)<1000"],
        checks: ["rate>0.99"],
    },
};

export default function teamProfileNavigationSpikeLoadTest() {
    const teamsResponse = http.get(
        `${BASE_URL}/api/v1/tournaments/${TOURNAMENT_ID}/teams`,
    );

    check(teamsResponse, {
        "teams status is 200 or 429": (r) =>
            r.status === 200 || r.status === 429,
        "teams response under 1000ms": (r) => r.timings.duration < 1000,
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
        "profile response under 1000ms": (r) => r.timings.duration < 1000,
    });

    check(profileResponses[1], {
        "team matches status is 200 or 429": (r) =>
            r.status === 200 || r.status === 429,
        "team matches response under 1000ms": (r) => r.timings.duration < 1000,
    });

    check(profileResponses[2], {
        "squad status is 200 or 429": (r) =>
            r.status === 200 || r.status === 429,
        "squad response under 1000ms": (r) => r.timings.duration < 1000,
    });

    sleep(1);
}
