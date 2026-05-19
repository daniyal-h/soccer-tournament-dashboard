import { useTournament } from '@/context/TournamentContext';

const PlayerStats = () => {
  const { selectedTournament } = useTournament();

  return (
    <section className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">Player Statistics</h1>

      <p className="text-muted-foreground">
        View the statistics for {selectedTournament?.name ?? 'the selected tournament'}.
      </p>
    </section>
  );
};

export default PlayerStats;
