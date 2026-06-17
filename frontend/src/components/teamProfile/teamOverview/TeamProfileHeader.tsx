import { Card } from '@/components/ui/card';

import type { TeamProfile } from '@/types/team';

interface TeamProfileHeaderProps {
  teamProfile: TeamProfile;
}

const TeamProfileHeader = ({ teamProfile }: TeamProfileHeaderProps) => {
  const { team, group } = teamProfile;

  return (
    <Card className="mb-10 p-6 text-center shadow-sm">
      <div className="flex flex-col items-center gap-4">
        {team.logo_url && (
          <img
            src={team.logo_url}
            alt={`${team.name} logo`}
            className="h-20 w-20 object-contain sm:h-24 sm:w-24"
          />
        )}

        <div className="min-w-0 max-w-full">
          <h1 className="truncate text-3xl font-black sm:text-5xl">{team.name}</h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground sm:text-base">
            {team.short_name}
          </p>
        </div>

        <div className="rounded-full border px-4 py-1 text-sm font-semibold">Group {group}</div>
      </div>
    </Card>
  );
};

export default TeamProfileHeader;
