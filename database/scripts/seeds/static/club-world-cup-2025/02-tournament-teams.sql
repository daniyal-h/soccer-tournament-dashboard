BEGIN TRANSACTION;

INSERT INTO tournament_teams (
    tournament_id,
    team_id,
    "group"
)
VALUES
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 121), 'A'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 9568), 'A'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 212), 'A'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1577), 'A'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 85), 'B'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 120), 'B'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 530), 'B'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1595), 'B'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 211), 'C'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 157), 'C'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 451), 'C'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 2537), 'C'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 127), 'D'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 49), 'D'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 980), 'D'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1616), 'D'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 505), 'E'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 2282), 'E'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 435), 'E'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 287), 'E'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 165), 'F'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 124), 'F'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 2699), 'F'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 2767), 'F'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 50), 'G'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 496), 'G'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 2865), 'G'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 968), 'G'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 541), 'H'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 2932), 'H'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 571), 'H'),
((SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 2292), 'H')
ON CONFLICT (tournament_id, team_id)
DO UPDATE SET
    "group" = EXCLUDED."group";

COMMIT TRANSACTION;
