import { type Match } from '@/types/matches';

import { MATCH_STAGE_LABELS } from '@/constants/schedule';

export function getMatchCenterDisplay(match: Match): string {
  switch (match.status) {
    case 'scheduled':
      return match.kickoff_time;

    case 'live':
    case 'finished':
      return `${match.team_a_score} - ${match.team_b_score}`;

    case 'cancelled':
      return 'CANCELLED';

    case 'postponed':
      return 'POSTPONED';

    default: {
      const _exhaustiveCheck: never = match.status;
      return _exhaustiveCheck;
    }
  }
}

export function getMatchMetaDisplay(match: Match): string {
  const parts: string[] = [];

  parts.push(
    match.stage === 'group' && match.group
      ? `Group ${match.group}`
      : MATCH_STAGE_LABELS[match.stage],
  );

  if (match.venue) {
    parts.push(match.venue);
  }

  if (match.city) {
    parts.push(match.city);
  }

  return parts.join(' · ');
}
