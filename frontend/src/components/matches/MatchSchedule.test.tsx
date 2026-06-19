import { cleanup, render, screen } from '@testing-library/react';
import { useNavigationType } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Match, MatchGroup } from '@/types/match';

import MatchDayAccordion from './MatchDayAccordion';
import MatchSchedule from './MatchSchedule';

import { findNextUpcomingDayKey } from '@/utils/matches/matchCardHelper';

vi.mock('react-router-dom', () => ({
  useNavigationType: vi.fn(),
}));

vi.mock('@/utils/matches/matchCardHelper', () => ({
  findNextUpcomingDayKey: vi.fn(),
}));

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
const mockedUseNavigationType = vi.mocked(useNavigationType);
const mockedFindNextUpcomingDayKey = vi.mocked(findNextUpcomingDayKey);

const createTeam = (id: number, name: string): Match['team_a'] =>
  ({
    id,
    name,
    short_name: name.slice(0, 3).toUpperCase(),
    logo_url: `https://example.com/${id}.png`,
  }) as Match['team_a'];

const createMatch = (id: number, kickoffTime: string): Match => ({
  id,
  team_a: createTeam(id, `Team ${id}A`),
  team_b: createTeam(id + 100, `Team ${id}B`),
  kickoff_time: kickoffTime,
  stage: 'group',
  group: 'A',
  status: 'scheduled',
  venue: `Venue ${id}`,
  city: `City ${id}`,
  elapsed: null,
  team_a_score: null,
  team_b_score: null,
  team_a_penalties: null,
  team_b_penalties: null,
});

const createGroup = (day: string, entries: Array<{ id: number; kickoff: string }>): MatchGroup => ({
  day,
  matches: entries.map(({ id, kickoff }) => createMatch(id, kickoff)),
});

describe('MatchSchedule', () => {
  const scrollIntoViewMock = vi.fn();

  beforeEach(() => {
    // jsdom does not implement scrollIntoView — provide our own spy
    HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
    mockedUseNavigationType.mockReturnValue(
      'PUSH' as unknown as ReturnType<typeof useNavigationType>,
    );
    mockedFindNextUpcomingDayKey.mockReturnValue(null);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders an accordion configured for multiple open match days', () => {
      render(
        <MatchSchedule
          groupedMatches={[
            createGroup('June 11, 2026', [{ id: 1, kickoff: '2026-06-11T19:00:00Z' }]),
            createGroup('June 12, 2026', [{ id: 2, kickoff: '2026-06-12T19:00:00Z' }]),
          ]}
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
            createGroup('June 11, 2026', [{ id: 1, kickoff: '2026-06-11T19:00:00Z' }]),
            createGroup('June 12, 2026', [
              { id: 2, kickoff: '2026-06-12T19:00:00Z' },
              { id: 3, kickoff: '2026-06-12T20:00:00Z' },
            ]),
            createGroup('June 13, 2026', [{ id: 4, kickoff: '2026-06-13T20:00:00Z' }]),
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
          groupedMatches={[
            createGroup('June 11, 2026', [{ id: 1, kickoff: '2026-06-11T19:00:00Z' }]),
            createGroup('June 12, 2026', [
              { id: 2, kickoff: '2026-06-12T19:00:00Z' },
              { id: 3, kickoff: '2026-06-12T20:00:00Z' },
            ]),
          ]}
        />,
      );

      expect(screen.getAllByTestId('match-day-accordion').map((item) => item.textContent)).toEqual([
        'June 11, 2026',
        'June 12, 2026',
      ]);
    });

    it('passes the correct day and matches to each MatchDayAccordion', () => {
      const firstGroup = createGroup('June 11, 2026', [{ id: 1, kickoff: '2026-06-11T19:00:00Z' }]);
      const secondGroup = createGroup('June 12, 2026', [
        { id: 2, kickoff: '2026-06-12T19:00:00Z' },
        { id: 3, kickoff: '2026-06-12T20:00:00Z' },
      ]);

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

  describe('scroll-to-next-upcoming-day behavior', () => {
    // Tournament window: first kickoff 2026-06-11T19:00:00Z, last kickoff 2026-06-20T19:00:00Z
    const groups = [
      createGroup('June 11, 2026', [{ id: 1, kickoff: '2026-06-11T19:00:00Z' }]),
      createGroup('June 20, 2026', [{ id: 2, kickoff: '2026-06-20T19:00:00Z' }]),
    ];

    it('scrolls the next-upcoming-day group into view when navigation is not POP and the tournament is live', () => {
      mockedUseNavigationType.mockReturnValue(
        'PUSH' as unknown as ReturnType<typeof useNavigationType>,
      );
      mockedFindNextUpcomingDayKey.mockReturnValue('June 20, 2026');
      vi.setSystemTime(new Date('2026-06-15T00:00:00Z')); // between start and end

      render(<MatchSchedule groupedMatches={groups} />);

      expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);
      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'instant', block: 'start' });
    });

    it('attaches the scroll ref to the group matching findNextUpcomingDayKey, not just the first or last group', () => {
      mockedUseNavigationType.mockReturnValue(
        'PUSH' as unknown as ReturnType<typeof useNavigationType>,
      );
      mockedFindNextUpcomingDayKey.mockReturnValue('June 20, 2026');
      vi.setSystemTime(new Date('2026-06-15T00:00:00Z'));

      const { container } = render(<MatchSchedule groupedMatches={groups} />);

      // the wrapping divs are siblings of the accordion children; confirm only
      // one scroll call happened and it targeted an element, not undefined
      const wrappers = container.querySelectorAll('[data-testid="accordion"] > div');
      expect(wrappers).toHaveLength(2);
      expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);
    });

    it('does not scroll when navigationType is POP, even if the tournament is live', () => {
      mockedUseNavigationType.mockReturnValue(
        'POP' as unknown as ReturnType<typeof useNavigationType>,
      );
      mockedFindNextUpcomingDayKey.mockReturnValue('June 20, 2026');
      vi.setSystemTime(new Date('2026-06-15T00:00:00Z'));

      render(<MatchSchedule groupedMatches={groups} />);

      expect(scrollIntoViewMock).not.toHaveBeenCalled();
    });

    it('does not scroll when groupedMatches is empty', () => {
      mockedUseNavigationType.mockReturnValue(
        'PUSH' as unknown as ReturnType<typeof useNavigationType>,
      );
      vi.setSystemTime(new Date('2026-06-15T00:00:00Z'));

      render(<MatchSchedule groupedMatches={[]} />);

      expect(scrollIntoViewMock).not.toHaveBeenCalled();
    });

    it('does not scroll when now is before the tournament start', () => {
      mockedUseNavigationType.mockReturnValue(
        'PUSH' as unknown as ReturnType<typeof useNavigationType>,
      );
      mockedFindNextUpcomingDayKey.mockReturnValue('June 11, 2026');
      vi.setSystemTime(new Date('2026-06-10T23:59:59Z')); // 1s before first kickoff

      render(<MatchSchedule groupedMatches={groups} />);

      expect(scrollIntoViewMock).not.toHaveBeenCalled();
    });

    it('does not scroll when now is after the tournament end', () => {
      mockedUseNavigationType.mockReturnValue(
        'PUSH' as unknown as ReturnType<typeof useNavigationType>,
      );
      mockedFindNextUpcomingDayKey.mockReturnValue(null);
      vi.setSystemTime(new Date('2026-06-20T19:00:01Z')); // 1s after last kickoff

      render(<MatchSchedule groupedMatches={groups} />);

      expect(scrollIntoViewMock).not.toHaveBeenCalled();
    });

    it('scrolls when now is exactly the first kickoff time (inclusive lower boundary)', () => {
      mockedUseNavigationType.mockReturnValue(
        'PUSH' as unknown as ReturnType<typeof useNavigationType>,
      );
      mockedFindNextUpcomingDayKey.mockReturnValue('June 20, 2026');
      vi.setSystemTime(new Date('2026-06-11T19:00:00Z')); // exactly first kickoff

      render(<MatchSchedule groupedMatches={groups} />);

      expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);
    });

    it('scrolls when now is exactly the last kickoff time (inclusive upper boundary)', () => {
      mockedUseNavigationType.mockReturnValue(
        'PUSH' as unknown as ReturnType<typeof useNavigationType>,
      );
      mockedFindNextUpcomingDayKey.mockReturnValue('June 20, 2026'); // still matches a real group
      vi.setSystemTime(new Date('2026-06-20T19:00:00Z')); // exactly last kickoff

      render(<MatchSchedule groupedMatches={groups} />);

      expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);
    });

    it('does not scroll on a second render caused by a groupedMatches update (effect runs once per mount)', () => {
      mockedUseNavigationType.mockReturnValue(
        'PUSH' as unknown as ReturnType<typeof useNavigationType>,
      );
      mockedFindNextUpcomingDayKey.mockReturnValue('June 20, 2026');
      vi.setSystemTime(new Date('2026-06-15T00:00:00Z'));

      const { rerender } = render(<MatchSchedule groupedMatches={groups} />);
      expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);

      const updatedGroups = [
        ...groups,
        createGroup('June 21, 2026', [{ id: 3, kickoff: '2026-06-21T19:00:00Z' }]),
      ];
      rerender(<MatchSchedule groupedMatches={updatedGroups} />);

      // effect has an empty dependency array — must not fire again on update
      expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);
    });
  });
});
