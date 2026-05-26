BEGIN TRANSACTION;

INSERT INTO tournament_teams (
    tournament_id,
    team_id,
    "group"
)
VALUES
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 31), 'A'),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1500), 'A'),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1524), 'A'),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1507), 'A'),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 32), 'B'),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1531), 'B'),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1529), 'B'),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1522), 'B'),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 19), 'C'),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 28), 'C'),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1489), 'C'),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1519), 'C'),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 13), 'D'),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1508), 'D'),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1516), 'D'),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1520), 'D'),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1532), 'E'),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1502), 'E'),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1510), 'E'),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1521), 'E'),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1501), 'F'),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1530), 'F'),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1512), 'F'),
((SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025'), (SELECT id FROM teams WHERE external_api_id = 1503), 'F')
ON CONFLICT (tournament_id, team_id)
DO UPDATE SET
    "group" = EXCLUDED."group";

COMMIT TRANSACTION;
