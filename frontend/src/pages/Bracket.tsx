import { BracketGrid } from '@/components/bracket/BracketGrid';
import { BracketSkeleton } from '@/components/bracket/BracketSkeleton';
import BracketTabs from '@/components/bracket/BracketTab';
import EmptyState from '@/components/feedback/EmptyState';
import ErrorState from '@/components/feedback/ErrorState';

import { useTournament } from '@/context/TournamentContext';

import { useBracket } from '@/hooks/useBracket';

import { getBracketRounds } from '@/utils/bracket/bracketHelper';

const Bracket = () => {
  const { selectedTournamentId, error: tournamentError } = useTournament();
  const { bracket, isLoading, error, emptyState, refetch, canRetry } = useBracket({
    tournament_id: selectedTournamentId,
  });

  const description = isLoading
    ? 'Loading the tournament bracket...'
    : 'Follow the knockout journey from the first round to the final.';

  if (isLoading) {
    return (
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Bracket</h1>

        <p className="text-muted-foreground">{description}</p>

        <BracketSkeleton />
      </section>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Bracket Unavailable"
        description={error.message}
        onAction={canRetry ? () => refetch(Boolean(tournamentError)) : undefined}
      />
    );
  }

  if (emptyState) {
    return <EmptyState title="Bracket Coming Soon" description={emptyState} />;
  }

  const rounds = getBracketRounds(bracket);

  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-bold tracking-tight">Bracket</h1>
      <p className="text-muted-foreground">{description}</p>

      {/* Render tabs for smaller screens, otherwise grid form */}
      <div className="md:hidden">
        <BracketTabs rounds={rounds} />
      </div>
      <div className="hidden md:block">
        <BracketGrid rounds={rounds} />
      </div>
    </section>
  );
};

export default Bracket;
