import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { MatchStage } from '@/types/match';

import { TEAM_STAGE_LABELS } from '@/constants/tournamentTeams';

import TeamFilters from './TeamFilters';

vi.mock('@/components/ui/select', () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
  }) => (
    <div data-testid="select" data-value={value}>
      <button onClick={() => onValueChange('A')}>choose-group</button>
      <button onClick={() => onValueChange('semi_final')}>choose-stage</button>
      {children}
    </div>
  ),

  SelectTrigger: ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <button className={className}>{children}</button>
  ),

  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,

  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,

  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <div data-testid="select-item" data-value={value}>
      {children}
    </div>
  ),
}));

function renderTeamFilters({
  groups = ['A', 'B'],
  stages = ['final', 'semi_final'] as MatchStage[],
  selectedGroup = 'all',
  selectedStage = 'all',
  onGroupChange = vi.fn(),
  onStageChange = vi.fn(),
} = {}) {
  const renderResult = render(
    <TeamFilters
      groups={groups}
      stages={stages}
      selectedGroup={selectedGroup}
      selectedStage={selectedStage}
      onGroupChange={onGroupChange}
      onStageChange={onStageChange}
    />,
  );

  return {
    ...renderResult,
    onGroupChange,
    onStageChange,
  };
}

describe('TeamFilters', () => {
  it('passes selected values into the selects', () => {
    renderTeamFilters({
      selectedGroup: 'B',
      selectedStage: 'final',
    });

    const selects = screen.getAllByTestId('select');

    expect(selects[0]).toHaveAttribute('data-value', 'B');
    expect(selects[1]).toHaveAttribute('data-value', 'final');
  });

  it('renders all group options', () => {
    renderTeamFilters({
      groups: ['A', 'B', 'C'],
    });

    expect(screen.getByText('All Groups')).toBeInTheDocument();

    expect(screen.getByText('Group A')).toBeInTheDocument();
    expect(screen.getByText('Group B')).toBeInTheDocument();
    expect(screen.getByText('Group C')).toBeInTheDocument();
  });

  it('renders all stage options with display labels', () => {
    renderTeamFilters({
      stages: ['final', 'quarter_final'],
    });

    expect(screen.getByText('All Stages')).toBeInTheDocument();

    expect(screen.getByText(TEAM_STAGE_LABELS.final)).toBeInTheDocument();

    expect(screen.getByText(TEAM_STAGE_LABELS.quarter_final)).toBeInTheDocument();
  });

  it('calls onGroupChange when group selection changes', async () => {
    const user = userEvent.setup();

    const { onGroupChange } = renderTeamFilters();

    const selects = screen.getAllByTestId('select');

    await user.click(within(selects[0]).getByText('choose-group'));

    expect(onGroupChange).toHaveBeenCalledOnce();
    expect(onGroupChange).toHaveBeenCalledWith('A');
  });

  it('calls onStageChange when stage selection changes', async () => {
    const user = userEvent.setup();

    const { onStageChange } = renderTeamFilters();

    const selects = screen.getAllByTestId('select');

    await user.click(within(selects[1]).getByText('choose-stage'));

    expect(onStageChange).toHaveBeenCalledOnce();
    expect(onStageChange).toHaveBeenCalledWith('semi_final');
  });

  it('only renders all options when groups and stages are empty', () => {
    renderTeamFilters({
      groups: [],
      stages: [],
    });

    expect(screen.getByText('All Groups')).toBeInTheDocument();
    expect(screen.getByText('All Stages')).toBeInTheDocument();

    expect(screen.queryByText('Group A')).not.toBeInTheDocument();
    expect(screen.queryByText(TEAM_STAGE_LABELS.final)).not.toBeInTheDocument();
  });

  it('applies responsive filter layout classes', () => {
    const { container } = renderTeamFilters();

    expect(container.firstChild).toHaveClass('mb-6', 'flex', 'flex-col', 'gap-3', 'sm:flex-row');
  });

  it('applies responsive select widths', () => {
    renderTeamFilters();

    const triggers = screen
      .getAllByRole('button')
      .filter((button) => button.className.includes('w-full'));

    expect(triggers).toHaveLength(2);

    expect(triggers[0]).toHaveClass('w-full', 'sm:w-48');
    expect(triggers[1]).toHaveClass('w-full', 'sm:w-48');
  });
});
