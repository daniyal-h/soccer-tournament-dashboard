import { useTournament } from '@/context/TournamentContext';

const Bracket = () => {
  const { selectedTournament } = useTournament();

  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-bold tracking-tight">Bracket (coming soon!)</h1>

      <p className="text-muted-foreground">
        View the bracket for {selectedTournament?.name ?? 'the selected tournament'}.
      </p>
    </section>
  );
};

export default Bracket;
