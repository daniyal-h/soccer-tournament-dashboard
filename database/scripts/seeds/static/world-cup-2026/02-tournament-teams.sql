BEGIN TRANSACTION;

INSERT INTO tournament_teams (
    tournament_id,
    team_id,
    "group"
)
VALUES
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 16), 'A'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 1531), 'A'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 17), 'A'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 770), 'A'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 5529), 'B'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 1113), 'B'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 1569), 'B'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 15), 'B'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 6), 'C'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 31), 'C'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 2386), 'C'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 1108), 'C'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 2384), 'D'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 2380), 'D'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 20), 'D'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 777), 'D'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 25), 'E'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 5530), 'E'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 1501), 'E'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 2382), 'E'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 1118), 'F'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 12), 'F'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 5), 'F'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 28), 'F'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 1), 'G'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 32), 'G'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 22), 'G'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 4673), 'G'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 9), 'H'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 1533), 'H'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 23), 'H'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 7), 'H'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 2), 'I'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 13), 'I'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 1567), 'I'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 1090), 'I'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 26), 'J'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 1532), 'J'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 775), 'J'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 1548), 'J'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 27), 'K'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 1508), 'K'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 1568), 'K'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 8), 'K'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 10), 'L'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 3), 'L'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 1504), 'L'),
((SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2026'), (SELECT id FROM teams WHERE external_api_id = 11), 'L')
ON CONFLICT (tournament_id, team_id)
DO UPDATE SET
    "group" = EXCLUDED."group";

COMMIT TRANSACTION;
