BEGIN TRANSACTION;

INSERT INTO tournament_teams (
    tournament_id,
    team_id,
    "group"
)
VALUES
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 25), 'A'),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 15), 'A'),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 769), 'A'),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 1108), 'A'),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 9), 'B'),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 768), 'B'),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 3), 'B'),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 778), 'B'),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 10), 'C'),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 21), 'C'),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 1091), 'C'),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 14), 'C'),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 775), 'D'),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 2), 'D'),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 1118), 'D'),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 24), 'D'),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 774), 'E'),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 1), 'E'),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 773), 'E'),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 772), 'E'),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 27), 'F'),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 777), 'F'),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 1104), 'F'),
((SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024'), (SELECT id FROM teams WHERE external_api_id = 770), 'F')
ON CONFLICT (tournament_id, team_id)
DO UPDATE SET
    "group" = EXCLUDED."group";

COMMIT TRANSACTION;
