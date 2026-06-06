import type { Standing } from '@/types/standing';

import GroupCard from './GroupCard';

interface GroupGridProps {
  standings: Record<string, Standing[]>;
}

/** A grid of 1-2 cards per row depending on screen size */
const GroupGrid = ({ standings }: GroupGridProps) => {
  return (
    <div className="min-h-screen p-6">
      <div className="grid grid-cols-1 gap-4 min-[960px]:grid-cols-2">
        {Object.entries(standings).map(([group, rows]) => (
          <GroupCard key={group} group={group} rows={rows} />
        ))}
      </div>
    </div>
  );
};

export default GroupGrid;
