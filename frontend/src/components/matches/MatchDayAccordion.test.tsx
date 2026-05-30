import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Match } from '@/types/matches';

import MatchCard from './MatchCard';
import MatchDayAccordion from './MatchDayAccordion';

vi.mock('@/components/ui/accordion', () => ({
  AccordionItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <section data-testid="accordion-item" data-value={value}>
      {children}
    </section>
  ),
  AccordionTrigger: ({
    className,
    children,
  }: {
    className?: string;
    children: React.ReactNode;
  }) => (
    <button className={className} type="button">
      {children}
    </button>
  ),
  AccordionContent: ({
    className,
    children,
  }: {
    className?: string;
    children: React.ReactNode;
  }) => (
    <div className={className} data-testid="accordion-content">
      {children}
    </div>
  ),
}));

vi.mock('./MatchCard', () => ({
  default: vi.fn(({ match }: { match: Match }) => (
    <article data-testid="match-card">{match.id}</article>
  )),
}));

const mockedMatchCard = vi.mocked(MatchCard);

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

describe('MatchDayAccordion', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders the day as the accordion item value and trigger label', () => {
    render(<MatchDayAccordion day="June 11, 2026" matches={[createMatch(1)]} />);

    expect(screen.getByTestId('accordion-item')).toHaveAttribute('data-value', 'June 11, 2026');
    expect(screen.getByRole('button', { name: 'June 11, 2026' })).toBeInTheDocument();
  });

  it('applies the expected accordion trigger and content classes', () => {
    render(<MatchDayAccordion day="June 11, 2026" matches={[createMatch(1)]} />);

    expect(screen.getByRole('button', { name: 'June 11, 2026' })).toHaveClass('py-2');

    const content = screen.getByTestId('accordion-content');
    expect(content).toHaveClass('px-1', 'pt-2', 'pb-4');
  });

  it('renders matches inside a responsive grid', () => {
    render(<MatchDayAccordion day="June 11, 2026" matches={[createMatch(1), createMatch(2)]} />);

    const content = screen.getByTestId('accordion-content');
    const grid = content.firstElementChild;

    expect(grid).toHaveClass('grid', 'gap-4', 'md:grid-cols-2');
    expect(within(content).getAllByTestId('match-card')).toHaveLength(2);
  });

  it('passes every match to MatchCard in order', () => {
    const firstMatch = createMatch(1);
    const secondMatch = createMatch(2);
    const thirdMatch = createMatch(3);

    render(
      <MatchDayAccordion day="June 11, 2026" matches={[firstMatch, secondMatch, thirdMatch]} />,
    );

    expect(mockedMatchCard).toHaveBeenCalledTimes(3);
    expect(mockedMatchCard.mock.calls[0][0]).toEqual({ match: firstMatch });
    expect(mockedMatchCard.mock.calls[1][0]).toEqual({ match: secondMatch });
    expect(mockedMatchCard.mock.calls[2][0]).toEqual({ match: thirdMatch });

    expect(screen.getAllByTestId('match-card').map((card) => card.textContent)).toEqual([
      '1',
      '2',
      '3',
    ]);
  });

  it('renders no MatchCard components when the day has no matches', () => {
    render(<MatchDayAccordion day="Rest Day" matches={[]} />);

    expect(screen.getByRole('button', { name: 'Rest Day' })).toBeInTheDocument();
    expect(screen.queryByTestId('match-card')).not.toBeInTheDocument();
    expect(mockedMatchCard).not.toHaveBeenCalled();
  });
});
