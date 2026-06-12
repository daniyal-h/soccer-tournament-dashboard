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
    iconClassName: 'text-green-600 dark:text-green-400',
    cardClassName: 'border-green-500/50 bg-green-500/15 dark:bg-green-500/10',
  },

  penalty_goal: {
    title: 'PENALTY SCORED!',
    icon: Goal,
    iconClassName: 'text-green-600 dark:text-green-400',
    cardClassName: 'border-green-500/50 bg-green-500/15 dark:bg-green-500/10',
  },

  own_goal: {
    title: 'OWN GOAL',
    icon: Goal,
    iconClassName: 'text-red-600 dark:text-red-400',
    cardClassName: 'border-red-500/50 bg-red-500/15 dark:bg-red-500/10',
  },

  penalty_miss: {
    title: 'PENALTY MISSED',
    icon: XCircle,
    iconClassName: 'text-red-600 dark:text-red-400',
    cardClassName: 'border-red-500/50 bg-red-500/15 dark:bg-red-500/10',
  },

  yellow_card: {
    title: 'YELLOW CARD',
    icon: RectangleVertical,
    iconClassName: 'fill-yellow-400 text-yellow-500 dark:text-yellow-400',
    cardClassName: 'border-yellow-500/50 bg-yellow-400/20 dark:bg-yellow-500/10',
  },

  red_card: {
    title: 'RED CARD',
    icon: RectangleVertical,
    iconClassName: 'fill-red-500 text-red-600 dark:text-red-400',
    cardClassName: 'border-red-500/50 bg-red-500/15 dark:bg-red-500/10',
  },

  substitution: {
    title: 'SUB',
    icon: ArrowLeftRight,
    iconClassName: 'text-blue-600 dark:text-blue-400',
    cardClassName: 'border-blue-500/50 bg-blue-500/15 dark:bg-blue-500/10',
  },

  var: {
    title: 'VAR REVIEW',
    icon: MonitorCheck,
    iconClassName: 'text-purple-600 dark:text-purple-400',
    cardClassName: 'border-purple-500/50 bg-purple-500/15 dark:bg-purple-500/10',
  },

  other: {
    title: 'MATCH EVENT',
    icon: CircleDot,
    iconClassName: 'text-muted-foreground',
    cardClassName: 'border-border bg-card',
  },
};
