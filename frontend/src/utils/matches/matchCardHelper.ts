import type { Match, MatchGroup } from '@/types/match';

import { MATCH_STAGE_LABELS } from '@/constants/matches';

/** Return matches grouped by days */
export function groupMatchesByDay(matches: Match[]): MatchGroup[] {
  const sortedMatches = [...matches].sort(
    (a, b) => new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime(),
  );

  const groupedMatchesMap: Record<string, Match[]> = {};

  sortedMatches.forEach((match) => {
    const day = getMatchDay(match);

    if (!groupedMatchesMap[day]) {
      groupedMatchesMap[day] = [];
    }

    groupedMatchesMap[day].push(match);
  });

  return Object.entries(groupedMatchesMap).map(([day, matches]) => ({
    day,
    matches,
  }));
}

export function findNextUpcomingDayKey(groups: MatchGroup[]): string | null {
  const todayStart = startOfToday();

  // groups are already chronological, first group whose matches are today-or-later is the one we want
  const next = groups.find((g) => new Date(g.matches[0].kickoff_time).getTime() >= todayStart);

  return next?.day ?? null;
}

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Return the local day on the match in the form MMM DD */
function getMatchDay(match: Match): string {
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

/** Get the winner based on goals or penalties */
export function getWinnerSide(match: Match): 'team_a' | 'team_b' | null {
  if (match.status !== 'finished') {
    return null;
  }

  // if not tied, winner by most goals
  if (
    match.team_a_score != null &&
    match.team_b_score != null &&
    match.team_a_score !== match.team_b_score
  ) {
    // Stryker disable next-line EqualityOperator: never a case of equalled score due to previous if-statement
    return match.team_a_score > match.team_b_score ? 'team_a' : 'team_b';
  }

  // if tied, winner by most penalties
  if (
    match.team_a_penalties != null &&
    match.team_b_penalties != null &&
    // Stryker disable next-line ConditionalExpression: never a case of equaled penalties
    match.team_a_penalties !== match.team_b_penalties
  ) {
    // Stryker disable next-line EqualityOperator: never a case of equaled penalties
    return match.team_a_penalties > match.team_b_penalties ? 'team_a' : 'team_b';
  }

  return null;
}
