// a Standing includes some details of its team
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
