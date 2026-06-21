import http from "k6/http";
import { check, sleep } from "k6";

import { BASE_URL, TEAM_ID, TOURNAMENT_ID } from "../constants.js";

export const options = {
    scenarios: {
        team_profile_normal: {
            executor: "constant-arrival-rate",
            rate: 55,
            timeUnit: "1m",
            duration: "10m",
            preAllocatedVUs: 5,
            maxVUs: 10,
        },
    },

    thresholds: {
        http_req_failed: ["rate<0.01"],
        http_req_duration: ["p(95)<500"],
        checks: ["rate>0.99"],
    },
};

export default function teamProfileNormalLoadTest() {
    const responses = http.batch([
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

    check(responses[0], {
        "profile status is 200": (r) => r.status === 200,
        "profile response under 500ms": (r) => r.timings.duration < 500,
    });

    check(responses[1], {
        "team matches status is 200": (r) => r.status === 200,
        "team matches response under 500ms": (r) => r.timings.duration < 500,
    });

    check(responses[2], {
        "squad status is 200": (r) => r.status === 200,
        "squad response under 500ms": (r) => r.timings.duration < 500,
    });

    sleep(1);
}
