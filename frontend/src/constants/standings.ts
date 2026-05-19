export const COLUMNS = [
  { key: 'mp', label: 'MP' },
  { key: 'w', label: 'W' },
  { key: 'd', label: 'D' },
  { key: 'l', label: 'L' },
  { key: 'gf', label: 'GF' },
  { key: 'ga', label: 'GA' },
  { key: 'gd', label: 'GD' },
  { key: 'pts', label: 'Pts' },
] as const;

export const LEGEND = [
  { abbr: 'MP', full: 'Matches Played' },
  { abbr: 'W', full: 'Wins' },
  { abbr: 'D', full: 'Draws' },
  { abbr: 'L', full: 'Losses' },
  { abbr: 'GF', full: 'Goals For' },
  { abbr: 'GA', full: 'Goals Against' },
  { abbr: 'GD', full: 'Goal Difference' },
  { abbr: 'Pts', full: 'Points' },
] as const;

export interface Standing {
  team: {
    id: number;
    name: string;
    short_name: string;
    logo_url: string;
  };
  position: number;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

export const stubGroup = [
  {
    team: {
      id: 1,
      name: 'Argentina',
      short_name: 'ARG',
      logo_url: 'https://flagcdn.com/w40/ar.png',
    },
    position: 1,
    matches_played: 3,
    wins: 3,
    draws: 0,
    losses: 0,
    goals_for: 8,
    goals_against: 2,
    goal_difference: 6,
    points: 9,
  },
  {
    team: { id: 3, name: 'France', short_name: 'FRA', logo_url: 'https://flagcdn.com/w40/fr.png' },
    position: 2,
    matches_played: 3,
    wins: 2,
    draws: 0,
    losses: 1,
    goals_for: 5,
    goals_against: 3,
    goal_difference: 2,
    points: 6,
  },
  {
    team: { id: 4, name: 'Germany', short_name: 'GER', logo_url: 'https://flagcdn.com/w40/de.png' },
    position: 3,
    matches_played: 3,
    wins: 1,
    draws: 0,
    losses: 2,
    goals_for: 3,
    goals_against: 6,
    goal_difference: -3,
    points: 3,
  },
  {
    team: { id: 2, name: 'Brazil', short_name: 'BRA', logo_url: 'https://flagcdn.com/w40/br.png' },
    position: 4,
    matches_played: 3,
    wins: 0,
    draws: 0,
    losses: 3,
    goals_for: 1,
    goals_against: 6,
    goal_difference: -5,
    points: 0,
  },
];
