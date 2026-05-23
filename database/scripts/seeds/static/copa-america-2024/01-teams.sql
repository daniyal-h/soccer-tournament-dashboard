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
(6, 'Brazil', 'BRA', 'national', 'https://media.api-sports.io/football/teams/6.png', 'Brazil'),
(7, 'Uruguay', 'URU', 'national', 'https://media.api-sports.io/football/teams/7.png', 'Uruguay'),
(8, 'Colombia', 'COL', 'national', 'https://media.api-sports.io/football/teams/8.png', 'Colombia'),
(11, 'Panama', 'PAN', 'national', 'https://media.api-sports.io/football/teams/11.png', 'Panama'),
(16, 'Mexico', 'MEX', 'national', 'https://media.api-sports.io/football/teams/16.png', 'Mexico'),
(26, 'Argentina', 'ARG', 'national', 'https://media.api-sports.io/football/teams/26.png', 'Argentina'),
(29, 'Costa Rica', 'COS', 'national', 'https://media.api-sports.io/football/teams/29.png', 'Costa-Rica'),
(30, 'Peru', 'PER', 'national', 'https://media.api-sports.io/football/teams/30.png', 'Peru'),
(2379, 'Venezuela', 'VEN', 'national', 'https://media.api-sports.io/football/teams/2379.png', 'Venezuela'),
(2380, 'Paraguay', 'PAR', 'national', 'https://media.api-sports.io/football/teams/2380.png', 'Paraguay'),
(2381, 'Bolivia', 'BOL', 'national', 'https://media.api-sports.io/football/teams/2381.png', 'Bolivia'),
(2382, 'Ecuador', 'ECU', 'national', 'https://media.api-sports.io/football/teams/2382.png', 'Ecuador'),
(2383, 'Chile', 'CHI', 'national', 'https://media.api-sports.io/football/teams/2383.png', 'Chile'),
(2384, 'USA', 'USA', 'national', 'https://media.api-sports.io/football/teams/2384.png', 'USA'),
(2385, 'Jamaica', 'JAM', 'national', 'https://media.api-sports.io/football/teams/2385.png', 'Jamaica'),
(5529, 'Canada', 'CAN', 'national', 'https://media.api-sports.io/football/teams/5529.png', 'Canada')
ON CONFLICT (external_api_id)
DO NOTHING;

COMMIT TRANSACTION;
