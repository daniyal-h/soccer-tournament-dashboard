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
(13, 'Senegal', 'SEN', 'national', 'https://media.api-sports.io/football/teams/13.png', 'Senegal'),
(19, 'Nigeria', 'NIG', 'national', 'https://media.api-sports.io/football/teams/19.png', 'Nigeria'),
(28, 'Tunisia', 'TUN', 'national', 'https://media.api-sports.io/football/teams/28.png', 'Tunisia'),
(31, 'Morocco', 'MOR', 'national', 'https://media.api-sports.io/football/teams/31.png', 'Morocco'),
(32, 'Egypt', 'EGY', 'national', 'https://media.api-sports.io/football/teams/32.png', 'Egypt'),
(1489, 'Tanzania', 'TAN', 'national', 'https://media.api-sports.io/football/teams/1489.png', 'Tanzania'),
(1500, 'Mali', 'MAL', 'national', 'https://media.api-sports.io/football/teams/1500.png', 'Mali'),
(1501, 'Ivory Coast', 'IVO', 'national', 'https://media.api-sports.io/football/teams/1501.png', 'Ivory-Coast'),
(1502, 'Burkina Faso', 'BUR', 'national', 'https://media.api-sports.io/football/teams/1502.png', 'Burkina-Faso'),
(1503, 'Gabon', 'GAB', 'national', 'https://media.api-sports.io/football/teams/1503.png', 'Gabon'),
(1507, 'Zambia', 'ZAM', 'national', 'https://media.api-sports.io/football/teams/1507.png', 'Zambia'),
(1508, 'Congo DR', 'CON', 'national', 'https://media.api-sports.io/football/teams/1508.png', 'Congo-DR'),
(1510, 'Sudan', 'SUD', 'national', 'https://media.api-sports.io/football/teams/1510.png', 'Sudan'),
(1512, 'Mozambique', 'MOZ', 'national', 'https://media.api-sports.io/football/teams/1512.png', 'Mozambique'),
(1516, 'Benin', 'BEN', 'national', 'https://media.api-sports.io/football/teams/1516.png', 'Benin'),
(1519, 'Uganda', 'UGA', 'national', 'https://media.api-sports.io/football/teams/1519.png', 'Uganda'),
(1520, 'Botswana', 'BOT', 'national', 'https://media.api-sports.io/football/teams/1520.png', 'Botswana'),
(1521, 'Equatorial Guinea', 'EQU', 'national', 'https://media.api-sports.io/football/teams/1521.png', 'Equatorial-Guinea'),
(1522, 'Zimbabwe', 'ZIM', 'national', 'https://media.api-sports.io/football/teams/1522.png', 'Zimbabwe'),
(1524, 'Comoros', 'COM', 'national', 'https://media.api-sports.io/football/teams/1524.png', 'Comoros'),
(1529, 'Angola', 'ANG', 'national', 'https://media.api-sports.io/football/teams/1529.png', 'Angola'),
(1530, 'Cameroon', 'CAM', 'national', 'https://media.api-sports.io/football/teams/1530.png', 'Cameroon'),
(1531, 'South Africa', 'SOU', 'national', 'https://media.api-sports.io/football/teams/1531.png', 'South-Africa'),
(1532, 'Algeria', 'ALG', 'national', 'https://media.api-sports.io/football/teams/1532.png', 'Algeria')
ON CONFLICT (external_api_id)
DO NOTHING;

COMMIT TRANSACTION;
