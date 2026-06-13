BEGIN TRANSACTION;

UPDATE tournament_teams
SET
    final_rank = 1,
    stage_reached = 'final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 26);

UPDATE tournament_teams
SET
    final_rank = 2,
    stage_reached = 'final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 2);

UPDATE tournament_teams
SET
    final_rank = 3,
    stage_reached = 'third_place'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 3);

UPDATE tournament_teams
SET
    final_rank = 4,
    stage_reached = 'third_place'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 31);

UPDATE tournament_teams
SET
    final_rank = 5,
    stage_reached = 'quarter_final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 10);

UPDATE tournament_teams
SET
    final_rank = 6,
    stage_reached = 'quarter_final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1118);

UPDATE tournament_teams
SET
    final_rank = 7,
    stage_reached = 'quarter_final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 27);

UPDATE tournament_teams
SET
    final_rank = 8,
    stage_reached = 'quarter_final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 6);

UPDATE tournament_teams
SET
    final_rank = 9,
    stage_reached = 'round_of_16'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 13);

UPDATE tournament_teams
SET
    final_rank = 10,
    stage_reached = 'round_of_16'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 12);

UPDATE tournament_teams
SET
    final_rank = 11,
    stage_reached = 'round_of_16'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 15);

UPDATE tournament_teams
SET
    final_rank = 12,
    stage_reached = 'round_of_16'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 20);

UPDATE tournament_teams
SET
    final_rank = 13,
    stage_reached = 'round_of_16'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 2384);

UPDATE tournament_teams
SET
    final_rank = 14,
    stage_reached = 'round_of_16'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 9);

UPDATE tournament_teams
SET
    final_rank = 15,
    stage_reached = 'round_of_16'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 17);

UPDATE tournament_teams
SET
    final_rank = 16,
    stage_reached = 'round_of_16'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 24);

UPDATE tournament_teams
SET
    final_rank = 17,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 25);

UPDATE tournament_teams
SET
    final_rank = 18,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 2382);

UPDATE tournament_teams
SET
    final_rank = 19,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1530);

UPDATE tournament_teams
SET
    final_rank = 20,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 7);

UPDATE tournament_teams
SET
    final_rank = 21,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 28);

UPDATE tournament_teams
SET
    final_rank = 22,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 16);

UPDATE tournament_teams
SET
    final_rank = 23,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1);

UPDATE tournament_teams
SET
    final_rank = 24,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1504);

UPDATE tournament_teams
SET
    final_rank = 25,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 23);

UPDATE tournament_teams
SET
    final_rank = 26,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 22);

UPDATE tournament_teams
SET
    final_rank = 27,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 29);

UPDATE tournament_teams
SET
    final_rank = 28,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 21);

UPDATE tournament_teams
SET
    final_rank = 29,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 14);

UPDATE tournament_teams
SET
    final_rank = 30,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 767);

UPDATE tournament_teams
SET
    final_rank = 31,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 5529);

UPDATE tournament_teams
SET
    final_rank = 32,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 1 AND season = '2022')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1569);

COMMIT TRANSACTION;
