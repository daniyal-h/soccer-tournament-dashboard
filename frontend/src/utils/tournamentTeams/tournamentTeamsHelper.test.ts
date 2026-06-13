import { describe, expect, it } from 'vitest';

import type { MatchStage } from '@/types/match';
import type { TournamentTeam } from '@/types/tournamentTeam';

import { STAGE_FILTER_ORDER } from '@/constants/tournamentTeams';

import { getTournamentGroups, getTournamentStages } from './tournamentTeamsHelper';

function createTournamentTeam(
  group: string | null,
  stage_reached: MatchStage | null,
): TournamentTeam {
  return {
    team: {
      id: Math.random(),
      name: 'Test Team',
      short_name: 'TST',
      logo_url: null,
    },
    group,
    final_rank: null,
    stage_reached,
  };
}

describe('tournamentTeamsHelper', () => {
  describe('getTournamentGroups', () => {
    it('returns unique sorted non-null groups', () => {
      const teams = [
        createTournamentTeam('B', null),
        createTournamentTeam('A', null),
        createTournamentTeam('B', null),
        createTournamentTeam(null, null),
        createTournamentTeam('C', null),
      ];

      expect(getTournamentGroups(teams)).toEqual(['A', 'B', 'C']);
    });

    it('returns an empty array when no groups exist', () => {
      expect(
        getTournamentGroups([createTournamentTeam(null, null), createTournamentTeam(null, null)]),
      ).toEqual([]);
    });

    it('returns an empty array for an empty teams list', () => {
      expect(getTournamentGroups([])).toEqual([]);
    });
  });

  describe('getTournamentStages', () => {
    it('returns unique stages in filter order', () => {
      const teams = [
        createTournamentTeam('A', 'quarter_final'),
        createTournamentTeam('B', 'final'),
        createTournamentTeam('C', 'quarter_final'),
        createTournamentTeam('D', null),
        createTournamentTeam('E', 'semi_final'),
      ];

      expect(getTournamentStages(teams)).toEqual(['final', 'semi_final', 'quarter_final']);
    });

    it('uses STAGE_FILTER_ORDER instead of alphabetical order', () => {
      const teams = STAGE_FILTER_ORDER.map((stage) => createTournamentTeam('A', stage)).reverse();

      expect(getTournamentStages(teams)).toEqual(STAGE_FILTER_ORDER);
    });

    it('returns an empty array when no stages exist', () => {
      expect(
        getTournamentStages([createTournamentTeam('A', null), createTournamentTeam('B', null)]),
      ).toEqual([]);
    });

    it('returns an empty array for an empty teams list', () => {
      expect(getTournamentStages([])).toEqual([]);
    });
  });
});
