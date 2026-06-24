import MatchCard from '@/components/matches/MatchCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import type { BracketRound } from '@/types/bracket';

import { COMPACT_STAGE_LABELS } from '@/constants/brackets';

interface BracketTabsProps {
  rounds: BracketRound[];
}

function BracketTabs({ rounds }: BracketTabsProps) {
  const defaultStage = rounds[0].stage;

  if (!defaultStage) {
    return null;
  }

  return (
    <Tabs defaultValue={defaultStage} className="w-full py-3">
      <div className="overflow-x-auto pb-2">
        <TabsList
          variant="line"
          className="grid w-full sm:gap-4 sm:w-fit"
          style={{
            gridTemplateColumns: `repeat(${rounds.length}, minmax(0, 1fr))`,
          }}
        >
          {rounds.map((round) => (
            <TabsTrigger key={round.stage} value={round.stage}>
              {COMPACT_STAGE_LABELS[round.stage]}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {rounds.map((round) => (
        <TabsContent key={round.stage} value={round.stage} className="mt-5">
          <div className="flex flex-col gap-4">
            {round.matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default BracketTabs;
