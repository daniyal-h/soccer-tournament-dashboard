import type { TimelineMarkerConfig } from '@/types/matchEvent';

export const VALID_EVENT_TYPES = new Set([
  'goal',
  'own_goal',
  'penalty_goal',
  'penalty_miss',
  'assist',
  'yellow_card',
  'red_card',
  'substitution',
]);

export const MIN_TIMELINE_EVENT_GAP_PX = 32;
export const MAX_TIMELINE_EVENT_GAP_PX = 96;
export const TIMELINE_PIXELS_PER_5_MINUTES = 18;

export const ICON_SIZE = 'h-5 w-5';

export const PENALTY_SHOOTOUT_COMMENT = 'Penalty Shootout';

export const TIMELINE_MARKERS = {
  HALF_TIME: {
    minute: 45,
    label: 'HALF TIME',
  },
  FULL_TIME: {
    minute: 90,
    label: 'FULL TIME',
  },
  END_OF_REGULATION: {
    minute: 90,
    label: 'END OF REGULATION',
  },
  ET_HALF_TIME: {
    minute: 105,
    label: 'ET HALF TIME',
  },
  END_OF_EXTRA_TIME: {
    minute: 120,
    label: 'END OF EXTRA TIME',
  },
  PENALTY_SHOOTOUT: {
    minute: 120,
    label: 'PENALTY SHOOTOUT',
    order: 1,
  },
  END_OF_SHOOTOUT: {
    minute: 120,
    label: 'END OF SHOOTOUT',
    order: 3,
  },
} satisfies Record<string, TimelineMarkerConfig>;
