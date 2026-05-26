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
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 121), 'A', 1, 5, 1, 2, 0, 4, 2),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 9568), 'A', 2, 5, 1, 2, 0, 4, 3),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 212), 'A', 3, 2, 0, 2, 1, 5, 6),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1577), 'A', 4, 2, 0, 2, 1, 4, 6),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 85), 'B', 1, 6, 2, 0, 1, 6, 1),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 120), 'B', 2, 6, 2, 0, 1, 3, 2),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 530), 'B', 3, 6, 2, 0, 1, 4, 5),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1595), 'B', 4, 0, 0, 0, 3, 2, 7),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 211), 'C', 1, 7, 2, 1, 0, 9, 2),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 157), 'C', 2, 6, 2, 0, 1, 12, 2),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 451), 'C', 3, 2, 0, 2, 1, 4, 5),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 2537), 'C', 4, 1, 0, 1, 2, 1, 17),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 127), 'D', 1, 7, 2, 1, 0, 6, 2),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 49), 'D', 2, 6, 2, 0, 1, 6, 3),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 980), 'D', 3, 3, 1, 0, 2, 1, 5),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1616), 'D', 4, 1, 0, 1, 2, 1, 4),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 505), 'E', 1, 7, 2, 1, 0, 5, 2),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 2282), 'E', 2, 5, 1, 2, 0, 5, 1),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 435), 'E', 3, 4, 1, 1, 1, 3, 3),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 287), 'E', 4, 0, 0, 0, 3, 2, 9),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 165), 'F', 1, 7, 2, 1, 0, 5, 3),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 124), 'F', 2, 5, 1, 2, 0, 4, 2),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 2699), 'F', 3, 4, 1, 1, 1, 4, 4),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 2767), 'F', 4, 0, 0, 0, 3, 2, 6),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 50), 'G', 1, 9, 3, 0, 0, 13, 2),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 496), 'G', 2, 6, 2, 0, 1, 11, 6),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 2865), 'G', 3, 3, 1, 0, 2, 2, 12),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 968), 'G', 4, 0, 0, 0, 3, 2, 8),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 541), 'H', 1, 7, 2, 1, 0, 7, 2),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 2932), 'H', 2, 5, 1, 2, 0, 3, 1),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 571), 'H', 3, 4, 1, 1, 1, 2, 4),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 2292), 'H', 4, 0, 0, 0, 3, 2, 7)
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
