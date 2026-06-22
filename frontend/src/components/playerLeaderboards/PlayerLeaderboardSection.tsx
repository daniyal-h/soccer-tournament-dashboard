import { usePlayerLeaderboard } from '@/hooks/usePlayerLeaderboard';

import type { CategoryType } from '@/types/playerLeaderboard';

import { CATEGORY_CONTENT } from '@/constants/playerLeaderboards';

import EmptyState from '../feedback/EmptyState';
import ErrorState from '../feedback/ErrorState';
import PlayerLeaderboardList from './PlayerLeaderboardList';
import PlayerLeaderboardSkeleton from './PlayerLeaderboardSkeleton';

type PlayerLeaderboardSectionProps = {
  tournamentId: number;
  category: CategoryType;
  hasTournamentError: boolean;
};

function PlayerLeaderboardSection({
  tournamentId,
  category,
  hasTournamentError,
}: PlayerLeaderboardSectionProps) {
  const { playerLeaderboard, isLoading, error, emptyState, refetch, canRetry } =
    usePlayerLeaderboard({
      tournament_id: tournamentId,
      category,
    });

  const content = CATEGORY_CONTENT[category];

  if (error) {
    return (
      <ErrorState
        title={`${content.title} Unavailable`}
        description={error.message}
        onAction={canRetry ? () => refetch(hasTournamentError) : undefined}
      />
    );
  }

  if (isLoading) {
    return (
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">{content.title}</h2>
        <p className="text-muted-foreground">{content.loading}</p>
        <PlayerLeaderboardSkeleton />
      </section>
    );
  }

  if (emptyState) {
    return <EmptyState title={`No ${content.title} Data`} description={emptyState} />;
  }

  if (playerLeaderboard === null) {
    return (
      <ErrorState
        title={`${content.title} Unavailable`}
        description="Failed to load leaderboard."
      />
    );
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-xl font-semibold">{content.title}</h2>
        <p className="text-muted-foreground">{content.description}</p>
      </div>

      <PlayerLeaderboardList category={category} players={playerLeaderboard.leaderboard} />
    </section>
  );
}

export default PlayerLeaderboardSection;
