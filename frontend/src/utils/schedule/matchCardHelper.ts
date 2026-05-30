import { type Match } from '@/types/matches';

import { MATCH_STAGE_LABELS } from '@/constants/schedule';

//** return the local day on the match in the form MMM DD */
export function getMatchDay(match: Match): string {
  const { kickoff_time } = match;
  const utcDate = new Date(kickoff_time);

  const formatter = new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
  });

  return formatter.format(utcDate);
}

export function getMatchCenterDisplay(match: Match): string {
  switch (match.status) {
    case 'scheduled':
      return formatKickoffTime(match.kickoff_time);

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

// convert timestamp to local hourly (e.g. 02:00 pm)
function formatKickoffTime(kickoffTime: string): string {
  const formattedKickoffTime = new Date(kickoffTime).toLocaleString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return formattedKickoffTime;
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
