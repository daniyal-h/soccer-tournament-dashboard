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
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 31), 'A', 1, 7, 2, 1, 0, 6, 1),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1500), 'A', 2, 3, 0, 3, 0, 2, 2),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1524), 'A', 3, 2, 0, 2, 1, 0, 2),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1507), 'A', 4, 2, 0, 2, 1, 1, 4),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 32), 'B', 1, 7, 2, 1, 0, 3, 1),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1531), 'B', 2, 6, 2, 0, 1, 5, 4),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1529), 'B', 3, 2, 0, 2, 1, 2, 3),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1522), 'B', 4, 1, 0, 1, 2, 4, 6),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 19), 'C', 1, 9, 3, 0, 0, 8, 4),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 28), 'C', 2, 4, 1, 1, 1, 6, 5),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1489), 'C', 3, 2, 0, 2, 1, 3, 4),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1519), 'C', 4, 1, 0, 1, 2, 3, 7),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 13), 'D', 1, 7, 2, 1, 0, 7, 1),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1508), 'D', 2, 7, 2, 1, 0, 5, 1),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1516), 'D', 3, 3, 1, 0, 2, 1, 4),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1520), 'D', 4, 0, 0, 0, 3, 0, 7),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1532), 'E', 1, 9, 3, 0, 0, 7, 1),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1502), 'E', 2, 6, 2, 0, 1, 4, 2),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1510), 'E', 3, 3, 1, 0, 2, 1, 5),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1521), 'E', 4, 0, 0, 0, 3, 2, 6),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1501), 'F', 1, 7, 2, 1, 0, 5, 3),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1530), 'F', 2, 7, 2, 1, 0, 4, 2),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1512), 'F', 3, 3, 1, 0, 2, 4, 5),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1503), 'F', 4, 0, 0, 0, 3, 4, 7)
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
