BEGIN TRANSACTION;

INSERT INTO tournament_teams (
    tournament_id,
    team_id,
    "group"
)
VALUES
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 26), 'A'),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 5529), 'A'),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 2383), 'A'),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 30), 'A'),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 2379), 'B'),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 2382), 'B'),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 16), 'B'),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 2385), 'B'),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 7), 'C'),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 11), 'C'),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 2384), 'C'),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 2381), 'C'),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 8), 'D'),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 6), 'D'),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 29), 'D'),
((SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 2380), 'D')
ON CONFLICT (tournament_id, team_id)
DO UPDATE SET
    "group" = EXCLUDED."group";

COMMIT TRANSACTION;
