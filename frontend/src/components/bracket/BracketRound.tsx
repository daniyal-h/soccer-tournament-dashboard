import type { BracketRound as BracketRoundProps } from '@/types/bracket';

import MatchCard from '../matches/MatchCard';

function BracketRound({ title, matches }: BracketRoundProps) {
  return (
    <section className="w-[26rem] shrink-0 my-8">
      <h2 className="mb-5 text-center text-sm font-semibold text-muted-foreground">{title}</h2>

      <div className="flex flex-col gap-6">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  );
}

export default BracketRound;
