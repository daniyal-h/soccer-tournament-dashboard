import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { StandingStats } from '@/types/standing';

import { TOTAL_GROUP_MATCHES_COUNT } from '@/constants/teams';

import { cn } from '@/lib/utils';

interface TeamStageSummaryProps {
  standing: StandingStats;
}

function formatGoalDifference(goalDifference: number): string {
  if (goalDifference > 0) {
    return `+${goalDifference}`;
  }

  return goalDifference.toString();
}

const TeamStageSummary = ({ standing }: TeamStageSummaryProps) => {
  const matchesPlayed = `${standing.matches_played} / ${TOTAL_GROUP_MATCHES_COUNT}`;
  const isQualifiedPosition = standing.position <= 2;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Group Stage Summary</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div
            className={cn(
              'rounded-lg border p-4 bg-accent',
              isQualifiedPosition && 'bg-green-100 dark:bg-green-950',
            )}
          >
            <p className="text-sm font-medium text-muted-foreground">Position</p>
            <p className="mt-1 text-2xl font-black">{standing.position}</p>
          </div>

          <div className="rounded-lg border p-4 bg-accent">
            <p className="text-sm font-medium text-muted-foreground">Points</p>
            <p className="mt-1 text-2xl font-black">{standing.points}</p>
          </div>

          <div className="rounded-lg border p-4 bg-accent">
            <p className="text-sm font-medium text-muted-foreground">Played</p>
            <p className="mt-1 text-2xl font-black">{matchesPlayed}</p>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-accent/40 p-3">
            <dt className="text-sm text-muted-foreground">Record</dt>
            <dd className="mt-1 font-semibold">
              {standing.wins}-{standing.draws}-{standing.losses}
            </dd>
          </div>

          <div className="rounded-lg bg-accent/40 p-3">
            <dt className="text-sm text-muted-foreground">Goals For</dt>
            <dd className="mt-1 font-semibold">{standing.goals_for}</dd>
          </div>

          <div className="rounded-lg bg-accent/40 p-3">
            <dt className="text-sm text-muted-foreground">Goals Against</dt>
            <dd className="mt-1 font-semibold">{standing.goals_against}</dd>
          </div>

          <div className="rounded-lg bg-accent/40 p-3">
            <dt className="text-sm text-muted-foreground">Goal Difference</dt>
            <dd className="mt-1 font-semibold">{formatGoalDifference(standing.goal_difference)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};

export default TeamStageSummary;
