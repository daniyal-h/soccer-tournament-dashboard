import { Link } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';

import type { TournamentTeam } from '@/types/tournamentTeam';

import { ROUTES } from '@/constants/navigation';

interface TeamCardProps {
  tournamentTeam: TournamentTeam;
}

const TeamCard = ({ tournamentTeam }: TeamCardProps) => {
  return (
    <Link
      to={`/teams/${tournamentTeam.team.id}`}
      state={{ from: ROUTES.TEAMS }}
      style={{ textDecoration: 'none' }}
      className="block min-w-0"
    >
      <Card className="w-full cursor-pointer shadow-sm transition-all hover:bg-accent hover:shadow-md">
        <CardContent className="min-w-0 space-y-3 p-4">
          {tournamentTeam.team.name}
        </CardContent>
      </Card>
    </Link>
  );
};

export default TeamCard;
