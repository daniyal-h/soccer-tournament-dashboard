import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as tournamentContext from '@/context/TournamentContext';

import TournamentSelector from './TournamentSelector';

const mockSetSelectedTournamentId = vi.fn();
let latestOnValueChange: ((value: string) => void) | undefined;

vi.mock('@/components/ui/combobox', () => ({
  Combobox: ({
    items,
    value,
    onValueChange,
    children,
  }: {
    items: string[];
    value: string;
    onValueChange: (value: string) => void;
    children: ReactNode;
  }) => {
    latestOnValueChange = onValueChange;

    return (
      <div>
        <div data-testid="combobox-value">{value}</div>
        <div data-testid="combobox-items">{items.join('|')}</div>
        {children}
      </div>
    );
  },
  ComboboxInput: ({ placeholder }: { placeholder: string }) => <input placeholder={placeholder} />,
  ComboboxContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  ComboboxEmpty: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  ComboboxList: ({ children }: { children: (item: string) => ReactNode }) => (
    <div>{['FIFA World Cup 2026', 'Champions League 2025/26'].map((item) => children(item))}</div>
  ),
  ComboboxItem: ({ value, children }: { value: string; children: ReactNode }) => (
    <button type="button" onClick={() => latestOnValueChange?.(value)}>
      {children}
    </button>
  ),
}));

const tournaments = [
  {
    id: 1,
    name: 'FIFA World Cup',
    season: '2026',
    logo_url: null,
    start_date: '2026-06-11',
    end_date: '2026-07-19',
  },
  {
    id: 2,
    name: 'Champions League',
    season: '2025',
    logo_url: null,
    start_date: '2025-09-01',
    end_date: '2026-05-31',
  },
];

function mockTournamentContext(overrides = {}) {
  vi.spyOn(tournamentContext, 'useTournament').mockReturnValue({
    tournaments,
    selectedTournamentId: 1,
    selectedTournament: tournaments[0],
    setSelectedTournamentId: mockSetSelectedTournamentId,
    isLoading: false,
    error: null,
    ...overrides,
  });
}

describe('TournamentSelector', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockSetSelectedTournamentId.mockClear();
    latestOnValueChange = undefined;
  });

  it('renders loading state', () => {
    mockTournamentContext({
      tournaments: [],
      selectedTournament: null,
      isLoading: true,
    });

    render(<TournamentSelector />);

    expect(screen.getByText(/loading tournaments/i)).toBeInTheDocument();
  });

  it('renders loading state when selected tournament label cannot be resolved', () => {
    mockTournamentContext({
      selectedTournament: {
        ...tournaments[0],
        id: 999,
      },
    });

    render(<TournamentSelector />);

    expect(screen.getByText(/loading tournaments/i)).toBeInTheDocument();
  });

  it('renders error state before loading state', () => {
    mockTournamentContext({
      tournaments: [],
      selectedTournament: null,
      isLoading: true,
      error: new Error('No tournaments available'),
    });

    render(<TournamentSelector />);

    expect(screen.getByText('No tournaments available')).toBeInTheDocument();
    expect(screen.queryByText(/loading tournaments/i)).not.toBeInTheDocument();
  });

  it('renders selected tournament label', () => {
    mockTournamentContext();

    render(<TournamentSelector />);

    expect(screen.getByTestId('combobox-value')).toHaveTextContent('FIFA World Cup 2026');
  });

  it('formats split-year tournament seasons', () => {
    mockTournamentContext({
      selectedTournament: tournaments[1],
    });

    render(<TournamentSelector />);

    expect(screen.getByTestId('combobox-value')).toHaveTextContent('Champions League 2025/26');
  });

  it('passes all tournament options to the combobox', () => {
    mockTournamentContext();

    render(<TournamentSelector />);

    expect(screen.getByTestId('combobox-items')).toHaveTextContent('FIFA World Cup 2026');
    expect(screen.getByTestId('combobox-items')).toHaveTextContent('Champions League 2025/26');
  });

  it('updates selected tournament when a valid option is selected', async () => {
    const user = userEvent.setup();

    mockTournamentContext();

    render(<TournamentSelector />);

    await user.click(screen.getByRole('button', { name: 'Champions League 2025/26' }));

    expect(mockSetSelectedTournamentId).toHaveBeenCalledWith(2);
  });

  it('does not update selected tournament when value is empty', () => {
    mockTournamentContext();

    render(<TournamentSelector />);

    latestOnValueChange?.('');

    expect(mockSetSelectedTournamentId).not.toHaveBeenCalled();
  });

  it('does not update selected tournament when value does not match an option', () => {
    mockTournamentContext();

    render(<TournamentSelector />);

    latestOnValueChange?.('Fake Tournament 2030');

    expect(mockSetSelectedTournamentId).not.toHaveBeenCalled();
  });

  it('updates tournament options when tournaments change', () => {
    const firstContext = {
      tournaments: [tournaments[0]],
      selectedTournamentId: 1,
      selectedTournament: tournaments[0],
      setSelectedTournamentId: mockSetSelectedTournamentId,
      isLoading: false,
      error: null,
    };

    const secondContext = {
      ...firstContext,
      tournaments,
    };

    const useTournamentSpy = vi
      .spyOn(tournamentContext, 'useTournament')
      .mockReturnValueOnce(firstContext)
      .mockReturnValueOnce(secondContext);

    const { rerender } = render(<TournamentSelector />);

    expect(screen.getByTestId('combobox-items')).toHaveTextContent('FIFA World Cup 2026');
    expect(screen.getByTestId('combobox-items')).not.toHaveTextContent('Champions League 2025/26');

    rerender(<TournamentSelector />);

    expect(useTournamentSpy).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('combobox-items')).toHaveTextContent('Champions League 2025/26');
  });

  it('ignores empty selection values', () => {
    mockTournamentContext();

    render(<TournamentSelector />);

    act(() => {
      latestOnValueChange?.('');
    });

    expect(mockSetSelectedTournamentId).not.toHaveBeenCalled();
  });

  it('ignores empty selection values', () => {
    mockTournamentContext();

    render(<TournamentSelector />);

    act(() => {
      latestOnValueChange?.('');
    });

    expect(mockSetSelectedTournamentId).not.toHaveBeenCalled();
  });

  it('returns early when selected combobox value does not match a tournament label', () => {
    mockTournamentContext();

    render(<TournamentSelector />);

    act(() => {
      latestOnValueChange?.('Fake Tournament 2030');
    });

    expect(mockSetSelectedTournamentId).not.toHaveBeenCalled();
  });
});
