import {
  ArrowLeftRight,
  CircleDot,
  Goal,
  MonitorCheck,
  RectangleVertical,
  XCircle,
} from 'lucide-react';

import type { EventConfig, EventType } from '@/types/matchEvent';

export const EVENT_CONFIG: Record<EventType, EventConfig> = {
  goal: {
    title: 'GOAL!',
    icon: Goal,
    iconClassName: 'text-green-500',
    cardClassName: 'border-green-500/30 bg-green-500/5',
  },

  penalty_goal: {
    title: 'PENALTY SCORED!',
    icon: Goal,
    iconClassName: 'text-green-500',
    cardClassName: 'border-green-500/30 bg-green-500/5',
  },

  own_goal: {
    title: 'OWN GOAL',
    icon: Goal,
    iconClassName: 'text-red-500',
    cardClassName: 'border-red-500/30 bg-red-500/5',
  },

  penalty_miss: {
    title: 'PENALTY MISSED',
    icon: XCircle,
    iconClassName: 'text-red-500',
    cardClassName: 'border-red-500/30 bg-red-500/5',
  },

  yellow_card: {
    title: 'YELLOW CARD',
    icon: RectangleVertical,
    iconClassName: 'fill-yellow-400 text-yellow-400',
    cardClassName: 'border-yellow-500/30 bg-yellow-500/5',
  },

  red_card: {
    title: 'RED CARD',
    icon: RectangleVertical,
    iconClassName: 'fill-red-500 text-red-500',
    cardClassName: 'border-red-500/30 bg-red-500/5',
  },

  substitution: {
    title: 'SUB',
    icon: ArrowLeftRight,
    iconClassName: 'text-blue-500',
    cardClassName: 'border-blue-500/30 bg-blue-500/5',
  },

  var: {
    title: 'VAR REVIEW',
    icon: MonitorCheck,
    iconClassName: 'text-purple-500',
    cardClassName: 'border-purple-500/30 bg-purple-500/5',
  },

  other: {
    title: 'MATCH EVENT',
    icon: CircleDot,
    iconClassName: 'text-muted-foreground',
    cardClassName: 'border-border bg-card',
  },
};
