import { Accordion } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { useTournament } from '@/context/TournamentContext';

import { useTeamSquad } from '@/hooks/useTeamSquad';

import type { TeamPageProps } from '@/types/team';

import EmptyState from '../feedback/EmptyState';
import ErrorState from '../feedback/ErrorState';
import PositionSquadAccordion from './teamSquad/PositionSquadAccordion';

const TeamSquadSection = ({ teamId }: TeamPageProps) => {
  const { selectedTournamentId, error: tournamentError } = useTournament();

  const { groupedSquad, isLoading, error, emptyState, refetch, canRetry } = useTeamSquad({
    tournament_id: selectedTournamentId,
    team_id: teamId,
  });

  if (isLoading) {
    return <div>Loading...</div>; // TODO: replace with skeleton
  }

  if (error) {
    return (
      <ErrorState
        title="Squad Unavailable"
        description={error.message}
        onAction={canRetry ? () => refetch(Boolean(tournamentError)) : undefined}
      />
    );
  }

  if (emptyState) {
    return <EmptyState title="Squad Unavailable" description={emptyState} />;
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Team Squad</CardTitle>
        <CardDescription>Player roster and squad details for this competition</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Accordion type="multiple">
          {groupedSquad.map((group) => (
            <PositionSquadAccordion key={group.position} group={group} />
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default TeamSquadSection;
