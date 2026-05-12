import { useTournament } from '@/context/TournamentContext';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';

import { TOURNAMENTS } from '@/constants/tournaments';

const TournamentSelector = () => {
  const { selectedTournamentId, setSelectedTournamentId } = useTournament();

  const selectedTournament =
    TOURNAMENTS.find((tournament) => tournament.id === selectedTournamentId) ?? TOURNAMENTS[0];

  return (
    <div className="w-full md:w-55 lg:w-75">
      <Combobox
        items={TOURNAMENTS.map((tournament) => tournament.label)}
        value={selectedTournament.label}
        onValueChange={(label) => {
          if (!label) {
            return;
          }

          const tournament = TOURNAMENTS.find((item) => item.label === label);

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
              const tournament = TOURNAMENTS.find((item) => item.label === label);

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
