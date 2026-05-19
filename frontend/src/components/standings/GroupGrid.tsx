import type { Standing } from '@/types/standings';
import GroupCard from './GroupCard';

interface GroupGridProps {
  standings: Record<string, Standing[]>;
}

const GroupGrid = ({ standings }: GroupGridProps) => {
  return (
    <div className="min-h-screen p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(standings).map(([group, rows]) => (
          <GroupCard key={group} group={group} rows={rows} />
        ))}
      </div>
    </div>
  );
};

export default GroupGrid;
