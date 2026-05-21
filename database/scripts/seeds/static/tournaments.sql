BEGIN TRANSACTION;

INSERT INTO tournaments (external_api_id, name, season, logo_url, start_date, end_date)
VALUES
  -- FIFA World Cup
  (1, 'FIFA World Cup', '2022', 'https://media.api-sports.io/football/leagues/1.png', '2022-11-20', '2022-12-18'),
  (1, 'FIFA World Cup', '2026', 'https://media.api-sports.io/football/leagues/1.png', '2026-06-11', '2026-07-19'),

  -- FIFA Women's World Cup
  (8, 'FIFA Women''s World Cup', '2023', 'https://media.api-sports.io/football/leagues/8.png', '2023-07-20', '2023-08-20'),

  -- UEFA Euro
  (4, 'UEFA Euro', '2024', 'https://media.api-sports.io/football/leagues/4.png', '2024-06-14', '2024-07-14'),

  -- Copa América
  (9, 'Copa América', '2024', 'https://media.api-sports.io/football/leagues/9.png', '2024-06-21', '2024-07-15'),

  -- UEFA Champions League
  (2, 'UEFA Champions League', '2024', 'https://media.api-sports.io/football/leagues/2.png', '2024-07-09', '2025-05-31'),
  (2, 'UEFA Champions League', '2025', 'https://media.api-sports.io/football/leagues/2.png', '2025-07-08', '2026-05-30'),

  -- Premier League
  (39, 'Premier League', '2024', 'https://media.api-sports.io/football/leagues/39.png', '2024-08-16', '2025-05-25'),
  (39, 'Premier League', '2025', 'https://media.api-sports.io/football/leagues/39.png', '2025-08-15', '2026-05-24'),

  -- La Liga
  (140, 'La Liga', '2024', 'https://media.api-sports.io/football/leagues/140.png', '2024-08-15', '2025-05-25'),
  (140, 'La Liga', '2025', 'https://media.api-sports.io/football/leagues/140.png', '2025-08-15', '2026-05-24'),

  -- Bundesliga
  (78, 'Bundesliga', '2024', 'https://media.api-sports.io/football/leagues/78.png', '2024-08-23', '2025-05-26'),
  (78, 'Bundesliga', '2025', 'https://media.api-sports.io/football/leagues/78.png', '2025-08-22', '2026-05-25'),

  -- Serie A
  (135, 'Serie A', '2024', 'https://media.api-sports.io/football/leagues/135.png', '2024-08-17', '2025-05-25'),
  (135, 'Serie A', '2025', 'https://media.api-sports.io/football/leagues/135.png', '2025-08-23', '2026-05-24'),

  -- Ligue 1
  (61, 'Ligue 1', '2024', 'https://media.api-sports.io/football/leagues/61.png', '2024-08-16', '2025-05-29'),
  (61, 'Ligue 1', '2025', 'https://media.api-sports.io/football/leagues/61.png', '2025-08-15', '2026-05-29'),

  -- Africa Cup of Nations
  (6, 'Africa Cup of Nations', '2025', 'https://media.api-sports.io/football/leagues/6.png', '2025-12-21', '2026-01-18');

COMMIT TRANSACTION;