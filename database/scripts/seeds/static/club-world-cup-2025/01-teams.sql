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
(49, 'Chelsea', 'CHE', 'national', 'https://media.api-sports.io/football/teams/49.png', 'England'),
(50, 'Manchester City', 'MCI', 'national', 'https://media.api-sports.io/football/teams/50.png', 'England'),
(85, 'Paris Saint Germain', 'PSG', 'national', 'https://media.api-sports.io/football/teams/85.png', 'France'),
(120, 'Botafogo', 'BOT', 'national', 'https://media.api-sports.io/football/teams/120.png', 'Brazil'),
(121, 'Palmeiras', 'PAL', 'national', 'https://media.api-sports.io/football/teams/121.png', 'Brazil'),
(124, 'Fluminense', 'FLU', 'national', 'https://media.api-sports.io/football/teams/124.png', 'Brazil'),
(127, 'Flamengo', 'FLA', 'national', 'https://media.api-sports.io/football/teams/127.png', 'Brazil'),
(157, 'Bayern München', 'BAY', 'national', 'https://media.api-sports.io/football/teams/157.png', 'Germany'),
(165, 'Borussia Dortmund', 'DOR', 'national', 'https://media.api-sports.io/football/teams/165.png', 'Germany'),
(211, 'Benfica', 'BEN', 'national', 'https://media.api-sports.io/football/teams/211.png', 'Portugal'),
(212, 'FC Porto', 'POR', 'national', 'https://media.api-sports.io/football/teams/212.png', 'Portugal'),
(287, 'Urawa', 'URA', 'national', 'https://media.api-sports.io/football/teams/287.png', 'Japan'),
(435, 'River Plate', 'RIV', 'national', 'https://media.api-sports.io/football/teams/435.png', 'Argentina'),
(451, 'Boca Juniors', 'BOC', 'national', 'https://media.api-sports.io/football/teams/451.png', 'Argentina'),
(496, 'Juventus', 'JUV', 'national', 'https://media.api-sports.io/football/teams/496.png', 'Italy'),
(505, 'Inter', 'INT', 'national', 'https://media.api-sports.io/football/teams/505.png', 'Italy'),
(530, 'Atletico Madrid', 'ATM', 'national', 'https://media.api-sports.io/football/teams/530.png', 'Spain'),
(541, 'Real Madrid', 'REA', 'national', 'https://media.api-sports.io/football/teams/541.png', 'Spain'),
(571, 'Red Bull Salzburg', 'SAL', 'national', 'https://media.api-sports.io/football/teams/571.png', 'Austria'),
(968, 'Wydad AC', 'WYD', 'national', 'https://media.api-sports.io/football/teams/968.png', 'Morocco'),
(980, 'ES Tunis', 'EST', 'national', 'https://media.api-sports.io/football/teams/980.png', 'Tunisia'),
(1577, 'Al Ahly', 'AHL', 'national', 'https://media.api-sports.io/football/teams/1577.png', 'Egypt'),
(1595, 'Seattle Sounders', 'SEA', 'national', 'https://media.api-sports.io/football/teams/1595.png', 'USA'),
(1616, 'Los Angeles FC', 'LAFC', 'national', 'https://media.api-sports.io/football/teams/1616.png', 'USA'),
(2282, 'Monterrey', 'MON', 'national', 'https://media.api-sports.io/football/teams/2282.png', 'Mexico'),
(2292, 'CF Pachuca', 'PAC', 'national', 'https://media.api-sports.io/football/teams/2292.png', 'Mexico'),
(2537, 'Auckland City', 'AUC', 'national', 'https://media.api-sports.io/football/teams/2537.png', 'New-Zealand'),
(2699, 'Mamelodi Sundowns', 'MAM', 'national', 'https://media.api-sports.io/football/teams/2699.png', 'South-Africa'),
(2767, 'Ulsan Hyundai FC', 'ULS', 'national', 'https://media.api-sports.io/football/teams/2767.png', 'South-Korea'),
(2865, 'Al Ain', 'AIN', 'national', 'https://media.api-sports.io/football/teams/2865.png', 'United-Arab-Emirates'),
(2932, 'Al-Hilal Saudi FC', 'HIL', 'national', 'https://media.api-sports.io/football/teams/2932.png', 'Saudi-Arabia'),
(9568, 'Inter Miami', 'MIA', 'national', 'https://media.api-sports.io/football/teams/9568.png', 'USA')
ON CONFLICT (external_api_id)
DO NOTHING;

COMMIT TRANSACTION;
