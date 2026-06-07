import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type Match } from '@/types/match';

import MatchCenter from './MatchCenter';

import { getMatchCenterDisplay } from '@/utils/matches/matchCardHelper';

vi.mock('@/utils/matches/matchCardHelper', () => ({
  getMatchCenterDisplay: vi.fn(),
}));

const mockGetMatchCenterDisplay = vi.mocked(getMatchCenterDisplay);

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
  team_a_penalties: null,
  team_b_penalties: null,
};

describe('MatchCenter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMatchCenterDisplay.mockReturnValue('19:00');
  });

  it('renders the helper display for scheduled matches', () => {
    render(<MatchCenter match={baseMatch} />);

    expect(screen.getByText('19:00')).toBeInTheDocument();
    expect(mockGetMatchCenterDisplay).toHaveBeenCalledExactlyOnceWith(baseMatch);
  });

  it('renders the helper display for finished matches without penalties', () => {
    const finishedMatch: Match = {
      ...baseMatch,
      status: 'finished',
      team_a_score: 2,
      team_b_score: 1,
    };

    mockGetMatchCenterDisplay.mockReturnValue('2 - 1');

    render(<MatchCenter match={finishedMatch} />);

    expect(screen.getByText('2 - 1')).toBeInTheDocument();
    expect(screen.queryByText(/Pens:/)).not.toBeInTheDocument();
    expect(mockGetMatchCenterDisplay).toHaveBeenCalledExactlyOnceWith(finishedMatch);
  });

  it('renders score and penalty shootout line for finished matches with penalties', () => {
    const penaltyMatch: Match = {
      ...baseMatch,
      status: 'finished',
      team_a_score: 0,
      team_b_score: 0,
      team_a_penalties: 4,
      team_b_penalties: 2,
    };

    render(<MatchCenter match={penaltyMatch} />);

    expect(screen.getByText('0 - 0')).toBeInTheDocument();
    expect(screen.getByText('Pens: 4 - 2')).toBeInTheDocument();
    expect(mockGetMatchCenterDisplay).not.toHaveBeenCalled();
  });

  it('renders score and penalty shootout line for live matches with penalties', () => {
    const penaltyMatch: Match = {
      ...baseMatch,
      status: 'live',
      team_a_score: 0,
      team_b_score: 0,
      team_a_penalties: 4,
      team_b_penalties: 2,
    };

    render(<MatchCenter match={penaltyMatch} />);

    expect(screen.getByText('0 - 0')).toBeInTheDocument();
    expect(screen.getByText('Pens: 4 - 2')).toBeInTheDocument();
    expect(mockGetMatchCenterDisplay).not.toHaveBeenCalled();
  });

  it('renders penalties when one side has zero penalties', () => {
    const penaltyMatch: Match = {
      ...baseMatch,
      status: 'finished',
      team_a_score: 0,
      team_b_score: 0,
      team_a_penalties: 0,
      team_b_penalties: 2,
    };

    render(<MatchCenter match={penaltyMatch} />);

    expect(screen.getByText('0 - 0')).toBeInTheDocument();
    expect(screen.getByText('Pens: 0 - 2')).toBeInTheDocument();
    expect(mockGetMatchCenterDisplay).not.toHaveBeenCalled();
  });

  it('falls back to helper when only one penalty value is present', () => {
    const partialPenaltyMatch: Match = {
      ...baseMatch,
      status: 'finished',
      team_a_score: 1,
      team_b_score: 1,
      team_a_penalties: 4,
    };

    mockGetMatchCenterDisplay.mockReturnValue('1 - 1');

    render(<MatchCenter match={partialPenaltyMatch} />);

    expect(screen.getByText('1 - 1')).toBeInTheDocument();
    expect(screen.queryByText(/Pens:/)).not.toBeInTheDocument();
    expect(mockGetMatchCenterDisplay).toHaveBeenCalledExactlyOnceWith(partialPenaltyMatch);
  });
});
