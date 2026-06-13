import ErrorState from '@/components/feedback/ErrorState';
import TeamCardGrid from '@/components/tournamentTeams/TeamCardGrid';
import TeamFilters from '@/components/tournamentTeams/TeamFilters';

import { useTournament } from '@/context/TournamentContext';

import { useTournamentTeams } from '@/hooks/useTournamentTeams';

const Teams = () => {
  const { selectedTournament, selectedTournamentId, error: tournamentError } = useTournament();
  const { tournamentTeams, isLoading, error, refetch, canRetry } = useTournamentTeams({
    tournament_id: selectedTournamentId,
  });

  const tournamentName = selectedTournament?.name;

  const description = `View all ${tournamentTeams?.length} teams in the ${tournamentName ?? 'the selected tournament'}.`;

  // render error and loading states

  if (error) {
    return (
      <ErrorState
        title="Teams Unavailable"
        description={error.message}
        // show retry button if allowed
        // refetch tournaments if that is also broken
        onAction={canRetry ? () => refetch(Boolean(tournamentError)) : undefined}
      />
    );
  }

  if (isLoading) {
    return (
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Teams (in-progress)</h1>
        <p className="text-muted-foreground">Loading teams...</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-bold tracking-tight">Teams (in-progress)</h1>
      <p className="text-muted-foreground">{description}</p>

      <div className="space-y-4 pt-2">
        <TeamFilters />
        <TeamCardGrid teams={tournamentTeams} />
      </div>
    </section>
  );
};

export default Teams;
