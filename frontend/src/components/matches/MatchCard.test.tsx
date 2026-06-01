import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type Match } from '@/types/matches';

import MatchCard from './MatchCard';

import { getMatchCenterDisplay, getMatchMetaDisplay } from '@/utils/matches/matchCardHelper';

vi.mock('@/utils/matches/matchCardHelper', () => ({
  getMatchCenterDisplay: vi.fn(),
  getMatchMetaDisplay: vi.fn(),
}));

vi.mock('./MatchStatusBadge', () => ({
  default: ({ status, elapsed }: { status: string; elapsed?: number | null }) => (
    <div data-testid="match-status-badge">
      {status}
      {elapsed == null ? '' : `-${elapsed}`}
    </div>
  ),
}));

const mockGetMatchCenterDisplay = vi.mocked(getMatchCenterDisplay);
const mockGetMatchMetaDisplay = vi.mocked(getMatchMetaDisplay);

const baseMatch: Match = {
  id: 1,
  kickoff_time: '2026-06-11T19:00:00Z',
  stage: 'group',
  group: 'A',
  status: 'scheduled',
  venue: 'Estadio Azteca, Mexico City',
  team_a: {
    id: 10,
    name: 'Canada',
    short_name: 'CAN',
    logo_url: 'https://example.com/canada.png',
  },
  team_b: {
    id: 20,
    name: 'Brazil',
    short_name: 'BRA',
    logo_url: 'https://example.com/brazil.png',
  },
};

describe('MatchCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMatchCenterDisplay.mockReturnValue('19:00');
    mockGetMatchMetaDisplay.mockReturnValue('Group A · Estadio Azteca, Mexico City');
  });

  it('renders both team names and logos', () => {
    render(<MatchCard match={baseMatch} />);

    expect(screen.getByText('Canada')).toBeInTheDocument();
    expect(screen.getByText('Brazil')).toBeInTheDocument();

    expect(screen.getByRole('img', { name: 'Canada' })).toHaveAttribute(
      'src',
      'https://example.com/canada.png',
    );
    expect(screen.getByRole('img', { name: 'Brazil' })).toHaveAttribute(
      'src',
      'https://example.com/brazil.png',
    );
  });

  it('renders the computed center display and match metadata', () => {
    render(<MatchCard match={baseMatch} />);

    expect(screen.getByText('19:00')).toBeInTheDocument();
    expect(screen.getByText('Group A · Estadio Azteca, Mexico City')).toBeInTheDocument();

    expect(mockGetMatchCenterDisplay).toHaveBeenCalledExactlyOnceWith(baseMatch);
    expect(mockGetMatchMetaDisplay).toHaveBeenCalledExactlyOnceWith(baseMatch);
  });

  it('passes status and elapsed time to MatchStatusBadge', () => {
    const liveMatch: Match = {
      ...baseMatch,
      status: 'live',
      elapsed: 67,
      team_a_score: 2,
      team_b_score: 1,
    };

    render(<MatchCard match={liveMatch} />);

    expect(screen.getByTestId('match-status-badge')).toHaveTextContent('live-67');
  });

  it('still renders scores or special center text returned by the helper', () => {
    mockGetMatchCenterDisplay.mockReturnValue('2 - 1');

    render(
      <MatchCard
        match={{
          ...baseMatch,
          status: 'finished',
          team_a_score: 2,
          team_b_score: 1,
        }}
      />,
    );

    expect(screen.getByText('2 - 1')).toBeInTheDocument();
  });

  it('keeps the card keyboard-focusable', () => {
    render(<MatchCard match={baseMatch} />);

    const card = screen.getByText('Canada').closest('[tabindex="0"]');

    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('cursor-pointer');
  });

  it('renders the home team before the center display and the away team after it', () => {
    render(<MatchCard match={baseMatch} />);

    const teamA = screen.getByText('Canada');
    const center = screen.getByText('19:00');
    const teamB = screen.getByText('Brazil');

    expect(teamA.compareDocumentPosition(center)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(center.compareDocumentPosition(teamB)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});

it('renders penalty shootout details through MatchCenter', () => {
  vi.clearAllMocks();
  const penaltyMatch: Match = {
    ...baseMatch,
    status: 'finished',
    team_a_score: 0,
    team_b_score: 0,
    team_a_penalties: 4,
    team_b_penalties: 2,
  };

  render(<MatchCard match={penaltyMatch} />);

  expect(screen.getByText('0 - 0')).toBeInTheDocument();
  expect(screen.getByText('Pens: 4 - 2')).toBeInTheDocument();

  expect(mockGetMatchCenterDisplay).not.toHaveBeenCalled();
  expect(mockGetMatchMetaDisplay).toHaveBeenCalledExactlyOnceWith(penaltyMatch);
});
