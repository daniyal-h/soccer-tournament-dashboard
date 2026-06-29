import http from "k6/http";
import { check, sleep } from "k6";

import { BASE_URL, TOURNAMENT_ID } from "../constants.js";

export const options = {
    scenarios: {
        bracket_spike: {
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

export default function bracketSpikeTest() {
    const response = http.get(
        `${BASE_URL}/api/v1/tournaments/${TOURNAMENT_ID}/bracket`,
    );

    check(response, {
        "bracket status is 200 or 429": (r) =>
            r.status === 200 || r.status === 429,
        "bracket response under 1000ms": (r) => r.timings.duration < 1000,
    });

    sleep(1);
}
