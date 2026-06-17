import { Separator } from '@/components/ui/separator';

import { useTournament } from '@/context/TournamentContext';

import { useTeamMatches } from '@/hooks/useTeamMatches';

import type { TeamPageProps } from '@/types/team';

import EmptyState from '../feedback/EmptyState';
import ErrorState from '../feedback/ErrorState';
import { Accordion } from '../ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import RecentForm from './teamJourney/RecentForm';
import TeamJourneySkeleton from './teamJourney/TeamJourneySkeleton';
import TeamMatchStageAccordion from './teamJourney/TeamMatchStageAccordion';

import { getRecentForm } from '@/utils/teams/teamMatchesHelper';

const TeamJourneySection = ({ teamId }: TeamPageProps) => {
  const { selectedTournamentId, error: tournamentError } = useTournament();

  const { groupedMatches, lastFiveMatches, isLoading, error, emptyState, refetch, canRetry } =
    useTeamMatches({
      tournament_id: selectedTournamentId,
      team_id: teamId,
    });

  // handle loading, error and empty states

  if (isLoading) {
    return <TeamJourneySkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        title="Matches Unavailable"
        description={error.message}
        onAction={canRetry ? () => refetch(Boolean(tournamentError)) : undefined}
      />
    );
  }

  if (emptyState) {
    return <EmptyState title="Matches Unavailable" description={emptyState} />;
  }

  // get the recent form data
  const recentForm = getRecentForm(lastFiveMatches, teamId);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Tournament Journey</CardTitle>
        <CardDescription>Recent form and all matches for this team</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <RecentForm form={recentForm} />

        <Separator />

        <Accordion type="multiple">
          {groupedMatches.map((group) => (
            <TeamMatchStageAccordion key={group.stage} group={group} />
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default TeamJourneySection;
