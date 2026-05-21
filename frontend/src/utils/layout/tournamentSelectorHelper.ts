import { type Tournament } from '@/types/tournament';

// return the season(s) the tournament spanned
// if multiple seasons, return in the form: "2025/26"
export function formatSeason(tournament: Tournament): string {
  const startYear = new Date(tournament.start_date).getFullYear();
  const endYear = new Date(tournament.end_date).getFullYear();

  if (startYear === endYear) {
    return tournament.season;
  } else {
    return `${startYear}/${endYear % 2000}`;
  }
}
