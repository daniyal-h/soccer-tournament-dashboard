import { useMatch } from '@/hooks/useMatch';
import { useMatchEvents } from '@/hooks/useMatchEvents';

import { EMPTY_RESPONSE_METADATA } from '@/constants/metadata';

import ErrorState from '../feedback/ErrorState';
import MatchHeader from './header/MatchHeader';
import MatchHeaderSkeleton from './header/MatchHeaderSkeleton';
import MatchTimeline from './timeline/MatchTimeline';

interface MatchDetailsProps {
  matchId: number;
}

const MatchDetailsContent = ({ matchId }: MatchDetailsProps) => {
  const {
    match,
    isLoading: isMatchLoading,
    error: matchError,
    refetch: refetchMatch,
    canRetry: canRetryMatch,
  } = useMatch(matchId);

  const {
    matchEvents,
    metadata,
    isLoading: isEventsLoading,
    error: eventsError,
    emptyState: eventsEmptyState,
    refetch: refetchEvents,
    canRetry: canRetryEvents,
  } = useMatchEvents({ match_id: matchId });

  if (isMatchLoading) {
    return <MatchHeaderSkeleton />;
  }

  if (matchError) {
    return (
      <ErrorState
        title="Match Unavailable"
        description={matchError.message}
        onAction={canRetryMatch ? refetchMatch : undefined}
      />
    );
  }

  if (match == null) {
    return <ErrorState title="Match Unavailable" description="Match not found." />;
  }

  return (
    <div>
      <MatchHeader match={match} metadata={metadata ?? EMPTY_RESPONSE_METADATA} />

      {eventsError ? (
        <ErrorState
          title="Match Events Unavailable"
          description={eventsError.message}
          onAction={canRetryEvents ? refetchEvents : undefined}
        />
      ) : (
        <MatchTimeline
          match={match}
          events={matchEvents}
          isLoading={isEventsLoading}
          emptyState={eventsEmptyState}
        />
      )}
    </div>
  );
};

export default MatchDetailsContent;
