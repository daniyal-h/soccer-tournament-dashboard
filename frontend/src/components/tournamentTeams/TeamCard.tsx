import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';

import type { TournamentTeam } from '@/types/tournamentTeam';

import { MATCH_STAGE_LABELS } from '@/constants/matches';
import { ROUTES } from '@/constants/navigation';
import { TEAM_RANK_CARD_STYLES } from '@/constants/tournamentTeams';

import { cn } from '@/lib/utils';

interface TeamCardProps {
  tournamentTeam: TournamentTeam;
}

function getRankingLabel(tournamentTeam: TournamentTeam): string {
  if (tournamentTeam.final_rank !== null) {
    return `Rank #${tournamentTeam.final_rank}`;
  }

  if (tournamentTeam.stage_reached !== null) {
    return MATCH_STAGE_LABELS[tournamentTeam.stage_reached];
  }

  return 'Not ranked yet';
}

const TeamCard = ({ tournamentTeam }: TeamCardProps) => {
  const { team, group } = tournamentTeam;
  const rankStyle =
    // Stryker disable next-line ConditionalExpression: equivalent mutation
    tournamentTeam.final_rank === null
      ? undefined
      : TEAM_RANK_CARD_STYLES[tournamentTeam.final_rank];

  return (
    <Link
      to={`/teams/${team.id}`}
      state={{ from: ROUTES.TEAMS }}
      // Stryker disable next-line StringLiteral, ObjectLiteral: visual link decoration reset only
      style={{ textDecoration: 'none' }}
      className="block min-w-0"
    >
      <Card
        className={cn(
          'relative w-full cursor-pointer overflow-hidden shadow-sm transition-all',
          'hover:bg-accent hover:shadow-md',
          'active:scale-[0.98] active:bg-accent',
          rankStyle,
        )}
      >
        {team.logo_url && (
          <img
            src={team.logo_url}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 top-1/2 h-28 w-28 -translate-y-1/2 object-contain opacity-10"
          />
        )}

        <CardContent className="relative min-w-0 p-4">
          <div className="flex min-w-0 items-center justify-between gap-4">
            <div className="flex min-w-0 flex-col">
              <p className="truncate text-lg font-semibold">{team.name}</p>

              <p className="mt-1 truncate text-sm text-muted-foreground">
                {group ? `Group ${group}` : 'Group TBD'} · {getRankingLabel(tournamentTeam)}
              </p>
            </div>

            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TeamCard;
