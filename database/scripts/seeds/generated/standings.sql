BEGIN TRANSACTION;

INSERT INTO tournament_teams (
    tournament_id,
    team_id,
    "group"
)
VALUES
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 1118), 'A'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 13), 'A'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 2382), 'A'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 1569), 'A'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 10), 'B'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 2384), 'B'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 22), 'B'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 767), 'B'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 26), 'C'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 24), 'C'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 16), 'C'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 23), 'C'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 2), 'D'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 20), 'D'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 28), 'D'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 21), 'D'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 12), 'E'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 9), 'E'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 25), 'E'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 29), 'E'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 31), 'F'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 3), 'F'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 1), 'F'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 5529), 'F'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 6), 'G'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 15), 'G'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 1530), 'G'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 14), 'G'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 27), 'H'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 17), 'H'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 7), 'H'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 1504), 'H')
ON CONFLICT (tournament_id, team_id)
DO UPDATE SET
    "group" = EXCLUDED."group";

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
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 1118), 'A', 1, 7, 2, 1, 0, 5, 1),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 13), 'A', 2, 6, 2, 0, 1, 5, 4),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 2382), 'A', 3, 4, 1, 1, 1, 4, 3),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 1569), 'A', 4, 0, 0, 0, 3, 1, 7),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 10), 'B', 1, 7, 2, 1, 0, 9, 2),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 2384), 'B', 2, 5, 1, 2, 0, 2, 1),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 22), 'B', 3, 3, 1, 0, 2, 4, 7),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 767), 'B', 4, 1, 0, 1, 2, 1, 6),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 26), 'C', 1, 6, 2, 0, 1, 5, 2),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 24), 'C', 2, 4, 1, 1, 1, 2, 2),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 16), 'C', 3, 4, 1, 1, 1, 2, 3),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 23), 'C', 4, 3, 1, 0, 2, 3, 5),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 2), 'D', 1, 6, 2, 0, 1, 6, 3),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 20), 'D', 2, 6, 2, 0, 1, 3, 4),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 28), 'D', 3, 4, 1, 1, 1, 1, 1),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 21), 'D', 4, 1, 0, 1, 2, 1, 3),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 12), 'E', 1, 6, 2, 0, 1, 4, 3),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 9), 'E', 2, 4, 1, 1, 1, 9, 3),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 25), 'E', 3, 4, 1, 1, 1, 6, 5),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 29), 'E', 4, 3, 1, 0, 2, 3, 11),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 31), 'F', 1, 7, 2, 1, 0, 4, 1),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 3), 'F', 2, 5, 1, 2, 0, 4, 1),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 1), 'F', 3, 4, 1, 1, 1, 1, 2),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 5529), 'F', 4, 0, 0, 0, 3, 2, 7),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 6), 'G', 1, 6, 2, 0, 1, 3, 1),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 15), 'G', 2, 6, 2, 0, 1, 4, 3),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 1530), 'G', 3, 4, 1, 1, 1, 4, 4),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 14), 'G', 4, 1, 0, 1, 2, 5, 8),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 27), 'H', 1, 6, 2, 0, 1, 6, 4),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 17), 'H', 2, 4, 1, 1, 1, 4, 4),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 7), 'H', 3, 4, 1, 1, 1, 2, 2),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022'), (SELECT id FROM teams WHERE external_api_id = 1504), 'H', 4, 3, 1, 0, 2, 5, 7)
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
