import { useTournament } from '@/context/TournamentContext';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { useMemo } from 'react';

const TournamentSelector = () => {
  const { tournaments, selectedTournament, setSelectedTournamentId, isLoading, error } =
    useTournament();

  // adapt API response of a list of Tournaments to a map
  const tournamentOptions = useMemo(() => {
    return tournaments.map((tournament) => `${tournament.name} ${tournament.season}`);
  }, [tournaments]);

  // use the adapted map to get the label of the selected tournament
  const selectedTournamentLabel = selectedTournament
    ? `${selectedTournament.name} ${selectedTournament.season}`
    : undefined;

  if (isLoading || selectedTournamentLabel === undefined) {
    return <div className="w-full md:w-55 lg:w-75">Loading tournaments...</div>;
  }

  if (error) {
    return (
      <div className="w-full md:w-55 lg:w-75 text-sm text-muted-foreground">
        Failed to load tournaments
      </div>
    );
  }

  return (
    <div className="w-full md:w-55 lg:w-75">
      <Combobox
        items={tournamentOptions}
        value={selectedTournamentLabel}
        onValueChange={(label) => {
          if (!label) {
            return;
          }

          const tournament = tournaments.find(
            (tournament) => `${tournament.name} ${tournament.season}` === label,
          );

          if (!tournament) {
            return;
          }

          setSelectedTournamentId(tournament.id);
        }}
      >
        <ComboboxInput placeholder="Select a tournament" />

        <ComboboxContent>
          <ComboboxEmpty>No tournaments found.</ComboboxEmpty>

          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
};

export default TournamentSelector;
