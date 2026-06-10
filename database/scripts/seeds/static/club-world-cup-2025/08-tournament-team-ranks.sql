BEGIN TRANSACTION;

UPDATE tournament_teams
SET
    final_rank = 1,
    stage_reached = 'final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 49);

UPDATE tournament_teams
SET
    final_rank = 2,
    stage_reached = 'final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 85);

UPDATE tournament_teams
SET
    final_rank = 3,
    stage_reached = 'semi_final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 541);

UPDATE tournament_teams
SET
    final_rank = 4,
    stage_reached = 'semi_final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 124);

UPDATE tournament_teams
SET
    final_rank = 5,
    stage_reached = 'quarter_final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 165);

UPDATE tournament_teams
SET
    final_rank = 6,
    stage_reached = 'quarter_final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 157);

UPDATE tournament_teams
SET
    final_rank = 7,
    stage_reached = 'quarter_final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 121);

UPDATE tournament_teams
SET
    final_rank = 8,
    stage_reached = 'quarter_final'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 2932);

UPDATE tournament_teams
SET
    final_rank = 9,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 50);

UPDATE tournament_teams
SET
    final_rank = 10,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 211);

UPDATE tournament_teams
SET
    final_rank = 11,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 127);

UPDATE tournament_teams
SET
    final_rank = 12,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 505);

UPDATE tournament_teams
SET
    final_rank = 13,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 496);

UPDATE tournament_teams
SET
    final_rank = 14,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 120);

UPDATE tournament_teams
SET
    final_rank = 15,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 530);

UPDATE tournament_teams
SET
    final_rank = 16,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 2282);

UPDATE tournament_teams
SET
    final_rank = 17,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 9568);

UPDATE tournament_teams
SET
    final_rank = 18,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 2699);

UPDATE tournament_teams
SET
    final_rank = 19,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 435);

UPDATE tournament_teams
SET
    final_rank = 20,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 571);

UPDATE tournament_teams
SET
    final_rank = 21,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 980);

UPDATE tournament_teams
SET
    final_rank = 22,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 2865);

UPDATE tournament_teams
SET
    final_rank = 23,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 212);

UPDATE tournament_teams
SET
    final_rank = 24,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 451);

UPDATE tournament_teams
SET
    final_rank = 25,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1577);

UPDATE tournament_teams
SET
    final_rank = 26,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1616);

UPDATE tournament_teams
SET
    final_rank = 27,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 2537);

UPDATE tournament_teams
SET
    final_rank = 28,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 2767);

UPDATE tournament_teams
SET
    final_rank = 29,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 2292);

UPDATE tournament_teams
SET
    final_rank = 30,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 1595);

UPDATE tournament_teams
SET
    final_rank = 31,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 968);

UPDATE tournament_teams
SET
    final_rank = 32,
    stage_reached = 'group'
WHERE tournament_id = (SELECT id FROM tournaments WHERE external_api_id = 15 AND season = '2025')
AND team_id = (SELECT id FROM teams WHERE external_api_id = 287);

COMMIT TRANSACTION;
