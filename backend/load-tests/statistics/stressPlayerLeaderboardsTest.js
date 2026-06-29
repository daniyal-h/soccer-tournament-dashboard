import http from "k6/http";
import { check, sleep } from "k6";

import { BASE_URL, TOURNAMENT_ID } from "../constants.js";

const CATEGORIES = ["goals", "assists", "yellow_cards"];

export const options = {
    scenarios: {
        player_leaderboards_stress: {
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

export default function playerLeaderboardsStressTest() {
    for (const category of CATEGORIES) {
        const response = http.get(
            `${BASE_URL}/api/v1/tournaments/${TOURNAMENT_ID}/player-leaderboards?category=${category}`,
        );

        check(response, {
            [`${category} leaderboard status is 200 or 429`]: (r) =>
                r.status === 200 || r.status === 429,
            [`${category} leaderboard response under 2000ms`]: (r) =>
                r.timings.duration < 2000,
        });

        sleep(1);
    }
}
