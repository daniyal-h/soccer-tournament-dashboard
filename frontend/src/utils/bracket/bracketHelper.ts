import type { BracketResponse } from '@/types/bracket';

export function hasBracketMatches(bracket: BracketResponse) {
  return (
    bracket.round_of_32.length > 0 ||
    bracket.round_of_16.length > 0 ||
    bracket.quarter_final.length > 0 ||
    bracket.semi_final.length > 0 ||
    bracket.third_place.length > 0 ||
    bracket.final.length > 0
  );
}
