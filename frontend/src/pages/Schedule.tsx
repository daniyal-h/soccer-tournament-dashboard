import { useTournament } from '@/context/TournamentContext';

const Schedule = () => {
  const { selectedTournament } = useTournament();

  return (
    <section className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>

      <p className="text-muted-foreground">
        View upcoming and completed tournament matches for the{' '}
        {selectedTournament?.name ?? 'the selected tournament'}.
      </p>
    </section>
  );
};

export default Schedule;
