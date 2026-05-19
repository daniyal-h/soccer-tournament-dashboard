import { useTournament } from '@/context/TournamentContext';

import GroupGrid from '@/components/standings/GroupGrid';
import Legend from '@/components/standings/Legend';

import { useStandings } from '@/hooks/useStandings';

import LoadingState from '@/components/feedback/LoadingState';
import ErrorState from '@/components/feedback/ErrorState';

const Standings = () => {
  const { selectedTournament, selectedTournamentId } = useTournament();
  const { standings, isLoading, error } = useStandings({ tournamentId: selectedTournamentId });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState description={error.message} />;
  }

  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-bold tracking-tight">Standings</h1>

      <p className="text-muted-foreground">
        View standings for {selectedTournament?.name ?? 'the selected tournament'}.
      </p>

      <div className="space-y-4">
        <Legend />
        <GroupGrid standings={standings} />
      </div>
    </section>
  );
};

export default Standings;
