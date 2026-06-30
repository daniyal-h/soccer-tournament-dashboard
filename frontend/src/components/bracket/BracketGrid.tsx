import { useEffect, useRef, useState } from 'react';

import type { BracketRound as BracketRoundType } from '@/types/bracket';

import BracketRound from './BracketRound';

import { syncBracketScroll } from '@/utils/bracket/bracketHelper';

interface BracketGridProps {
  rounds: BracketRoundType[];
}

export function BracketGrid({ rounds }: BracketGridProps) {
  const topScrollRef = useRef<HTMLDivElement>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollHorizontally, setCanScrollHorizontally] = useState(false);

  useEffect(() => {
    const content = contentScrollRef.current;

    if (!content) {
      return;
    }

    const updateCanScroll = () => {
      setCanScrollHorizontally(content.scrollWidth > content.clientWidth);
    };

    updateCanScroll();

    const resizeObserver = new ResizeObserver(updateCanScroll);
    resizeObserver.observe(content);

    return () => resizeObserver.disconnect();
  }, [rounds.length]);

  function syncScroll(source: 'top' | 'content') {
    syncBracketScroll(source, topScrollRef.current, contentScrollRef.current);
  }

  return (
    <div>
      {canScrollHorizontally && (
        <>
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
        </>
      )}

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
