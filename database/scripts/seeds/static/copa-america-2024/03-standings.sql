BEGIN TRANSACTION;

INSERT INTO standings (
    tournament_id,
    team_id,
    "group",
    position,
    points,
    wins,
    draws,
    losses,
    goals_for,
    goals_against
)
VALUES
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 26), 'A', 1, 9, 3, 0, 0, 5, 0),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 5529), 'A', 2, 4, 1, 1, 1, 1, 2),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 2383), 'A', 3, 2, 0, 2, 1, 0, 1),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 30), 'A', 4, 1, 0, 1, 2, 0, 3),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 2379), 'B', 1, 9, 3, 0, 0, 6, 1),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 2382), 'B', 2, 4, 1, 1, 1, 4, 3),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 16), 'B', 3, 4, 1, 1, 1, 1, 1),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 2385), 'B', 4, 0, 0, 0, 3, 1, 7),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 7), 'C', 1, 9, 3, 0, 0, 9, 1),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 11), 'C', 2, 6, 2, 0, 1, 6, 5),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 2384), 'C', 3, 3, 1, 0, 2, 3, 3),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 2381), 'C', 4, 0, 0, 0, 3, 1, 10),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 8), 'D', 1, 7, 2, 1, 0, 6, 2),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 6), 'D', 2, 5, 1, 2, 0, 5, 2),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 29), 'D', 3, 4, 1, 1, 1, 2, 4),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 2380), 'D', 4, 0, 0, 0, 3, 3, 8)
ON CONFLICT (tournament_id, team_id)
DO UPDATE SET
    "group" = EXCLUDED."group",
    position = EXCLUDED.position,
    points = EXCLUDED.points,
    wins = EXCLUDED.wins,
    draws = EXCLUDED.draws,
    losses = EXCLUDED.losses,
    goals_for = EXCLUDED.goals_for,
    goals_against = EXCLUDED.goals_against;

COMMIT TRANSACTION;
