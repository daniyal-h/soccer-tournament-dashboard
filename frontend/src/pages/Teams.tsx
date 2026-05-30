import { useTournament } from '@/context/TournamentContext';

const Teams = () => {
  const { selectedTournament } = useTournament();

  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-bold tracking-tight">Teams (coming soon!)</h1>

      <p className="text-muted-foreground">
        View the teams in {selectedTournament?.name ?? 'the selected tournament'}.
      </p>
    </section>
  );
};

export default Teams;
