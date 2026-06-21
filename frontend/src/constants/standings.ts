export const COLUMNS = [
  { key: 'mp', label: 'MP', dataKey: 'matches_played', mobileHidden: true },
  { key: 'w', label: 'W', dataKey: 'wins', mobileHidden: false },
  { key: 'd', label: 'D', dataKey: 'draws', mobileHidden: false },
  { key: 'l', label: 'L', dataKey: 'losses', mobileHidden: false },
  { key: 'gf', label: 'GF', dataKey: 'goals_for', mobileHidden: true },
  { key: 'ga', label: 'GA', dataKey: 'goals_against', mobileHidden: true },
  { key: 'gd', label: 'GD', dataKey: 'goal_difference', mobileHidden: false },
  { key: 'pts', label: 'Pts', dataKey: 'points', mobileHidden: false },
] as const;

export const LEGEND = [
  { abbr: 'MP', full: 'Matches Played', mobileHidden: true },
  { abbr: 'W', full: 'Wins', mobileHidden: false },
  { abbr: 'D', full: 'Draws', mobileHidden: false },
  { abbr: 'L', full: 'Losses', mobileHidden: false },
  { abbr: 'GF', full: 'Goals For', mobileHidden: true },
  { abbr: 'GA', full: 'Goals Against', mobileHidden: true },
  { abbr: 'GD', full: 'Goal Difference', mobileHidden: false },
  { abbr: 'Pts', full: 'Points', mobileHidden: false },
] as const;
