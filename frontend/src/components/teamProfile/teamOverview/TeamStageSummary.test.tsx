import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { StandingStats } from '@/types/standing';

import { TOTAL_GROUP_MATCHES_COUNT } from '@/constants/teams';

import TeamStageSummary from './TeamStageSummary';

const standing: StandingStats = {
  position: 2,
  matches_played: 1,
  wins: 1,
  draws: 0,
  losses: 0,
  goals_for: 3,
  goals_against: 1,
  goal_difference: 2,
  points: 3,
};

function renderSummary(overrides: Partial<StandingStats> = {}) {
  return render(<TeamStageSummary standing={{ ...standing, ...overrides }} />);
}

describe('TeamStageSummary', () => {
  it('renders the section title', () => {
    renderSummary();

    expect(screen.getByText('Group Stage Summary')).toBeInTheDocument();
  });

  it('renders the main standing statistics', () => {
    renderSummary();

    const positionCard = screen.getByText('Position').parentElement;
    expect(positionCard).toHaveTextContent('2');

    const pointsCard = screen.getByText('Position').parentElement;
    expect(pointsCard).toHaveTextContent('2');

    expect(screen.getByText('Played')).toBeInTheDocument();
    expect(screen.getByText(`1 / ${TOTAL_GROUP_MATCHES_COUNT}`)).toBeInTheDocument();
  });

  it('renders win draw loss record from the team perspective', () => {
    renderSummary({
      wins: 3,
      draws: 2,
      losses: 1,
    });

    expect(screen.getByText('Record')).toBeInTheDocument();
    expect(screen.getByText('3-2-1')).toBeInTheDocument();
  });

  it('renders goal statistics', () => {
    renderSummary({
      goals_for: 10,
      goals_against: 4,
    });

    expect(screen.getByText('Goals For')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    expect(screen.getByText('Goals Against')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('adds a plus sign for positive goal difference', () => {
    renderSummary({
      goal_difference: 5,
    });

    expect(screen.getByText('+5')).toBeInTheDocument();
  });

  it.each([0, -3])('does not add a plus sign for goal difference %s', (goalDifference) => {
    renderSummary({
      goal_difference: goalDifference,
    });

    expect(screen.getByText(goalDifference.toString())).toBeInTheDocument();
    expect(screen.queryByText(`+${goalDifference}`)).not.toBeInTheDocument();
  });

  it.each([1, 2])('highlights position %s as a qualification position', (position) => {
    renderSummary({ position });

    const positionCard = screen.getByText('Position').parentElement;

    expect(positionCard).toHaveClass('bg-green-100');
    expect(positionCard).toHaveClass('dark:bg-green-950');
  });

  it('does not highlight positions outside qualification', () => {
    renderSummary({
      position: 3,
    });

    const positionCard = screen.getByText('Position').parentElement;

    expect(positionCard).toHaveTextContent('3');
    expect(positionCard).not.toHaveClass('bg-green-100');
    expect(positionCard).not.toHaveClass('dark:bg-green-950');
  });
});
