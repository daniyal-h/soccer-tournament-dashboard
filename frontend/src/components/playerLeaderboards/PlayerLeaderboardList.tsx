import type { CategoryType, RankedPlayer } from '@/types/playerLeaderboard';

import { CATEGORY_CONTENT } from '@/constants/playerLeaderboards';

import PlayerLeaderboardCard from './PlayerLeaderboardCard';

interface PlayerLeaderboardListProps {
  players: RankedPlayer[];
  category: CategoryType;
}

function PlayerLeaderboardList({ players, category }: PlayerLeaderboardListProps) {
  const content = CATEGORY_CONTENT[category];

  return (
    <section className="space-y-4">
      <div className="grid gap-4 min-[900px]:grid-cols-2">
        {players.map((player) => (
          <PlayerLeaderboardCard
            key={`${category}-${player.player.id}`} // a player may appear in multiple categories
            player={player}
            valueLabel={content.valueLabel}
          />
        ))}
      </div>
    </section>
  );
}

export default PlayerLeaderboardList;
