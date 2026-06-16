import type { TeamPageProps } from '@/types/team';

import TeamJourneySection from './TeamJourneySection';
import TeamOverviewSection from './TeamOverviewSection';

const TeamProfileContent = ({ teamId }: TeamPageProps) => {
  return (
    <div className="flex flex-col gap-6">
      <TeamOverviewSection teamId={teamId} />

      <TeamJourneySection teamId={teamId} />
    </div>
  );
};

export default TeamProfileContent;
