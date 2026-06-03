import {
  ArrowLeftRight,
  CircleDot,
  Goal,
  MonitorCheck,
  RectangleVertical,
  XCircle,
} from 'lucide-react';

import type { Match } from '@/types/match';
import type { MatchEvent } from '@/types/matchEvent';

import { ICON_SIZE } from '@/constants/matchEvents';

import { cn } from '@/lib/utils';

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

export function getEventDisplay(event: MatchEvent) {
  switch (event.event_type) {
    case 'goal':
      return {
        title: 'GOAL!',
        icon: <Goal className={cn(ICON_SIZE, 'text-green-500')} />,
      };

    case 'penalty_goal':
      return {
        title: 'PENALTY SCORED!',
        icon: <Goal className={cn(ICON_SIZE, 'text-green-500')} />,
      };

    case 'own_goal':
      return {
        title: 'OWN GOAL',
        icon: <Goal className={cn(ICON_SIZE, 'text-red-500')} />,
      };

    case 'penalty_miss':
      return {
        title: 'PENALTY MISSED',
        icon: <XCircle className={cn(ICON_SIZE, 'text-red-500')} />,
      };

    case 'yellow_card':
      return {
        title: 'YELLOW CARD',
        icon: <RectangleVertical className={cn(ICON_SIZE, 'fill-yellow-400 text-yellow-400')} />,
      };

    case 'red_card':
      return {
        title: 'RED CARD',
        icon: <RectangleVertical className={cn(ICON_SIZE, 'fill-red-500 text-red-500')} />,
      };

    case 'substitution':
      return {
        title: 'SUB',
        icon: <ArrowLeftRight className={cn(ICON_SIZE, 'text-blue-500')} />,
      };

    case 'var':
      return {
        title: 'VAR Review',
        icon: <MonitorCheck className={cn(ICON_SIZE)} />,
      };

    default:
      return {
        title: 'Match Event',
        icon: <CircleDot className={cn(ICON_SIZE)} />,
      };
  }
}

export function addScoresToEvents(events: MatchEvent[], match: Match) {
  let teamAScore = 0;
  let teamBScore = 0;

  return events.map((event) => {
    if (event.event_type === 'goal' || event.event_type === 'penalty_goal') {
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
