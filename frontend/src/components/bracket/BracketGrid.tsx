import type { BracketRound as BracketRoundType } from '@/types/bracket';

import BracketRound from './BracketRound';

interface BracketGridProps {
  rounds: BracketRoundType[];
}

export function BracketGrid({ rounds }: BracketGridProps) {
  return (
    <div className="overflow-x-auto pb-4 px-1">
      <div className="flex min-w-max items-start gap-10">
        {rounds.map((round) => (
          <BracketRound key={round.stage} {...round} />
        ))}
      </div>
    </div>
  );
}
