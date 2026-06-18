import { useState } from 'react';
import { Calendar, ChevronDown, Flag, Ruler } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

import type { TeamMember } from '@/types/team';

import { cn } from '@/lib/utils';

import { getAge, getInitials } from '@/utils/teams/teamSquadHelper';

interface SquadMemberCardProps {
  member: TeamMember;
}

const SquadMemberCard = ({ member }: SquadMemberCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const playerSummary = member.player;
  const fullName = [playerSummary.first_name, playerSummary.last_name].filter(Boolean).join(' ');

  const hasDetails =
    fullName || playerSummary.nationality || playerSummary.height || playerSummary.date_of_birth;

  return (
    <Card className="bg-background/70 shadow-none hover:bg-background hover:shadow-sm active:bg-background">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="w-full p-4 text-left cursor-pointer"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarImage
              src={playerSummary.photo_url ?? undefined}
              alt={playerSummary.display_name}
            />
            <AvatarFallback>{getInitials(playerSummary.display_name)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {member.squad_number && (
                <span className="text-sm text-muted-foreground">#{member.squad_number}</span>
              )}

              <p className="truncate font-semibold">{playerSummary.display_name}</p>
            </div>

            {member.position && <p className="text-sm text-muted-foreground">{member.position}</p>}
          </div>

          {hasDetails && (
            <ChevronDown
              className={cn('size-4 shrink-0 transition-transform', expanded && 'rotate-180')}
            />
          )}
        </div>

        {expanded && hasDetails && (
          <div className="mt-4 space-y-2 border-t pt-3 text-sm text-muted-foreground">
            {fullName && fullName !== playerSummary.display_name && <p>{fullName}</p>}

            {playerSummary.nationality && (
              <div className="flex items-center gap-2">
                <Flag className="size-4" />
                {playerSummary.nationality}
              </div>
            )}

            {playerSummary.height && (
              <div className="flex items-center gap-2">
                <Ruler className="size-4" />
                {playerSummary.height} cm
              </div>
            )}

            {playerSummary.date_of_birth && (
              <div className="flex items-center gap-2">
                <Calendar className="size-4" />
                {getAge(playerSummary.date_of_birth)} years old
              </div>
            )}
          </div>
        )}
      </button>
    </Card>
  );
};

export default SquadMemberCard;
