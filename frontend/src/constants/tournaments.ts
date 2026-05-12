export type Tournament = {
  id: string;
  label: string;
};

export const TOURNAMENTS: Tournament[] = [
  { id: 'world-cup-2026', label: 'FIFA World Cup 2026' },
  { id: 'uefa-champions-league', label: 'UEFA Champions League' },
  { id: 'copa-america', label: 'Copa America' },
];

export const DEFAULT_TOURNAMENT_ID = 'world-cup-2026';

export const getTournamentById = (tournamentId: string) => {
  return TOURNAMENTS.find((tournament) => tournament.id === tournamentId);
};

export const getTournamentByLabel = (label: string) => {
  return TOURNAMENTS.find((tournament) => tournament.label === label);
};