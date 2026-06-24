import { useState } from 'react';

import CategoryPicker from '@/components/playerLeaderboards/CategoryPicker';
import PlayerLeaderboardSection from '@/components/playerLeaderboards/PlayerLeaderboardSection';

import { useTournament } from '@/context/TournamentContext';

import type { CategoryType } from '@/types/playerLeaderboard';

const PlayerStats = () => {
  const { selectedTournamentId, error: tournamentError } = useTournament();
  const [category, setCategory] = useState<CategoryType>('goals');

  const description = 'Explore top players, goals, assists, and tournament records.';

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Player Statistics</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <CategoryPicker category={category} setCategory={setCategory} />

      <PlayerLeaderboardSection
        tournamentId={selectedTournamentId}
        category={category}
        hasTournamentError={Boolean(tournamentError)}
      />
    </section>
  );
};

export default PlayerStats;
