import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useTournaments } from '@/hooks/useTournaments';

import type { Tournament } from '@/types/tournament';

import { DEFAULT_TOURNAMENT_ID } from '@/constants/tournaments';

type TournamentContextType = {
  tournaments: Tournament[];
  selectedTournamentId: number;
  selectedTournament: Tournament | null;
  setSelectedTournamentId: Dispatch<SetStateAction<number>>;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  canRetry: boolean;
};

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

type TournamentProviderProps = {
  children: ReactNode;
};

export const TournamentProvider = ({ children }: TournamentProviderProps) => {
  const { tournaments, isLoading, error, refetch, canRetry } = useTournaments();

  // initialize selected tournament from localStorage
  // fallback to default if value is missing or invalid
  const [selectedTournamentId, setSelectedTournamentId] = useState<number>(() => {
    const storedTournamentId = localStorage.getItem('selectedTournamentId');

    if (!storedTournamentId) {
      return DEFAULT_TOURNAMENT_ID;
    }

    const parsedTournamentId = Number(storedTournamentId);

    return Number.isInteger(parsedTournamentId) && parsedTournamentId > 0
      ? parsedTournamentId
      : DEFAULT_TOURNAMENT_ID;
  });

  // persist selected tournament whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedTournamentId', String(selectedTournamentId));
  }, [selectedTournamentId]);

  // after tournaments finish loading, validate that the stored ID exists
  // if someone manually edited localStorage to an invalid ID,
  // reset back to the default tournament
  useEffect(() => {
    if (isLoading || tournaments.length === 0) {
      return;
    }

    const hasValidTournament = tournaments.some(
      (tournament) => tournament.id === selectedTournamentId,
    );

    if (!hasValidTournament) {
      localStorage.setItem('selectedTournamentId', String(DEFAULT_TOURNAMENT_ID));

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedTournamentId(DEFAULT_TOURNAMENT_ID);
    }
  }, [isLoading, tournaments, selectedTournamentId]);

  // derive the selected tournament object from the selected ID
  // return null if tournaments have not loaded yet
  const selectedTournament = useMemo(() => {
    return tournaments.find((tournament) => tournament.id === selectedTournamentId) ?? null;
  }, [tournaments, selectedTournamentId]);

  // memoize context value to avoid unnecessary rerenders
  const value = useMemo(
    () => ({
      tournaments,
      selectedTournamentId,
      selectedTournament,
      setSelectedTournamentId,
      isLoading,
      error,
      refetch,
      canRetry,
    }),
    [tournaments, selectedTournamentId, selectedTournament, isLoading, error, refetch, canRetry],
  );

  return <TournamentContext.Provider value={value}>{children}</TournamentContext.Provider>;
};

export const useTournament = () => {
  const context = useContext(TournamentContext);

  if (!context) {
    throw new Error('useTournamentContext must be used within TournamentProvider');
  }

  return context;
};
