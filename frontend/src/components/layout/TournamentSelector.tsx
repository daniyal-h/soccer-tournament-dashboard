import { TOURNAMENTS, getTournamentById, getTournamentByLabel } from '@/constants/tournaments';
import { useTournament } from '@/context/TournamentContext';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';

const TournamentSelector = () => {
  const { tournaments, selectedTournamentId, setSelectedTournamentId, isLoading, error } =
    useTournament();

  if (isLoading) {
    return (
      <div className="w-full md:w-55 lg:w-75">
        <Combobox items={[]} disabled>
          <ComboboxInput placeholder="Loading tournaments..." />
        </Combobox>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full md:w-55 lg:w-75 text-sm text-muted-foreground">
        Failed to load tournaments
      </div>
    );
  }

  const selectedTournament = getTournamentById(selectedTournamentId) ?? TOURNAMENTS[0];

  return (
    <div className="w-full md:w-55 lg:w-75">
      <Combobox
        items={TOURNAMENTS.map((tournament) => tournament.label)}
        value={selectedTournament.label}
        onValueChange={(label) => {
          if (!label) {
            return;
          }

          const tournament = getTournamentByLabel(label);

          if (tournament) {
            setSelectedTournamentId(tournament.id);
          }
        }}
      >
        <ComboboxInput placeholder="Select a tournament" />

        <ComboboxContent>
          <ComboboxEmpty>No tournament found</ComboboxEmpty>

          <ComboboxList>
            {(label) => {
              const tournament = getTournamentByLabel(label);

              if (!tournament) {
                return null;
              }

              return (
                <ComboboxItem key={tournament.id} value={tournament.label}>
                  {tournament.label}
                </ComboboxItem>
              );
            }}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
};

export default TournamentSelector;
