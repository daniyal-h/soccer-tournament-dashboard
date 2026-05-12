import { useTournament } from "@/context/TournamentContext";

const Standings = () => {
  const { selectedTournamentId } = useTournament();

  return (
    <section className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">Standings</h1>

      <p className="text-muted-foreground">
        View standings for {selectedTournamentId}.
      </p>
    </section>
  );
};

export default Standings;