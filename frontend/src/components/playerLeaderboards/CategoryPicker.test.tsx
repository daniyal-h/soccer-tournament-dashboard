import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CategoryType } from '@/types/playerLeaderboard';

import { CATEGORY_CONTENT, LEADERBOARD_CATEGORIES } from '@/constants/playerLeaderboards';

import CategoryPicker from './CategoryPicker';

describe('CategoryPicker', () => {
  let setCategory: ReturnType<typeof vi.fn<(category: CategoryType) => void>>;

  beforeEach(() => {
    setCategory = vi.fn<(category: CategoryType) => void>();
  });

  it('renders all leaderboard categories as tabs with correct labels', () => {
    render(<CategoryPicker category="goals" setCategory={setCategory} />);

    const tabs = screen.getAllByRole('tab');

    expect(tabs).toHaveLength(LEADERBOARD_CATEGORIES.length);

    LEADERBOARD_CATEGORIES.forEach((category) => {
      expect(
        screen.getByRole('tab', {
          name: CATEGORY_CONTENT[category].title,
        }),
      ).toBeInTheDocument();
    });
  });

  it.each(LEADERBOARD_CATEGORIES)(
    'marks %s as selected when it is the controlled category',
    (category) => {
      render(<CategoryPicker category={category} setCategory={setCategory} />);

      expect(
        screen.getByRole('tab', {
          name: CATEGORY_CONTENT[category].title,
        }),
      ).toHaveAttribute('aria-selected', 'true');
    },
  );

  it('calls setCategory with assists when Top Assists is clicked', async () => {
    const user = userEvent.setup();

    render(<CategoryPicker category="goals" setCategory={setCategory} />);

    await user.click(screen.getByRole('tab', { name: 'Top Assists' }));

    expect(setCategory).not.toHaveBeenCalledWith('yellow_cards');
    expect(setCategory).not.toHaveBeenCalledWith('goals');
    expect(setCategory).toHaveBeenLastCalledWith('assists');
  });

  it('calls setCategory with yellow_cards when Yellow Cards is clicked', async () => {
    const user = userEvent.setup();

    render(<CategoryPicker category="goals" setCategory={setCategory} />);

    await user.click(screen.getByRole('tab', { name: 'Yellow Cards' }));

    expect(setCategory).toHaveBeenLastCalledWith('yellow_cards');
    expect(setCategory).not.toHaveBeenCalledWith('goals');
    expect(setCategory).not.toHaveBeenCalledWith('assists');
  });

  it('does not call setCategory just from rendering', () => {
    render(<CategoryPicker category="goals" setCategory={setCategory} />);

    expect(setCategory).not.toHaveBeenCalled();
  });

  it('keeps the selected tab controlled by the category prop', () => {
    const { rerender } = render(<CategoryPicker category="goals" setCategory={setCategory} />);

    expect(screen.getByRole('tab', { name: 'Top Scorers' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    rerender(<CategoryPicker category="yellow_cards" setCategory={setCategory} />);

    expect(screen.getByRole('tab', { name: 'Yellow Cards' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('calls setCategory when clicking non-selected categories', async () => {
    const user = userEvent.setup();

    render(<CategoryPicker category="goals" setCategory={setCategory} />);

    for (const category of LEADERBOARD_CATEGORIES.filter((item) => item !== 'goals')) {
      await user.click(
        screen.getByRole('tab', {
          name: CATEGORY_CONTENT[category].title,
        }),
      );

      expect(setCategory).toHaveBeenLastCalledWith(category);
    }

    expect(setCategory).not.toHaveBeenCalledWith('goals');
  });
});
