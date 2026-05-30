import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Match, MatchGroup } from '@/types/matches';

import MatchDayAccordion from './MatchDayAccordion';
import MatchSchedule from './MatchSchedule';

vi.mock('../ui/accordion', () => ({
  Accordion: ({
    type,
    defaultValue,
    className,
    children,
  }: {
    type: string;
    defaultValue: string[];
    className?: string;
    children: React.ReactNode;
  }) => (
    <div
      className={className}
      data-default-value={JSON.stringify(defaultValue)}
      data-testid="accordion"
      data-type={type}
    >
      {children}
    </div>
  ),
}));

vi.mock('./MatchDayAccordion', () => ({
  default: vi.fn(({ day, matches }: { day: string; matches: Match[] }) => (
    <section data-match-count={matches.length} data-testid="match-day-accordion">
      {day}
    </section>
  )),
}));

const mockedMatchDayAccordion = vi.mocked(MatchDayAccordion);

const createTeam = (id: number, name: string): Match['team_a'] =>
  ({
    id,
    name,
    short_name: name.slice(0, 3).toUpperCase(),
    logo_url: `https://example.com/${id}.png`,
  }) as Match['team_a'];

const createMatch = (id: number): Match => ({
  id,
  team_a: createTeam(id, `Team ${id}A`),
  team_b: createTeam(id + 100, `Team ${id}B`),
  kickoff_time: `2026-06-${String(id).padStart(2, '0')}T19:00:00Z`,
  stage: 'group',
  group: 'A',
  status: 'scheduled',
  venue: `Venue ${id}`,
  city: `City ${id}`,
});

const createGroup = (day: string, matchIds: number[]): MatchGroup => ({
  day,
  matches: matchIds.map(createMatch),
});

describe('MatchSchedule', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders an accordion configured for multiple open match days', () => {
    render(
      <MatchSchedule
        groupedMatches={[createGroup('June 11, 2026', [1]), createGroup('June 12, 2026', [2])]}
      />,
    );

    const accordion = screen.getByTestId('accordion');

    expect(accordion).toHaveAttribute('data-type', 'multiple');
    expect(accordion).toHaveClass('gap-6');
  });

  it('opens all match days by default', () => {
    render(
      <MatchSchedule
        groupedMatches={[
          createGroup('June 11, 2026', [1]),
          createGroup('June 12, 2026', [2, 3]),
          createGroup('June 13, 2026', []),
        ]}
      />,
    );

    expect(screen.getByTestId('accordion')).toHaveAttribute(
      'data-default-value',
      JSON.stringify(['June 11, 2026', 'June 12, 2026', 'June 13, 2026']),
    );
  });

  it('renders one MatchDayAccordion per group in order', () => {
    render(
      <MatchSchedule
        groupedMatches={[createGroup('June 11, 2026', [1]), createGroup('June 12, 2026', [2, 3])]}
      />,
    );

    expect(screen.getAllByTestId('match-day-accordion').map((item) => item.textContent)).toEqual([
      'June 11, 2026',
      'June 12, 2026',
    ]);
  });

  it('passes the correct day and matches to each MatchDayAccordion', () => {
    const firstGroup = createGroup('June 11, 2026', [1]);
    const secondGroup = createGroup('June 12, 2026', [2, 3]);

    render(<MatchSchedule groupedMatches={[firstGroup, secondGroup]} />);

    expect(mockedMatchDayAccordion).toHaveBeenCalledTimes(2);
    expect(mockedMatchDayAccordion.mock.calls[0][0]).toEqual({
      day: firstGroup.day,
      matches: firstGroup.matches,
    });
    expect(mockedMatchDayAccordion.mock.calls[1][0]).toEqual({
      day: secondGroup.day,
      matches: secondGroup.matches,
    });
  });

  it('renders an empty accordion when there are no grouped matches', () => {
    render(<MatchSchedule groupedMatches={[]} />);

    expect(screen.getByTestId('accordion')).toHaveAttribute('data-default-value', '[]');
    expect(screen.queryByTestId('match-day-accordion')).not.toBeInTheDocument();
    expect(mockedMatchDayAccordion).not.toHaveBeenCalled();
  });
});
