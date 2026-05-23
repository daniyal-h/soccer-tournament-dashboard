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

COMMIT TRANSACTION;
