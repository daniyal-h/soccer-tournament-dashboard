export interface PlayerSummary {
  id: number;
  display_name: string;
  first_name: string | null;
  last_name: string | null;
  photo_url: string | null;
  nationality: string | null;
  date_of_birth: string | null;
  height: number | null;
}
