import { useTournament } from '@/context/TournamentContext';
import { getTournamentById } from '@/constants/tournaments';

const Teams = () => {
  const { selectedTournamentId } = useTournament();

  const selectedTournament = getTournamentById(selectedTournamentId);

  return (
    <section className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">Teams</h1>

      <p className="text-muted-foreground">
        View the teams in {selectedTournament?.label ?? 'the selected tournament'}.
      </p>
    </section>
  );
};

export default Teams;