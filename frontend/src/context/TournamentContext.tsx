import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { useTournaments } from '@/hooks/useTournaments';

import { type Tournament } from '@/types/tournament';

import { DEFAULT_TOURNAMENT_ID } from '@/constants/tournaments';

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
    return (
      tournaments.find((tournament) => tournament.id === selectedTournamentId) ??
      tournaments[0] ??
      null
    );
  }, [tournaments, selectedTournamentId]);

  useEffect(() => {
    if (selectedTournament && selectedTournament.id !== selectedTournamentId) {
      localStorage.setItem('selectedTournamentId', String(selectedTournament.id));
    }
  }, [selectedTournament, selectedTournamentId]);

  const value = useMemo(
    () => ({
      tournaments,
      selectedTournamentId: selectedTournament?.id ?? DEFAULT_TOURNAMENT_ID,
      selectedTournament,
      setSelectedTournamentId,
      isLoading,
      error,
    }),
    [tournaments, selectedTournament, isLoading, error],
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
