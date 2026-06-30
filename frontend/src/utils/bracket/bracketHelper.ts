import type { BracketResponse, BracketRound } from '@/types/bracket';

import { BRACKET_STAGE_ORDER } from '@/constants/brackets';
import { MATCH_STAGE_LABELS } from '@/constants/matches';

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

export function getBracketRounds(bracket: BracketResponse): BracketRound[] {
  // filter empty rounds from outside in for smaller tournaments
  // e.g. some may not have enough teams for Round of 32 or 16
  return BRACKET_STAGE_ORDER.map((stage) => ({
    stage,
    title: MATCH_STAGE_LABELS[stage],
    matches: bracket[stage],
  })).filter((round) => round.matches.length > 0);
}

type ScrollSource = 'top' | 'content';

export function syncBracketScroll(
  source: ScrollSource,
  top: HTMLDivElement | null,
  content: HTMLDivElement | null,
) {
  if (!top || !content) {
    return;
  }

  if (source === 'top') {
    content.scrollLeft = top.scrollLeft;
    return;
  }

  top.scrollLeft = content.scrollLeft;
}
