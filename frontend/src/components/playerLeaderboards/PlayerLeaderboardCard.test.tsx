import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { RankedPlayer } from '@/types/playerLeaderboard';

import PlayerLeaderboardCard from './PlayerLeaderboardCard';

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="avatar" className={className}>
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt }: { src?: string; alt?: string }) => (
    <img data-testid="avatar-image" src={src} alt={alt} />
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="avatar-fallback">{children}</span>
  ),
}));

vi.mock('@/constants/tournamentTeams', () => ({
  RANK_CARD_STYLES: {
    1: 'gold-rank',
    2: 'silver-rank',
    3: 'bronze-rank',
  },
}));

vi.mock('@/utils/playerLeaderboards/playerLeaderboardsHelper', () => ({
  formatMinutes: vi.fn((minutes: number | null) => {
    if (minutes === null) {
      return null;
    }

    return `${minutes} min`;
  }),
  formatRating: vi.fn((rating: number | null) => {
    if (rating === null) {
      return null;
    }

    return rating.toFixed(2);
  }),
}));

vi.mock('@/utils/teams/teamSquadHelper', () => ({
  getInitials: vi.fn((name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase(),
  ),
}));

function makeRankedPlayer(overrides: Partial<RankedPlayer> = {}): RankedPlayer {
  return {
    rank: 1,
    value: 8,
    player: {
      id: 1539,
      display_name: 'Kylian Mbappé',
      photo_url: 'https://example.com/mbappe.png',
    },
    team: {
      id: 2,
      name: 'France',
      short_name: 'FRA',
      logo_url: 'https://example.com/france.png',
    },
    appearances: 7,
    minutes_played: 597,
    rating: 7.61,
    ...overrides,
  };
}

describe('PlayerLeaderboardCard', () => {
  it('renders rank, player name, team, value, and value label', () => {
    render(<PlayerLeaderboardCard player={makeRankedPlayer()} valueLabel="Goals" />);

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Kylian Mbappé' })).toBeInTheDocument();
    expect(screen.getByText('France · FRA')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('Goals')).toBeInTheDocument();
  });

  it('renders player photo with player name as alt text', () => {
    render(<PlayerLeaderboardCard player={makeRankedPlayer()} valueLabel="Goals" />);

    const image = screen.getByTestId('avatar-image');

    expect(image).toHaveAttribute('src', 'https://example.com/mbappe.png');
    expect(image).toHaveAttribute('alt', 'Kylian Mbappé');
  });

  it('uses undefined image src when photo url is null and still renders fallback initials', () => {
    render(
      <PlayerLeaderboardCard
        player={makeRankedPlayer({
          player: {
            id: 1539,
            display_name: 'Kylian Mbappé',
            photo_url: null,
          },
        })}
        valueLabel="Goals"
      />,
    );

    expect(screen.getByTestId('avatar-image')).not.toHaveAttribute('src');
    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('KM');
  });

  it('renders metadata when appearances, minutes, and rating are available', () => {
    render(<PlayerLeaderboardCard player={makeRankedPlayer()} valueLabel="Goals" />);

    expect(screen.getByText('7 matches ·')).toBeInTheDocument();
    expect(screen.getByText('597 min ·')).toBeInTheDocument();
    expect(screen.getByText('Rating 7.61')).toBeInTheDocument();
  });

  it('does not render nullable metadata values when they are null', () => {
    render(
      <PlayerLeaderboardCard
        player={makeRankedPlayer({
          appearances: null,
          minutes_played: null,
          rating: null,
        })}
        valueLabel="Goals"
      />,
    );

    expect(screen.queryByText(/matches/)).not.toBeInTheDocument();
    expect(screen.queryByText(/min/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Rating/)).not.toBeInTheDocument();
  });

  it.each([
    [0, '0 match ·'],
    [1, '1 match ·'],
    [2, '2 matches ·'],
  ])('renders the correct appearance suffix for %s appearances', (appearances, expectedText) => {
    render(
      <PlayerLeaderboardCard
        player={makeRankedPlayer({
          appearances,
          minutes_played: null,
          rating: null,
        })}
        valueLabel="Goals"
      />,
    );

    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });

  it('does not render a short name separator when team short name is empty', () => {
    render(
      <PlayerLeaderboardCard
        player={makeRankedPlayer({
          team: {
            id: 2,
            name: 'France',
            short_name: '',
            logo_url: 'https://example.com/france.png',
          },
        })}
        valueLabel="Goals"
      />,
    );

    expect(screen.getByText('France')).toBeInTheDocument();
    expect(screen.queryByText('France ·')).not.toBeInTheDocument();
  });

  it.each([
    [1, 'gold-rank'],
    [2, 'silver-rank'],
    [3, 'bronze-rank'],
  ])('applies top rank styling for rank %s', (rank, expectedClass) => {
    const { container } = render(
      <PlayerLeaderboardCard player={makeRankedPlayer({ rank })} valueLabel="Goals" />,
    );

    expect(container.querySelector('article')).toHaveClass(expectedClass);
  });

  it('does not apply top rank styling outside the top three', () => {
    const { container } = render(
      <PlayerLeaderboardCard player={makeRankedPlayer({ rank: 4 })} valueLabel="Goals" />,
    );

    const card = container.querySelector('article');

    expect(card).not.toHaveClass('gold-rank');
    expect(card).not.toHaveClass('silver-rank');
    expect(card).not.toHaveClass('bronze-rank');
  });

  it('applies the base card layout and surface classes', () => {
    const { container } = render(
      <PlayerLeaderboardCard player={makeRankedPlayer()} valueLabel="Goals" />,
    );

    expect(container.querySelector('article')).toHaveClass(
      'flex',
      'min-w-0',
      'items-center',
      'gap-4',
      'rounded-xl',
      'border',
      'bg-card',
      'p-4',
      'shadow-sm',
      'transition-colors',
    );
  });

  it('passes minutes and rating through formatter helpers', async () => {
    const helpers = await import('@/utils/playerLeaderboards/playerLeaderboardsHelper');

    render(
      <PlayerLeaderboardCard
        player={makeRankedPlayer({
          minutes_played: 123,
          rating: 8.456,
        })}
        valueLabel="Goals"
      />,
    );

    expect(helpers.formatMinutes).toHaveBeenCalledWith(123);
    expect(helpers.formatRating).toHaveBeenCalledWith(8.456);
    expect(screen.getByText('123 min ·')).toBeInTheDocument();
    expect(screen.getByText('Rating 8.46')).toBeInTheDocument();
  });
});
