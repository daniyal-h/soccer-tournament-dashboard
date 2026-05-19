import { useTournament } from '@/context/TournamentContext';

import GroupGrid from '@/components/standings/GroupGrid';
import Legend from '@/components/standings/Legend';

const Standings = () => {
  const { selectedTournament } = useTournament();

  return (
    <section className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">Standings</h1>

      <p className="text-muted-foreground">
        View standings for {selectedTournament?.name ?? 'the selected tournament'}.
      </p>

      <div className="space-y-4">
        <Legend />
        <GroupGrid />
      </div>
    </section>
  );
};

export default Standings;
