import { useEffect, useMemo, useState } from 'react';

import ErrorState from '@/components/feedback/ErrorState';
import TeamCardGrid from '@/components/tournamentTeams/TeamCardGrid';
import TeamFilters from '@/components/tournamentTeams/TeamFilters';
import TeamsSkeleton from '@/components/tournamentTeams/TeamsSkeleton';

import { useTournament } from '@/context/TournamentContext';

import { useTournamentTeams } from '@/hooks/useTournamentTeams';

import type { StageFilter } from '@/constants/tournamentTeams';

import {
  getTournamentGroups,
  getTournamentStages,
} from '@/utils/tournamentTeams/tournamentTeamsHelper';

const Teams = () => {
  const { selectedTournamentId, error: tournamentError } = useTournament();
  const { tournamentTeams, isLoading, error, refetch, canRetry } = useTournamentTeams({
    tournament_id: selectedTournamentId,
  });

  const description = isLoading
    ? 'Loading teams and rankings...'
    : `Explore all ${tournamentTeams.length} teams, groups, and tournament progress.`;

  // support filtering tournaments by group and stage

  // Stryker disable next-line StringLiteral: empty string is a subset of "other"
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  // Stryker disable next-line StringLiteral: empty string is a subset of "other"
  const [selectedStage, setSelectedStage] = useState<StageFilter>('all');
  const groups = getTournamentGroups(tournamentTeams);
  const stages = getTournamentStages(tournamentTeams);

  // default to 'all' if tournaments were switched
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedGroup('all');
    setSelectedStage('all');
  }, [selectedTournamentId]);

  const filteredTeams = useMemo(() => {
    return tournamentTeams.filter((tournamentTeam) => {
      const matchesGroup = selectedGroup === 'all' || tournamentTeam.group === selectedGroup;

      const matchesStage =
        selectedStage === 'all' || tournamentTeam.stage_reached === selectedStage;

      return matchesGroup && matchesStage;
    });
  }, [tournamentTeams, selectedGroup, selectedStage]);

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
        <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
        <p className="text-muted-foreground">{description}</p>
        <TeamsSkeleton />
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
      <p className="text-muted-foreground">{description}</p>

      <div className="space-y-4 pt-2">
        <TeamFilters
          groups={groups}
          stages={stages}
          selectedGroup={selectedGroup}
          selectedStage={selectedStage}
          onGroupChange={setSelectedGroup}
          onStageChange={setSelectedStage}
        />
        <TeamCardGrid teams={filteredTeams} />
      </div>
    </section>
  );
};

export default Teams;
