BEGIN TRANSACTION;

INSERT INTO teams (
    external_api_id,
    name,
    short_name,
    type,
    logo_url,
    country
)
VALUES
(1, 'Belgium', 'BEL', 'national', 'https://media.api-sports.io/football/teams/1.png', 'Belgium'),
(2, 'France', 'FRA', 'national', 'https://media.api-sports.io/football/teams/2.png', 'France'),
(3, 'Croatia', 'CRO', 'national', 'https://media.api-sports.io/football/teams/3.png', 'Croatia'),
(6, 'Brazil', 'BRA', 'national', 'https://media.api-sports.io/football/teams/6.png', 'Brazil'),
(7, 'Uruguay', 'URU', 'national', 'https://media.api-sports.io/football/teams/7.png', 'Uruguay'),
(9, 'Spain', 'SPA', 'national', 'https://media.api-sports.io/football/teams/9.png', 'Spain'),
(10, 'England', 'ENG', 'national', 'https://media.api-sports.io/football/teams/10.png', 'England'),
(12, 'Japan', 'JAP', 'national', 'https://media.api-sports.io/football/teams/12.png', 'Japan'),
(13, 'Senegal', 'SEN', 'national', 'https://media.api-sports.io/football/teams/13.png', 'Senegal'),
(14, 'Serbia', 'SER', 'national', 'https://media.api-sports.io/football/teams/14.png', 'Serbia'),
(15, 'Switzerland', 'SWI', 'national', 'https://media.api-sports.io/football/teams/15.png', 'Switzerland'),
(16, 'Mexico', 'MEX', 'national', 'https://media.api-sports.io/football/teams/16.png', 'Mexico'),
(17, 'South Korea', 'KOR', 'national', 'https://media.api-sports.io/football/teams/17.png', 'South-Korea'),
(20, 'Australia', 'AUS', 'national', 'https://media.api-sports.io/football/teams/20.png', 'Australia'),
(21, 'Denmark', 'DEN', 'national', 'https://media.api-sports.io/football/teams/21.png', 'Denmark'),
(22, 'Iran', 'IRA', 'national', 'https://media.api-sports.io/football/teams/22.png', 'Iran'),
(23, 'Saudi Arabia', 'SAU', 'national', 'https://media.api-sports.io/football/teams/23.png', 'Saudi-Arabia'),
(24, 'Poland', 'POL', 'national', 'https://media.api-sports.io/football/teams/24.png', 'Poland'),
(25, 'Germany', 'GER', 'national', 'https://media.api-sports.io/football/teams/25.png', 'Germany'),
(26, 'Argentina', 'ARG', 'national', 'https://media.api-sports.io/football/teams/26.png', 'Argentina'),
(27, 'Portugal', 'POR', 'national', 'https://media.api-sports.io/football/teams/27.png', 'Portugal'),
(28, 'Tunisia', 'TUN', 'national', 'https://media.api-sports.io/football/teams/28.png', 'Tunisia'),
(29, 'Costa Rica', 'COS', 'national', 'https://media.api-sports.io/football/teams/29.png', 'Costa-Rica'),
(31, 'Morocco', 'MOR', 'national', 'https://media.api-sports.io/football/teams/31.png', 'Morocco'),
(767, 'Wales', 'WAL', 'national', 'https://media.api-sports.io/football/teams/767.png', 'Wales'),
(1118, 'Netherlands', 'NET', 'national', 'https://media.api-sports.io/football/teams/1118.png', 'Netherlands'),
(1504, 'Ghana', 'GHA', 'national', 'https://media.api-sports.io/football/teams/1504.png', 'Ghana'),
(1530, 'Cameroon', 'CAM', 'national', 'https://media.api-sports.io/football/teams/1530.png', 'Cameroon'),
(1569, 'Qatar', 'QAT', 'national', 'https://media.api-sports.io/football/teams/1569.png', 'Qatar'),
(2382, 'Ecuador', 'ECU', 'national', 'https://media.api-sports.io/football/teams/2382.png', 'Ecuador'),
(2384, 'USA', 'USA', 'national', 'https://media.api-sports.io/football/teams/2384.png', 'USA'),
(5529, 'Canada', 'CAN', 'national', 'https://media.api-sports.io/football/teams/5529.png', 'Canada')
ON CONFLICT (external_api_id)
DO UPDATE SET
    name = EXCLUDED.name,
    short_name = EXCLUDED.short_name,
    type = EXCLUDED.type,
    logo_url = EXCLUDED.logo_url,
    country = EXCLUDED.country;

INSERT INTO tournament_teams (
    tournament_id,
    team_id,
    "group"
)
VALUES
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 1
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 2
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 3
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 6
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 7
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 9
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 10
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 12
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 13
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 14
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 15
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 16
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 17
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 20
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 21
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 22
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 23
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 24
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 25
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 26
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 27
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 28
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 29
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 31
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 767
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 1118
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 1504
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 1530
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 1569
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 2382
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 2384
),
NULL
),
(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = 1
      AND season = '2022'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = 5529
),
NULL
)
ON CONFLICT (tournament_id, team_id)
DO NOTHING;

COMMIT TRANSACTION;
