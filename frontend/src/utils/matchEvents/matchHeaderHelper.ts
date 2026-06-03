import type { Match } from '@/types/match';

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

  return match.stage.charAt(0).toUpperCase() + match.stage.slice(1);
}

export function getScoreText(match: Match) {
  if (match.status === 'scheduled') {
    return 'VS';
  }

  return `${match.team_a_score ?? 0} - ${match.team_b_score ?? 0}`;
}
