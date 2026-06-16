import type { Match, MatchStage } from '@/types/match';
import type { MatchFormResult, TeamMatchStageGroup } from '@/types/team';

import { MATCH_STAGE_LABELS } from '@/constants/matches';

import { getWinnerSide } from '../matches/matchCardHelper';

/**
 * Group the given matches by stages.
 * Include the label associated with the each staged matches.
 */
export function groupMatchesByStage(matches: Match[]): TeamMatchStageGroup[] {
  const groups = new Map<MatchStage, Match[]>();

  // build the map with keys as stages
  for (const match of matches) {
    const matchStage = match.stage;
    const stageMatches = groups.get(matchStage) ?? [];

    stageMatches.push(match);
    groups.set(matchStage, stageMatches);
  }

  // return in the image of the necessary interface
  return Array.from(groups.entries()).map(([stage, stageMatches]) => ({
    stage,
    label: MATCH_STAGE_LABELS[stage],
    matches: stageMatches,
  }));
}

/**
 * Returns the result of a match relative to a given team ID.
 * The result is of type 'W', 'L', or 'D'.
 */
function getTeamMatchResult(match: Match, teamId: number): MatchFormResult | null {
  if (match.status !== 'finished') {
    return null;
  }

  const isTeamA = match.team_a.id === teamId;
  const isTeamB = match.team_b.id === teamId;

  if (!isTeamA && !isTeamB) {
    return null;
  }

  const winner = getWinnerSide(match);

  if (winner === null) {
    return 'D';
  }

  if ((winner === 'team_a' && isTeamA) || (winner === 'team_b' && isTeamB)) {
    return 'W';
  }

  return 'L';
}

export function getRecentForm(matches: Match[], teamId: number): MatchFormResult[] {
  return matches
    .map((match) => getTeamMatchResult(match, teamId))
    .filter((result): result is MatchFormResult => result !== null)
    .slice(-5);
}
