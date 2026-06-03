import type { Player } from './player';
import type { Team } from './team';

type EventType =
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
