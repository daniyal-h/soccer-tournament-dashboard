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
