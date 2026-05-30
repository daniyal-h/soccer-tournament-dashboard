import { type Match } from '@/types/matches';

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
  }
}
