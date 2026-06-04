import type { Match } from '@/types/match';
import type { EventConfig, EventType, MatchEvent } from '@/types/matchEvent';

import { PENALTY_SHOOTOUT_COMMENT } from '@/constants/matchEvents';
import { EVENT_CONFIG } from '@/constants/matchEventsDisplay';

export function formatEventMinute(event: MatchEvent) {
  if (event.extra_minute) {
    return `${event.minute}+${event.extra_minute}'`;
  }

  return `${event.minute}'`;
}

export function getPlayerName(event: MatchEvent) {
  if (event.player_name) {
    return event.player_name;
  }

  return `${event.player?.first_name ?? ''} ${event.player?.last_name ?? ''}`.trim();
}

export function getSecondaryPlayerName(event: MatchEvent) {
  if (event.secondary_player_name) {
    return event.secondary_player_name;
  }

  return `${event.secondary_player?.first_name ?? ''} ${
    event.secondary_player?.last_name ?? ''
  }`.trim();
}

export function getEventConfig(type: string): EventConfig {
  return EVENT_CONFIG[type as EventType];
}

export function addScoresToEvents(events: MatchEvent[], match: Match) {
  let teamAScore = 0;
  let teamBScore = 0;

  return events.map((event) => {
    // do not mutate score if it's from penalty shootouts
    if (
      event.event_type === 'goal' ||
      (event.comments !== PENALTY_SHOOTOUT_COMMENT && event.event_type === 'penalty_goal')
    ) {
      if (event.team.id === match.team_a.id) {
        teamAScore++;
      } else {
        teamBScore++;
      }
    }

    if (event.event_type === 'own_goal') {
      if (event.team.id === match.team_a.id) {
        teamBScore++;
      } else {
        teamAScore++;
      }
    }

    return {
      event,
      score: `${teamAScore}-${teamBScore}`,
    };
  });
}
