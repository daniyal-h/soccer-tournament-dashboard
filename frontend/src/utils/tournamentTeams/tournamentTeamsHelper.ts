import type { MatchStage } from '@/types/match';
import type { TournamentTeam } from '@/types/tournamentTeam';

import { STAGE_FILTER_ORDER } from '@/constants/tournamentTeams';
export function getTournamentGroups(teams: TournamentTeam[]): string[] {
  return [
    ...new Set(teams.map((team) => team.group).filter((group): group is string => group !== null)),
  ].sort((a, b) => a.localeCompare(b));
}

export function getTournamentStages(teams: TournamentTeam[]): MatchStage[] {
  const availableStages = new Set(
    teams.map((team) => team.stage_reached).filter((stage): stage is MatchStage => stage !== null),
  );

  return STAGE_FILTER_ORDER.filter((stage) => availableStages.has(stage));
}
