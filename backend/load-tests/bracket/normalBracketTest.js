import http from "k6/http";
import { check, sleep } from "k6";

import { BASE_URL, TOURNAMENT_ID } from "../constants.js";

export const options = {
    scenarios: {
        bracket_normal: {
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

export default function bracketNormalLoadTest() {
    const response = http.get(
        `${BASE_URL}/api/v1/tournaments/${TOURNAMENT_ID}/bracket`,
    );

    check(response, {
        "bracket status is 200": (r) => r.status === 200,
        "bracket response under 500ms": (r) => r.timings.duration < 500,
    });

    sleep(1);
}
