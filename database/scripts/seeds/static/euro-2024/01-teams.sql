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
(9, 'Spain', 'SPA', 'national', 'https://media.api-sports.io/football/teams/9.png', 'Spain'),
(10, 'England', 'ENG', 'national', 'https://media.api-sports.io/football/teams/10.png', 'England'),
(14, 'Serbia', 'SER', 'national', 'https://media.api-sports.io/football/teams/14.png', 'Serbia'),
(15, 'Switzerland', 'SWI', 'national', 'https://media.api-sports.io/football/teams/15.png', 'Switzerland'),
(21, 'Denmark', 'DEN', 'national', 'https://media.api-sports.io/football/teams/21.png', 'Denmark'),
(24, 'Poland', 'POL', 'national', 'https://media.api-sports.io/football/teams/24.png', 'Poland'),
(25, 'Germany', 'GER', 'national', 'https://media.api-sports.io/football/teams/25.png', 'Germany'),
(27, 'Portugal', 'POR', 'national', 'https://media.api-sports.io/football/teams/27.png', 'Portugal'),
(768, 'Italy', 'ITA', 'national', 'https://media.api-sports.io/football/teams/768.png', 'Italy'),
(769, 'Hungary', 'HUN', 'national', 'https://media.api-sports.io/football/teams/769.png', 'Hungary'),
(770, 'Czech Republic', 'CZE', 'national', 'https://media.api-sports.io/football/teams/770.png', 'Czech-Republic'),
(772, 'Ukraine', 'UKR', 'national', 'https://media.api-sports.io/football/teams/772.png', 'Ukraine'),
(773, 'Slovakia', 'SLO', 'national', 'https://media.api-sports.io/football/teams/773.png', 'Slovakia'),
(774, 'Romania', 'ROM', 'national', 'https://media.api-sports.io/football/teams/774.png', 'Romania'),
(775, 'Austria', 'AUS', 'national', 'https://media.api-sports.io/football/teams/775.png', 'Austria'),
(777, 'Türkiye', 'TUR', 'national', 'https://media.api-sports.io/football/teams/777.png', 'Turkey'),
(778, 'Albania', 'ALB', 'national', 'https://media.api-sports.io/football/teams/778.png', 'Albania'),
(1091, 'Slovenia', 'SLO', 'national', 'https://media.api-sports.io/football/teams/1091.png', 'Slovenia'),
(1104, 'Georgia', 'GEO', 'national', 'https://media.api-sports.io/football/teams/1104.png', 'Georgia'),
(1108, 'Scotland', 'SCO', 'national', 'https://media.api-sports.io/football/teams/1108.png', 'Scotland'),
(1118, 'Netherlands', 'NET', 'national', 'https://media.api-sports.io/football/teams/1118.png', 'Netherlands')
ON CONFLICT (external_api_id)
DO NOTHING;

COMMIT TRANSACTION;
