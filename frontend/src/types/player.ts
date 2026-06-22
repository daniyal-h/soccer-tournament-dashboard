export interface PlayerSimpleSummary {
  id: number;
  display_name: string;
  photo_url: string | null;
}

export interface PlayerSummary extends PlayerSimpleSummary {
  first_name: string | null;
  last_name: string | null;
  nationality: string | null;
  date_of_birth: string | null;
  height: number | null;
}

export type PositionType = 'GK' | 'DEF' | 'MID' | 'FWD';
