import type { BracketOptions, BracketResponse } from '@/types/bracket';

import { apiGet } from './client';
import { isMatchesResponse } from './matchesApi';

function isBracketResponse(value: unknown): value is BracketResponse {
  // Stryker disable next-line ConditionalExpression
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const response = value as Record<string, unknown>;

  return (
    isMatchesResponse(response.round_of_32) &&
    isMatchesResponse(response.round_of_16) &&
    isMatchesResponse(response.quarter_final) &&
    isMatchesResponse(response.semi_final) &&
    isMatchesResponse(response.third_place) &&
    isMatchesResponse(response.final)
  );
}

export async function getBracket({ tournament_id }: BracketOptions) {
  const path = `/tournaments/${tournament_id}/bracket`;

  const data = await apiGet<BracketResponse>(path);

  if (!isBracketResponse(data)) {
    throw new Error('Invalid bracket response');
  }

  return data;
}
