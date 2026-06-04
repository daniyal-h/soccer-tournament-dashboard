import type { LucideIcon } from 'lucide-react';

import type { Player } from './player';
import type { Team } from './team';

export type EventType =
  | 'goal'
  | 'own_goal'
  | 'penalty_goal'
  | 'penalty_miss'
  | 'yellow_card'
  | 'red_card'
  | 'substitution'
  | 'var'
  | 'other';

export interface MatchEvent {
  team: Team;
  player?: Player;
  secondary_player?: Player;
  player_name?: string;
  secondary_player_name?: string;
  player_external_id?: number;
  secondary_player_external_id?: number;
  event_type: EventType;
  minute: number;
  extra_minute?: number;
  detail?: string;
  comments?: string;
}

export interface MatchEventsOptions {
  match_id: number;
}

export interface EventConfig {
  title: string;
  icon: LucideIcon;
  iconClassName: string;
  cardClassName: string;
}

export interface TimelineMarkerConfig {
  minute: number;
  label: string;
  order?: number;
}

export type TimelineItem =
  | {
      type: 'event';
      minute: number;
      order: number;
      event: MatchEvent;
      score: string;
    }
  | {
      type: 'marker';
      minute: number;
      order: number;
      label: string;
    };
