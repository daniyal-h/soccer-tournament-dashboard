import EmptyState from '@/components/feedback/EmptyState';
import ErrorState from '@/components/feedback/ErrorState';
import MatchSchedule from '@/components/matches/MatchSchedule';
import ScheduleSkeleton from '@/components/matches/ScheduleSkeleton';

import { useTournament } from '@/context/TournamentContext';

import { useMatches } from '@/hooks/useMatches';

const Schedule = () => {
  const { selectedTournament, selectedTournamentId, error: tournamentError } = useTournament();
  const { groupedMatches, isLoading, error, emptyState, refetch, canRetry } = useMatches({
    tournament_id: selectedTournamentId,
  });

  const tournamentName = selectedTournament?.name;

  const description = `View upcoming and completed tournament matches for the 
        ${tournamentName ?? 'the selected tournament'}.`;

  // render error state with possible retry logic
  if (error) {
    return (
      <ErrorState
        title="Schedule Unavailable"
        description={error.message}
        // show retry button if allowed
        // refetch tournaments if that is also broken
        onAction={canRetry ? () => refetch(Boolean(tournamentError)) : undefined}
      />
    );
  }

  // render skeleton of data being loaded
  if (isLoading) {
    return (
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
        <p className="text-muted-foreground">{description}</p>

        <ScheduleSkeleton />
      </section>
    );
  }

  if (emptyState) {
    return <EmptyState title="Schedule Unavailable" description={emptyState} />;
  }

  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>

      <p className="text-muted-foreground">{description}</p>

      <MatchSchedule key={selectedTournamentId} groupedMatches={groupedMatches} />
    </section>
  );
};

export default Schedule;
