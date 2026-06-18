import type { Match, MatchStage } from './match';
import type { PlayerSummary, PositionType } from './player';
import type { StandingStats } from './standing';

export interface TeamSummary {
  id: number;
  name: string;
  short_name: string;
  logo_url: string | null;
}

export interface TeamPageProps {
  teamId: number;
}

export interface TournamentTeamOptions {
  tournament_id: number;
  team_id: number;
}

export interface TeamProfile {
  team: TeamSummary;
  group: string;
  standing: StandingStats | null;
}

export interface TeamMatchesApiResponse {
  data: Match[];
}

export interface TeamMatches {
  matches: Match[];
}

export interface TeamSquad {
  player: PlayerSummary;
  squad_number: number | null;
  position: PositionType | null;
}

export interface TeamSquadApiResponse {
  data: TeamSquad[];
}

export interface TeamSquad {
  squad: TeamSquad[];
}

export type MatchFormResult = 'W' | 'D' | 'L';

export interface TeamMatchStageGroup extends TeamMatches {
  stage: MatchStage;
  label: string;
}
