export function formatMinutes(minutes: number | null) {
  if (minutes === null) {
    return null;
  }

  return `${minutes} min`;
}

export function formatRating(rating: number | null) {
  if (rating === null) {
    return null;
  }

  return rating.toFixed(2);
}
