import type { TeamPageProps } from '@/types/team';

import TeamMatchesSection from './TeamMatchesSection';
import TeamOverviewSection from './TeamOverviewSection';

const TeamProfileContent = ({ teamId }: TeamPageProps) => {
  return (
    <div className="flex flex-col gap-6">
      <TeamOverviewSection teamId={teamId} />

      <TeamMatchesSection teamId={teamId} />
    </div>
  );
};

export default TeamProfileContent;
