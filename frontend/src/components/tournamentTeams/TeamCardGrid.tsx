import type { TournamentTeam } from '@/types/tournamentTeam';

import TeamCard from './TeamCard';

interface TeamCardGridProps {
  teams: TournamentTeam[];
}

/** A grid of 1-2 cards per row depending on screen size */
const TeamCardGrid = ({ teams }: TeamCardGridProps) => {
  return (
    <div className="min-h-screen p-6">
      <div className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-2">
        {teams.map((tournamentTeam) => (
          <TeamCard key={tournamentTeam.team.id} tournamentTeam={tournamentTeam} />
        ))}
      </div>
    </div>
  );
};

export default TeamCardGrid;
