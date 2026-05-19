import GroupCard from "./GroupCard";
import { stubStandings } from "@/constants/standings";

const GroupGrid = () => {
  return (
    <div className="min-h-screen bg-muted/40 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(stubStandings).map(([group, rows]) => (
          <GroupCard key={group} group={group} rows={rows} />
        ))}
      </div>
    </div>
  );
};

export default GroupGrid;