import type { Match } from '@/types/match';

import { MATCH_STAGE_LABELS } from '@/constants/matches';

export function formatMatchDate(kickoffTime: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(kickoffTime));
}

export function formatStage(match: Match) {
  if (match.stage === 'group' && match.group) {
    return `Group ${match.group}`;
  }

  return MATCH_STAGE_LABELS[match.stage];
}

export function getScoreText(match: Match) {
  if (match.status === 'scheduled') {
    return 'VS';
  }

  return `${match.team_a_score ?? 0} - ${match.team_b_score ?? 0}`;
}

export function getRelativeTime(timestamp: string, now: number) {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;

  const elapsed = new Date(timestamp).getTime() - now; // Negative if in the past
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (Math.abs(elapsed) < msPerMinute) {
    return rtf.format(Math.round(elapsed / 1000), 'second');
  } else if (Math.abs(elapsed) < msPerHour) {
    return rtf.format(Math.round(elapsed / msPerMinute), 'minute');
  } else if (Math.abs(elapsed) < msPerDay) {
    return rtf.format(Math.round(elapsed / msPerHour), 'hour');
  } else {
    return rtf.format(Math.round(elapsed / msPerDay), 'day');
  }
}
