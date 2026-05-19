import { useTournament } from '@/context/TournamentContext';

import GroupGrid from '@/components/standings/GroupGrid';
import Legend from '@/components/standings/Legend';

import { useStandings } from '@/hooks/useStandings';

import ErrorState from '@/components/feedback/ErrorState';
import StandingsSkeleton from '@/components/standings/StandingsSkeleton';

const Standings = () => {
  const { selectedTournament, selectedTournamentId } = useTournament();
  const { standings, isLoading, error } = useStandings({ tournamentId: selectedTournamentId });

  if (error) {
    return <ErrorState description={error.message} />;
  }

  if (isLoading) {
    return (
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Standings</h1>
        <p className="text-muted-foreground">
          View group standings for {selectedTournament?.name ?? 'the selected tournament'}.
        </p>

        <StandingsSkeleton />
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-bold tracking-tight">Standings</h1>

      <p className="text-muted-foreground">
        View standings for {selectedTournament?.name ?? 'the selected tournament'}.
      </p>

      <div className="space-y-4 pt-2">
        <Legend />
        <GroupGrid standings={standings} />
      </div>
    </section>
  );
};

export default Standings;
