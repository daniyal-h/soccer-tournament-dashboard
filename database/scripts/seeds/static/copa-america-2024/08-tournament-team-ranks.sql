BEGIN TRANSACTION;

UPDATE tournament_teams
SET
    final_rank = 1,
    stage_reached = 'final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 26);

UPDATE tournament_teams
SET
    final_rank = 2,
    stage_reached = 'final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 8);

UPDATE tournament_teams
SET
    final_rank = 3,
    stage_reached = 'third_place'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 7);

UPDATE tournament_teams
SET
    final_rank = 4,
    stage_reached = 'third_place'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 5529);

UPDATE tournament_teams
SET
    final_rank = 5,
    stage_reached = 'quarter_final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 2379);

UPDATE tournament_teams
SET
    final_rank = 6,
    stage_reached = 'quarter_final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 11);

UPDATE tournament_teams
SET
    final_rank = 7,
    stage_reached = 'quarter_final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 6);

UPDATE tournament_teams
SET
    final_rank = 8,
    stage_reached = 'quarter_final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 2382);

UPDATE tournament_teams
SET
    final_rank = 9,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 16);

UPDATE tournament_teams
SET
    final_rank = 10,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 29);

UPDATE tournament_teams
SET
    final_rank = 11,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 2384);

UPDATE tournament_teams
SET
    final_rank = 12,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 2383);

UPDATE tournament_teams
SET
    final_rank = 13,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 30);

UPDATE tournament_teams
SET
    final_rank = 14,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 2380);

UPDATE tournament_teams
SET
    final_rank = 15,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 2385);

UPDATE tournament_teams
SET
    final_rank = 16,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 9 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 2381);

COMMIT TRANSACTION;
