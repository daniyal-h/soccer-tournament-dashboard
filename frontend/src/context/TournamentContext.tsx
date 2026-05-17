import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_TOURNAMENT_ID } from '@/constants/tournaments';
import { type Tournament } from '@/types/tournament';
import { useTournaments } from '@/hooks/useTournaments';

interface TournamentContextValue {
  tournaments: Tournament[];
  selectedTournamentId: number;
  selectedTournament: Tournament | null;
  setSelectedTournamentId: (tournamentId: number) => void;
  isLoading: boolean;
  error: Error | null;
}

const TournamentContext = createContext<TournamentContextValue | undefined>(undefined);

interface TournamentProviderProps {
  children: ReactNode;
}

export const TournamentProvider = ({ children }: TournamentProviderProps) => {
  const { tournaments, isLoading, error } = useTournaments();

  // get the stored ID as a number
  const [selectedTournamentId, setSelectedTournamentId] = useState<number>(() => {
    const storedTournamentId = localStorage.getItem('selectedTournamentId');

    return storedTournamentId ? Number(storedTournamentId) : DEFAULT_TOURNAMENT_ID;
  });

  useEffect(() => {
    localStorage.setItem('selectedTournamentId', String(selectedTournamentId));
  }, [selectedTournamentId]);

  const selectedTournament = useMemo(() => {
    return tournaments.find((tournament) => tournament.id === selectedTournamentId) ?? null;
  }, [tournaments, selectedTournamentId]);

  const value = useMemo(
    () => ({
      tournaments,
      selectedTournamentId,
      selectedTournament,
      setSelectedTournamentId,
      isLoading,
      error,
    }),
    [tournaments, selectedTournamentId, selectedTournament, isLoading, error],
  );

  return <TournamentContext.Provider value={value}>{children}</TournamentContext.Provider>;
};

export const useTournament = () => {
  const context = useContext(TournamentContext);

  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }

  return context;
};
