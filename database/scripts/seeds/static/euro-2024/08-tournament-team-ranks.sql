BEGIN TRANSACTION;

UPDATE tournament_teams
SET
    final_rank = 1,
    stage_reached = 'final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 9);

UPDATE tournament_teams
SET
    final_rank = 2,
    stage_reached = 'final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 10);

UPDATE tournament_teams
SET
    final_rank = 3,
    stage_reached = 'semi_final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 2);

UPDATE tournament_teams
SET
    final_rank = 4,
    stage_reached = 'semi_final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1118);

UPDATE tournament_teams
SET
    final_rank = 5,
    stage_reached = 'quarter_final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 25);

UPDATE tournament_teams
SET
    final_rank = 6,
    stage_reached = 'quarter_final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 27);

UPDATE tournament_teams
SET
    final_rank = 7,
    stage_reached = 'quarter_final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 777);

UPDATE tournament_teams
SET
    final_rank = 8,
    stage_reached = 'quarter_final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 15);

UPDATE tournament_teams
SET
    final_rank = 9,
    stage_reached = 'round_of_16'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 775);

UPDATE tournament_teams
SET
    final_rank = 10,
    stage_reached = 'round_of_16'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 774);

UPDATE tournament_teams
SET
    final_rank = 11,
    stage_reached = 'round_of_16'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1);

UPDATE tournament_teams
SET
    final_rank = 12,
    stage_reached = 'round_of_16'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1104);

UPDATE tournament_teams
SET
    final_rank = 13,
    stage_reached = 'round_of_16'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 768);

UPDATE tournament_teams
SET
    final_rank = 14,
    stage_reached = 'round_of_16'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 773);

UPDATE tournament_teams
SET
    final_rank = 15,
    stage_reached = 'round_of_16'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 21);

UPDATE tournament_teams
SET
    final_rank = 16,
    stage_reached = 'round_of_16'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1091);

UPDATE tournament_teams
SET
    final_rank = 17,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 772);

UPDATE tournament_teams
SET
    final_rank = 18,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 769);

UPDATE tournament_teams
SET
    final_rank = 19,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 14);

UPDATE tournament_teams
SET
    final_rank = 20,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 3);

UPDATE tournament_teams
SET
    final_rank = 21,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 778);

UPDATE tournament_teams
SET
    final_rank = 22,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 770);

UPDATE tournament_teams
SET
    final_rank = 23,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 24);

UPDATE tournament_teams
SET
    final_rank = 24,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 4 AND season = '2024')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1108);

COMMIT TRANSACTION;
