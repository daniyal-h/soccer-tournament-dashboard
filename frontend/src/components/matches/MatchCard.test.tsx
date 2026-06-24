import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type Match } from '@/types/match';

import { ROUTES } from '@/constants/navigation';

import MatchCard from './MatchCard';

import {
  getMatchCenterDisplay,
  getMatchMetaDisplay,
  getWinnerSide,
} from '@/utils/matches/matchCardHelper';

vi.mock('@/utils/matches/matchCardHelper', () => ({
  getMatchCenterDisplay: vi.fn(),
  getMatchMetaDisplay: vi.fn(),
  getWinnerSide: vi.fn(),
}));

vi.mock('./MatchStatusBadge', () => ({
  default: ({ status, elapsed }: { status: string; elapsed?: number | null }) => (
    <div data-testid="match-status-badge">
      {status}
      {elapsed == null ? '' : `-${elapsed}`}
    </div>
  ),
}));

vi.mock('./ResponsiveTeamName', () => ({
  default: ({
    name,
    shortName,
    className,
  }: {
    name: string;
    shortName: string;
    className?: string;
  }) => (
    <span data-testid={`team-name-${shortName}`} className={className}>
      {name}
    </span>
  ),
}));

const mockGetMatchCenterDisplay = vi.mocked(getMatchCenterDisplay);
const mockGetMatchMetaDisplay = vi.mocked(getMatchMetaDisplay);
const mockGetWinnerSide = vi.mocked(getWinnerSide);

const LocationStateViewer = () => {
  const location = useLocation();

  return (
    <div>
      <span data-testid="location-from">{location.state?.from}</span>
    </div>
  );
};

const baseMatch: Match = {
  id: 1,
  kickoff_time: '2026-06-11T19:00:00Z',
  stage: 'group',
  group: 'A',
  status: 'scheduled',
  venue: 'Estadio Azteca',
  city: 'Mexico City',
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
  elapsed: null,
  team_a_score: null,
  team_b_score: null,
  team_b_penalties: null,
  team_a_penalties: null,
};

function renderMatchCard(
  match: Match = baseMatch,
  props: Partial<React.ComponentProps<typeof MatchCard>> = {},
) {
  return render(
    <MemoryRouter>
      <MatchCard match={match} {...props} />
    </MemoryRouter>,
  );
}

describe('MatchCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMatchCenterDisplay.mockReturnValue('19:00');
    mockGetMatchMetaDisplay.mockReturnValue('Group A · Estadio Azteca · Mexico City');
    mockGetWinnerSide.mockReturnValue(null);
  });

  it('links to match details with schedule state and no text decoration', async () => {
    render(
      <MemoryRouter>
        <MatchCard match={baseMatch} />
        <LocationStateViewer />
      </MemoryRouter>,
    );

    const link = screen.getByRole('link');

    expect(link).toHaveAttribute('href', '/matches/1');
    expect(link).toHaveStyle({ textDecoration: 'none' });

    await userEvent.click(link);

    expect(screen.getByTestId('location-from')).toHaveTextContent(ROUTES.SCHEDULE);
  });

  it('renders both team names and logos', () => {
    renderMatchCard(baseMatch);

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
    renderMatchCard(baseMatch);

    expect(screen.getByText('19:00')).toBeInTheDocument();
    expect(screen.getByText('Group A · Estadio Azteca · Mexico City')).toBeInTheDocument();

    expect(mockGetMatchCenterDisplay).toHaveBeenCalledExactlyOnceWith(baseMatch);
    expect(mockGetMatchMetaDisplay).toHaveBeenCalledExactlyOnceWith(baseMatch);
  });

  it('uses custom from state when provided', async () => {
    render(
      <MemoryRouter>
        <MatchCard match={baseMatch} from={ROUTES.STANDINGS} />
        <LocationStateViewer />
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole('link'));

    expect(screen.getByTestId('location-from')).toHaveTextContent(ROUTES.STANDINGS);
  });

  it('uses default variant styling when no variant is provided', () => {
    renderMatchCard();

    const card = screen.getByRole('link').firstElementChild;

    expect(card).toHaveClass('hover:bg-accent');
    expect(card).toHaveClass('hover:shadow-md');
    expect(card).toHaveClass('active:bg-accent');
    expect(card).not.toHaveClass('bg-background/70');
    expect(card).not.toHaveClass('shadow-none');
  });

  it('uses nested variant styling when variant is nested', () => {
    renderMatchCard(baseMatch, { variant: 'nested' });

    const card = screen.getByRole('link').firstElementChild;

    expect(card).toHaveClass('bg-background/70');
    expect(card).toHaveClass('shadow-none');
    expect(card).toHaveClass('hover:bg-background');
    expect(card).toHaveClass('hover:shadow-sm');
    expect(card).toHaveClass('active:bg-background');
    expect(card).not.toHaveClass('hover:bg-accent');
    expect(card).not.toHaveClass('hover:shadow-md');
  });

  it('passes status and elapsed time to MatchStatusBadge', () => {
    const liveMatch: Match = {
      ...baseMatch,
      status: 'live',
      elapsed: 67,
      team_a_score: 2,
      team_b_score: 1,
    };

    renderMatchCard(liveMatch);

    expect(screen.getByTestId('match-status-badge')).toHaveTextContent('live-67');
  });

  it('still renders scores or special center text returned by the helper', () => {
    mockGetMatchCenterDisplay.mockReturnValue('2 - 1');

    const match: Match = {
      ...baseMatch,
      status: 'finished',
      team_a_score: 2,
      team_b_score: 1,
    };

    renderMatchCard(match);

    expect(screen.getByText('2 - 1')).toBeInTheDocument();
  });

  it('renders the card as a keyboard-focusable link', () => {
    renderMatchCard(baseMatch);

    const link = screen.getByRole('link');

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/matches/1');
  });

  it('truncates match metadata', () => {
    mockGetMatchMetaDisplay.mockReturnValue(
      'Group A · Extremely Long Stadium Name · Extremely Long City Name',
    );

    renderMatchCard(baseMatch);

    expect(
      screen.getByText('Group A · Extremely Long Stadium Name · Extremely Long City Name'),
    ).toHaveClass('truncate');
  });

  it('does not mute either team when there is no winner', () => {
    const match: Match = {
      ...baseMatch,
      status: 'scheduled',
      team_a_score: null,
      team_b_score: null,
      team_a_penalties: null,
      team_b_penalties: null,
    };

    renderMatchCard(match);

    expect(screen.getByText(baseMatch.team_a.name)).not.toHaveClass('font-semibold');
    expect(screen.getByText(baseMatch.team_a.name)).not.toHaveClass('text-muted-foreground');

    expect(screen.getByText(baseMatch.team_b.name)).not.toHaveClass('font-semibold');
    expect(screen.getByText(baseMatch.team_b.name)).not.toHaveClass('text-muted-foreground');
  });

  it('does not mute either team for a finished draw without penalties', () => {
    const match: Match = {
      ...baseMatch,
      status: 'finished',
      team_a_score: 1,
      team_b_score: 1,
    };

    renderMatchCard(match);

    expect(screen.getByText(baseMatch.team_a.name)).not.toHaveClass('font-semibold');
    expect(screen.getByText(baseMatch.team_a.name)).not.toHaveClass('text-muted-foreground');

    expect(screen.getByText(baseMatch.team_b.name)).not.toHaveClass('font-semibold');
    expect(screen.getByText(baseMatch.team_b.name)).not.toHaveClass('text-muted-foreground');
  });

  it('renders penalty shootout details through MatchCenter', () => {
    const penaltyMatch: Match = {
      ...baseMatch,
      status: 'finished',
      team_a_score: 0,
      team_b_score: 0,
      team_a_penalties: 4,
      team_b_penalties: 2,
    };

    mockGetMatchCenterDisplay.mockReturnValue('0 - 0');

    renderMatchCard(penaltyMatch);

    expect(screen.getByText('0 - 0')).toBeInTheDocument();
    expect(screen.getByText('Pens: 4 - 2')).toBeInTheDocument();

    expect(mockGetMatchCenterDisplay).toHaveBeenCalledExactlyOnceWith(penaltyMatch);
    expect(mockGetMatchMetaDisplay).toHaveBeenCalledExactlyOnceWith(penaltyMatch);
  });

  it('bolds team A and mutes team B when team A wins', () => {
    mockGetWinnerSide.mockReturnValue('team_a');

    const match: Match = {
      ...baseMatch,
      status: 'finished',
      team_a_score: 2,
      team_b_score: 1,
    };

    renderMatchCard(match);

    expect(screen.getByText(baseMatch.team_a.name)).toHaveClass('font-semibold');
    expect(screen.getByText(baseMatch.team_a.name)).not.toHaveClass('text-muted-foreground');

    expect(screen.getByText(baseMatch.team_b.name)).toHaveClass('text-muted-foreground');
    expect(screen.getByText(baseMatch.team_b.name)).not.toHaveClass('font-semibold');
  });

  it('bolds team B and mutes team A when team B wins on penalties', () => {
    mockGetWinnerSide.mockReturnValue('team_b');
    const match: Match = {
      ...baseMatch,
      status: 'finished',
      team_a_score: 0,
      team_b_score: 0,
      team_a_penalties: 4,
      team_b_penalties: 5,
    };

    renderMatchCard(match);

    expect(screen.getByText(baseMatch.team_b.name)).toHaveClass('font-semibold');
    expect(screen.getByText(baseMatch.team_b.name)).not.toHaveClass('text-muted-foreground');

    expect(screen.getByText(baseMatch.team_a.name)).toHaveClass('text-muted-foreground');
    expect(screen.getByText(baseMatch.team_a.name)).not.toHaveClass('font-semibold');
  });
});
