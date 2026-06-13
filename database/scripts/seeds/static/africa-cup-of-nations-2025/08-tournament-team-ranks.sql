BEGIN TRANSACTION;

UPDATE tournament_teams
SET
    final_rank = 1,
    stage_reached = 'final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 31);

UPDATE tournament_teams
SET
    final_rank = 2,
    stage_reached = 'final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 13);

UPDATE tournament_teams
SET
    final_rank = 3,
    stage_reached = 'third_place'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 19);

UPDATE tournament_teams
SET
    final_rank = 4,
    stage_reached = 'third_place'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 32);

UPDATE tournament_teams
SET
    final_rank = 5,
    stage_reached = 'quarter_final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1532);

UPDATE tournament_teams
SET
    final_rank = 6,
    stage_reached = 'quarter_final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1501);

UPDATE tournament_teams
SET
    final_rank = 7,
    stage_reached = 'quarter_final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1530);

UPDATE tournament_teams
SET
    final_rank = 8,
    stage_reached = 'quarter_final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1500);

UPDATE tournament_teams
SET
    final_rank = 9,
    stage_reached = 'round_of_16'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1508);

UPDATE tournament_teams
SET
    final_rank = 10,
    stage_reached = 'round_of_16'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1502);

UPDATE tournament_teams
SET
    final_rank = 11,
    stage_reached = 'round_of_16'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1531);

UPDATE tournament_teams
SET
    final_rank = 12,
    stage_reached = 'round_of_16'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 28);

UPDATE tournament_teams
SET
    final_rank = 13,
    stage_reached = 'round_of_16'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1512);

UPDATE tournament_teams
SET
    final_rank = 14,
    stage_reached = 'round_of_16'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1516);

UPDATE tournament_teams
SET
    final_rank = 15,
    stage_reached = 'round_of_16'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1510);

UPDATE tournament_teams
SET
    final_rank = 16,
    stage_reached = 'round_of_16'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1489);

UPDATE tournament_teams
SET
    final_rank = 17,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1529);

UPDATE tournament_teams
SET
    final_rank = 18,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1524);

UPDATE tournament_teams
SET
    final_rank = 19,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1507);

UPDATE tournament_teams
SET
    final_rank = 20,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1522);

UPDATE tournament_teams
SET
    final_rank = 21,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1519);

UPDATE tournament_teams
SET
    final_rank = 22,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1503);

UPDATE tournament_teams
SET
    final_rank = 23,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1521);

UPDATE tournament_teams
SET
    final_rank = 24,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 6 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1520);

COMMIT TRANSACTION;
