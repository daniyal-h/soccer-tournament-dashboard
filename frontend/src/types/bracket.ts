import type { Match } from "./match";

export interface BracketOptions {
  tournament_id: number;
}


export interface BracketResponse {
  round_of_32: Match[];
  round_of_16: Match[];
  quarter_final: Match[];
  semi_final: Match[];
  third_place: Match[];
  final: Match[];
}