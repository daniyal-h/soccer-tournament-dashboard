import { useMemo } from 'react';
import { RotateCw } from 'lucide-react';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';

import { useTournament } from '@/context/TournamentContext';

import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';

import { formatSeason } from '@/utils/layout/tournamentSelectorHelper';

/**
 * Render a Combobox for all available tournaments
 * Display API response errors within the same components
 */
const TournamentSelector = () => {
  const {
    tournaments,
    selectedTournament,
    setSelectedTournamentId,
    isLoading,
    error,
    refetch,
    canRetry,
  } = useTournament();

  // adapt API response of a list of Tournaments to a map
  // display seasons across multiple years if they require it
  const tournamentOptions = useMemo(() => {
    return tournaments.map((tournament) => `${tournament.name} ${formatSeason(tournament)}`);
  }, [tournaments]);

  // use the adapted map to get the label of the selected tournament
  const selectedTournamentLabel = selectedTournament
    ? tournamentOptions[tournaments.findIndex((t) => t.id === selectedTournament.id)]
    : undefined;

  if (error) {
    return (
      <div className="flex w-full items-center justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-1 text-sm text-destructive">
        <span className="min-w-0 truncate">{error.message}</span>

        {canRetry && (
          <Button
            type="button"
            onClick={() => void refetch()}
            className="shrink-0 rounded p-1 bg-destructive/50 hover:bg-destructive"
            aria-label="Retry loading tournaments"
          >
            <RotateCw />
          </Button>
        )}
      </div>
    );
  }

  if (isLoading || selectedTournamentLabel === undefined) {
    return (
      <div className="flex w-full items-center justify-between rounded-md border px-3 py-2 bg-accent">
        <span>Loading tournaments...</span>
        <Spinner role="status" aria-label="Loading" />
      </div>
    );
  }

  return (
    <Combobox
      items={tournamentOptions}
      value={selectedTournamentLabel}
      onValueChange={(label) => {
        // Stryker disable next-line ConditionalExpression, BlockStatement: empty label already guarded
        if (!label) {
          return;
        }

        const tournament = tournaments.find(
          (tournament) => `${tournament.name} ${formatSeason(tournament)}` === label,
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
  );
};

export default TournamentSelector;
