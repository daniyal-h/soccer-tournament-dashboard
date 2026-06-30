import { useRef } from 'react';

import type { BracketRound as BracketRoundType } from '@/types/bracket';

import BracketRound from './BracketRound';

interface BracketGridProps {
  rounds: BracketRoundType[];
}

export function BracketGrid({ rounds }: BracketGridProps) {
  const topScrollRef = useRef<HTMLDivElement>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);

  function syncScroll(source: 'top' | 'content') {
    const top = topScrollRef.current;
    const content = contentScrollRef.current;

    if (!top || !content) {
      return;
    }

    if (source === 'top') {
      content.scrollLeft = top.scrollLeft;
      return;
    }

    top.scrollLeft = content.scrollLeft;
  }

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        Scroll horizontally to view later rounds.
      </p>

      <div
        ref={topScrollRef}
        data-testid="bracket-top-scroll"
        onScroll={() => syncScroll('top')}
        className="mb-2 overflow-x-auto px-1"
      >
        <div
          data-testid="bracket-top-scroll-spacer"
          className="h-px"
          style={{ width: `${rounds.length * 29}rem` }}
        />
      </div>

      <div
        ref={contentScrollRef}
        data-testid="bracket-content-scroll"
        onScroll={() => syncScroll('content')}
        className="overflow-x-auto px-1 pb-4"
      >
        <div className="flex min-w-max items-start gap-10">
          {rounds.map((round) => (
            <BracketRound key={round.stage} {...round} />
          ))}
        </div>
      </div>
    </div>
  );
}
