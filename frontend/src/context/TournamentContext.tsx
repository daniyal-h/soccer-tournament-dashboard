import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface TournamentContextValue {
  selectedTournamentId: string;
  setSelectedTournamentId: (tournamentId: string) => void;
}

const DEFAULT_TOURNAMENT_ID = 'world-cup-2026';

const TournamentContext = createContext<TournamentContextValue | undefined>(undefined);

interface TournamentProviderProps {
  children: ReactNode;
}

export const TournamentProvider = ({ children }: TournamentProviderProps) => {
  const [selectedTournamentId, setSelectedTournamentId] = useState(() => {
    return localStorage.getItem('selectedTournamentId') ?? DEFAULT_TOURNAMENT_ID;
  });

  useEffect(() => {
    localStorage.setItem('selectedTournamentId', selectedTournamentId);
  }, [selectedTournamentId]);

  const value = useMemo(
    () => ({
      selectedTournamentId,
      setSelectedTournamentId,
    }),
    [selectedTournamentId, setSelectedTournamentId],
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
