import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type Match } from '@/types/match';

import MatchCenter from './MatchCenter';

import { getMatchCenterDisplay, getMatchDay } from '@/utils/matches/matchCardHelper';

vi.mock('@/utils/matches/matchCardHelper', () => ({
  getMatchCenterDisplay: vi.fn(),
  getMatchDay: vi.fn(),
}));

const mockGetMatchCenterDisplay = vi.mocked(getMatchCenterDisplay);
const mockGetMatchDay = vi.mocked(getMatchDay);

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
    mockGetMatchDay.mockReturnValue('Jun 11');
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

    mockGetMatchCenterDisplay.mockReturnValue('0 - 0');

    render(<MatchCenter match={penaltyMatch} />);

    expect(screen.getByText('0 - 0')).toBeInTheDocument();
    expect(screen.getByText('Pens: 4 - 2')).toBeInTheDocument();
    expect(mockGetMatchCenterDisplay).toHaveBeenCalledExactlyOnceWith(penaltyMatch);
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

    mockGetMatchCenterDisplay.mockReturnValue('0 - 0');

    render(<MatchCenter match={penaltyMatch} />);

    expect(screen.getByText('0 - 0')).toBeInTheDocument();
    expect(screen.getByText('Pens: 4 - 2')).toBeInTheDocument();
    expect(mockGetMatchCenterDisplay).toHaveBeenCalledExactlyOnceWith(penaltyMatch);
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

    mockGetMatchCenterDisplay.mockReturnValue('0 - 0');

    render(<MatchCenter match={penaltyMatch} />);

    expect(screen.getByText('0 - 0')).toBeInTheDocument();
    expect(screen.getByText('Pens: 0 - 2')).toBeInTheDocument();
    expect(mockGetMatchCenterDisplay).toHaveBeenCalledExactlyOnceWith(penaltyMatch);
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

  it('falls back to helper when only team B penalty value is present', () => {
    const partialPenaltyMatch: Match = {
      ...baseMatch,
      status: 'finished',
      team_a_score: 1,
      team_b_score: 1,
      team_a_penalties: null,
      team_b_penalties: 4,
    };

    mockGetMatchCenterDisplay.mockReturnValue('1 - 1');

    render(<MatchCenter match={partialPenaltyMatch} />);

    expect(screen.getByText('1 - 1')).toBeInTheDocument();
    expect(screen.queryByText(/Pens:/)).not.toBeInTheDocument();
    expect(mockGetMatchCenterDisplay).toHaveBeenCalledExactlyOnceWith(partialPenaltyMatch);
  });

  it('does not render penalties for scheduled matches even when penalty values exist', () => {
    const scheduledPenaltyMatch: Match = {
      ...baseMatch,
      status: 'scheduled',
      team_a_score: null,
      team_b_score: null,
      team_a_penalties: 4,
      team_b_penalties: 2,
    };

    mockGetMatchCenterDisplay.mockReturnValue('19:00');

    render(<MatchCenter match={scheduledPenaltyMatch} />);

    expect(screen.getByText('19:00')).toBeInTheDocument();
    expect(screen.queryByText(/Pens:/)).not.toBeInTheDocument();
    expect(mockGetMatchCenterDisplay).toHaveBeenCalledExactlyOnceWith(scheduledPenaltyMatch);
  });

  it('does not render the match date by default for scheduled matches', () => {
    render(<MatchCenter match={baseMatch} />);

    expect(screen.getByText('19:00')).toBeInTheDocument();
    expect(screen.queryByText('Jun 11')).not.toBeInTheDocument();

    expect(mockGetMatchCenterDisplay).toHaveBeenCalledExactlyOnceWith(baseMatch);
    expect(mockGetMatchDay).not.toHaveBeenCalled();
  });

  it('does not render the match date by default for scheduled matches', () => {
    render(<MatchCenter match={baseMatch} />);

    expect(screen.getByText('19:00')).toBeInTheDocument();
    expect(screen.queryByText('Jun 11')).not.toBeInTheDocument();

    expect(mockGetMatchCenterDisplay).toHaveBeenCalledExactlyOnceWith(baseMatch);
    expect(mockGetMatchDay).not.toHaveBeenCalled();
  });

  it('does not render the match date for live matches when enabled', () => {
    const liveMatch: Match = {
      ...baseMatch,
      status: 'live',
      elapsed: 67,
      team_a_score: 1,
      team_b_score: 1,
    };

    mockGetMatchCenterDisplay.mockReturnValue('1 - 1');

    render(<MatchCenter match={liveMatch} showDateInCenter />);

    expect(screen.getByText('1 - 1')).toBeInTheDocument();
    expect(screen.queryByText('Jun 11')).not.toBeInTheDocument();

    expect(mockGetMatchCenterDisplay).toHaveBeenCalledExactlyOnceWith(liveMatch);
    expect(mockGetMatchDay).not.toHaveBeenCalled();
  });

  it('does not render the match date for live matches when enabled', () => {
    const liveMatch: Match = {
      ...baseMatch,
      status: 'live',
      elapsed: 67,
      team_a_score: 1,
      team_b_score: 1,
    };

    mockGetMatchCenterDisplay.mockReturnValue('1 - 1');

    render(<MatchCenter match={liveMatch} showDateInCenter />);

    expect(screen.getByText('1 - 1')).toBeInTheDocument();
    expect(screen.queryByText('Jun 11')).not.toBeInTheDocument();

    expect(mockGetMatchCenterDisplay).toHaveBeenCalledExactlyOnceWith(liveMatch);
    expect(mockGetMatchDay).not.toHaveBeenCalled();
  });

  it('does not render the match date in the penalties layout even when enabled', () => {
    const penaltyMatch: Match = {
      ...baseMatch,
      status: 'finished',
      team_a_score: 0,
      team_b_score: 0,
      team_a_penalties: 4,
      team_b_penalties: 2,
    };

    mockGetMatchCenterDisplay.mockReturnValue('0 - 0');

    render(<MatchCenter match={penaltyMatch} showDateInCenter />);

    expect(screen.getByText('0 - 0')).toBeInTheDocument();
    expect(screen.getByText('Pens: 4 - 2')).toBeInTheDocument();
    expect(screen.queryByText('Jun 11')).not.toBeInTheDocument();

    expect(mockGetMatchDay).not.toHaveBeenCalled();
  });
});
