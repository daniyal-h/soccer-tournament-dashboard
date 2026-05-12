import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '../ui/combobox';

const tournaments = ['FIFA World Cup 2026', 'UEFA Champions League', 'Copa America'];

const TournamentSelector = () => {
  return (
    <div className="w-full md:w-55 lg:w-75">
      <Combobox items={tournaments}>
        <ComboboxInput placeholder="Select a tournament" />
        <ComboboxContent>
          <ComboboxEmpty>No tournament found</ComboboxEmpty>
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
