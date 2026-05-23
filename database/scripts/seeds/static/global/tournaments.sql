BEGIN TRANSACTION;

INSERT INTO tournaments (external_api_id, name, season, logo_url, start_date, end_date)
VALUES
  -- FIFA World Cup
  (1, 'FIFA World Cup', '2026', 'https://media.api-sports.io/football/leagues/1.png', '2026-06-11', '2026-07-19'),
  (1, 'FIFA World Cup', '2022', 'https://media.api-sports.io/football/leagues/1.png', '2022-11-20', '2022-12-18'),

  -- UEFA Euro
  (4, 'UEFA Euro', '2024', 'https://media.api-sports.io/football/leagues/4.png', '2024-06-14', '2024-07-14'),

  -- Copa América
  (9, 'Copa América', '2024', 'https://media.api-sports.io/football/leagues/9.png', '2024-06-21', '2024-07-15'),

  -- Africa Cup of Nations
  (6, 'Africa Cup of Nations', '2025', 'https://media.api-sports.io/football/leagues/6.png', '2025-12-21', '2026-01-18'),

  -- FIFA Club World Cup
  (15, 'FIFA Club World Cup', '2025', 'https://media.api-sports.io/football/leagues/15.png', '2025-06-15', '2025-07-13');

COMMIT TRANSACTION;