import ErrorState from '@/components/feedback/ErrorState';
import GroupGrid from '@/components/standings/GroupGrid';
import Legend from '@/components/standings/Legend';
import StandingsSkeleton from '@/components/standings/StandingsSkeleton';

import { useTournament } from '@/context/TournamentContext';

import { useStandings } from '@/hooks/useStandings';

/**
 * Renders the title and dynamic subtitle depending on tournaments status
 * If standings are available, display its legend and table-wise data
 * Render a skeleton when loading or error state upon error
 */
const Standings = () => {
  const { selectedTournament, selectedTournamentId } = useTournament();
  const { standings, isLoading, error, refetch, canRetry } = useStandings({
    tournamentId: selectedTournamentId,
  });

  const hasStarted = selectedTournament
    ? new Date() > new Date(selectedTournament.start_date)
    : false;

  const tournamentName = selectedTournament?.name;

  const description =
    hasStarted && tournamentName
      ? `View group standings for ${tournamentName}.`
      : "The group stage hasn't started yet. Check back once the tournament kicks off.";

  // render error state with possible retry logic
  if (error) {
    return (
      <ErrorState
        title="Standings Unavailable"
        description={error.message}
        // show retry button if allowed
        onAction={canRetry ? refetch : undefined}
      />
    );
  }

  // render skeleton of data being loaded
  if (isLoading) {
    return (
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Standings</h1>
        <p className="text-muted-foreground">{description}</p>

        <StandingsSkeleton />
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-bold tracking-tight">Standings</h1>

      <p className="text-muted-foreground">{description}</p>

      <div className="space-y-4 pt-2">
        <Legend />
        <GroupGrid standings={standings} />
      </div>
    </section>
  );
};

export default Standings;
