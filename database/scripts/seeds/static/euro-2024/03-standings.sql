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
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 25), 'A', 1, 7, 2, 1, 0, 8, 2),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 15), 'A', 2, 5, 1, 2, 0, 5, 3),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 769), 'A', 3, 3, 1, 0, 2, 2, 5),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 1108), 'A', 4, 1, 0, 1, 2, 2, 7),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 9), 'B', 1, 9, 3, 0, 0, 5, 0),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 768), 'B', 2, 4, 1, 1, 1, 3, 3),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 3), 'B', 3, 2, 0, 2, 1, 3, 6),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 778), 'B', 4, 1, 0, 1, 2, 3, 5),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 10), 'C', 1, 5, 1, 2, 0, 2, 1),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 21), 'C', 2, 3, 0, 3, 0, 2, 2),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 1091), 'C', 3, 3, 0, 3, 0, 2, 2),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 14), 'C', 4, 2, 0, 2, 1, 1, 2),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 775), 'D', 1, 6, 2, 0, 1, 6, 4),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 2), 'D', 2, 5, 1, 2, 0, 2, 1),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 1118), 'D', 3, 4, 1, 1, 1, 4, 4),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 24), 'D', 4, 1, 0, 1, 2, 3, 6),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 774), 'E', 1, 4, 1, 1, 1, 4, 3),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 1), 'E', 2, 4, 1, 1, 1, 2, 1),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 773), 'E', 3, 4, 1, 1, 1, 3, 3),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 772), 'E', 4, 4, 1, 1, 1, 2, 4),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 27), 'F', 1, 6, 2, 0, 1, 5, 3),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 777), 'F', 2, 6, 2, 0, 1, 5, 5),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 1104), 'F', 3, 4, 1, 1, 1, 4, 4),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 770), 'F', 4, 1, 0, 1, 2, 3, 5)
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
