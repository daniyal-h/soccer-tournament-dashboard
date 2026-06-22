import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { CategoryType, RankedPlayer } from '@/types/playerLeaderboard';

import { CATEGORY_CONTENT } from '@/constants/playerLeaderboards';

import PlayerLeaderboardList from './PlayerLeaderboardList';

vi.mock('./PlayerLeaderboardCard', () => ({
  default: ({ player, valueLabel }: { player: RankedPlayer; valueLabel: string }) => (
    <article data-testid="leaderboard-card">
      <span data-testid="card-key-player">{player.player.display_name}</span>
      <span data-testid="card-rank">{player.rank}</span>
      <span data-testid="card-value">{player.value}</span>
      <span data-testid="card-value-label">{valueLabel}</span>
    </article>
  ),
}));

function makePlayer(overrides: Partial<RankedPlayer> = {}): RankedPlayer {
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

describe('PlayerLeaderboardList', () => {
  it('renders one card for each player', () => {
    const players = [
      makePlayer({
        rank: 1,
        player: {
          id: 1539,
          display_name: 'Kylian Mbappé',
          photo_url: null,
        },
      }),
      makePlayer({
        rank: 2,
        value: 7,
        player: {
          id: 278,
          display_name: 'L. Messi',
          photo_url: null,
        },
      }),
    ];

    render(<PlayerLeaderboardList players={players} category="goals" />);

    expect(screen.getAllByTestId('leaderboard-card')).toHaveLength(2);
    expect(screen.getByText('Kylian Mbappé')).toBeInTheDocument();
    expect(screen.getByText('L. Messi')).toBeInTheDocument();
  });

  it.each([
    ['goals', CATEGORY_CONTENT.goals.valueLabel],
    ['assists', CATEGORY_CONTENT.assists.valueLabel],
    ['yellow_cards', CATEGORY_CONTENT.yellow_cards.valueLabel],
  ] as const)(
    'passes the %s value label to every card',
    (category: CategoryType, valueLabel: string) => {
      const players = [
        makePlayer({ rank: 1, value: 8 }),
        makePlayer({
          rank: 2,
          value: 7,
          player: {
            id: 278,
            display_name: 'L. Messi',
            photo_url: null,
          },
        }),
      ];

      render(<PlayerLeaderboardList players={players} category={category} />);

      expect(screen.getAllByTestId('card-value-label')).toHaveLength(2);

      screen.getAllByTestId('card-value-label').forEach((label) => {
        expect(label).toHaveTextContent(valueLabel);
      });
    },
  );

  it('preserves player rank and value when passing data to cards', () => {
    const players = [
      makePlayer({ rank: 1, value: 8 }),
      makePlayer({
        rank: 2,
        value: 7,
        player: {
          id: 278,
          display_name: 'L. Messi',
          photo_url: null,
        },
      }),
    ];

    render(<PlayerLeaderboardList players={players} category="goals" />);

    expect(screen.getAllByTestId('card-rank').map((item) => item.textContent)).toEqual(['1', '2']);
    expect(screen.getAllByTestId('card-value').map((item) => item.textContent)).toEqual(['8', '7']);
  });

  it('renders an empty grid when players list is empty', () => {
    render(<PlayerLeaderboardList players={[]} category="goals" />);

    expect(screen.queryByTestId('leaderboard-card')).not.toBeInTheDocument();
  });

  it('uses the responsive two-column grid classes', () => {
    const { container } = render(
      <PlayerLeaderboardList players={[makePlayer()]} category="goals" />,
    );

    const grid = container.querySelector('.grid');

    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('gap-4');
    expect(grid).toHaveClass('min-[900px]:grid-cols-2');
  });

  it('renders players with the same id in different categories without dropping cards', () => {
    const players = [
      makePlayer({
        rank: 1,
        value: 8,
        player: {
          id: 1539,
          display_name: 'Kylian Mbappé',
          photo_url: null,
        },
      }),
      makePlayer({
        rank: 2,
        value: 5,
        player: {
          id: 1539,
          display_name: 'Kylian Mbappé',
          photo_url: null,
        },
      }),
    ];

    render(<PlayerLeaderboardList players={players} category="assists" />);

    expect(screen.getAllByTestId('leaderboard-card')).toHaveLength(2);
    expect(screen.getAllByText('Kylian Mbappé')).toHaveLength(2);
  });
});
