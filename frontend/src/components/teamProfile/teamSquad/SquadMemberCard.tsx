import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

import type { TeamMember } from '@/types/team';

import { getAge, getInitials } from '@/utils/teams/teamSquadHelper';

interface SquadMemberCardProps {
  member: TeamMember;
}

const SquadMemberCard = ({ member }: SquadMemberCardProps) => {
  const playerSummary = member.player;
  const fullName = [playerSummary.first_name, playerSummary.last_name].filter(Boolean).join(' ');

  return (
    <Card className="bg-background/70 shadow-none">
      <div className="flex items-center gap-4 p-4">
        <Avatar className="size-14 shrink-0">
          <AvatarImage
            src={playerSummary.photo_url ?? undefined}
            alt={playerSummary.display_name}
          />
          <AvatarFallback>{getInitials(playerSummary.display_name)}</AvatarFallback>
        </Avatar>

        {/* Left: name + position */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {member.squad_number && (
              <span className="shrink-0 text-sm text-muted-foreground">#{member.squad_number}</span>
            )}
            <p className="truncate font-semibold">{playerSummary.display_name}</p>
          </div>
          {member.position && (
            <p data-testid="player-position" className="text-sm text-muted-foreground">
              {member.position}
            </p>
          )}
          {fullName && fullName !== playerSummary.display_name && (
            <p className="truncate text-xs text-muted-foreground">{fullName}</p>
          )}
        </div>

        {/* Right: details */}
        <div className="max-[380px]:hidden shrink-0 space-y-1 text-right text-xs text-muted-foreground">
          {playerSummary.nationality && (
            <p data-testid="player-nationality" className="max-w-20 truncate">{playerSummary.nationality}</p>
          )}
          {playerSummary.height && <p>{playerSummary.height} cm</p>}
          {playerSummary.date_of_birth && <p>{getAge(playerSummary.date_of_birth)} yrs</p>}
        </div>
      </div>
    </Card>
  );
};
export default SquadMemberCard;
