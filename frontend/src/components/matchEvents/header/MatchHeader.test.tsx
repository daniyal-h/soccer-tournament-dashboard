import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import MatchHeader from '@/components/matchEvents/header/MatchHeader';

import type { Match } from '@/types/match';
import type { ResponseMetadata } from '@/types/metadata';

vi.mock('@/components/matches/MatchStatusBadge', () => ({
  default: ({ status, elapsed }: { status: string; elapsed: number | null }) => (
    <div>
      Status Badge: {status}
      {elapsed !== null ? ` ${elapsed}` : ''}
    </div>
  ),
}));

const teamA = {
  id: 10,
  name: 'Canada',
  short_name: 'CAN',
  logo_url: 'https://example.com/canada.png',
};

const teamB = {
  id: 20,
  name: 'Brazil',
  short_name: 'BRA',
  logo_url: 'https://example.com/brazil.png',
};

const baseMatch: Match = {
  id: 1,
  kickoff_time: '2026-06-11T19:00:00Z',
  stage: 'group',
  group: 'A',
  status: 'scheduled',
  venue: 'Estadio Azteca',
  city: 'Mexico City',
  team_a: teamA,
  team_b: teamB,
  elapsed: null,
  team_a_score: null,
  team_b_score: null,
  team_a_penalties: null,
  team_b_penalties: null,
};

const baseMetadata: ResponseMetadata = {
  is_delayed: false,
  last_updated: '2026-06-11T19:09:00Z',
  last_successful_refresh: null,
  message: null,
};

function makeMatch(overrides: Partial<Match> = {}): Match {
  return {
    ...baseMatch,
    ...overrides,
  };
}

function makeMetadata(overrides: Partial<ResponseMetadata> = {}): ResponseMetadata {
  return {
    ...baseMetadata,
    ...overrides,
  };
}

function renderMatchHeader(match: Match = baseMatch, metadata: ResponseMetadata = baseMetadata) {
  return render(<MatchHeader match={match} metadata={metadata} />);
}

describe('MatchHeader', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-11T19:10:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders team names, short names, logos, venue, stage, status, kickoff date, and metadata', () => {
    renderMatchHeader();

    expect(screen.getByText('Canada')).toBeInTheDocument();
    expect(screen.getByText('CAN')).toBeInTheDocument();
    expect(screen.getByText('Brazil')).toBeInTheDocument();
    expect(screen.getByText('BRA')).toBeInTheDocument();

    expect(screen.getByAltText('Canada logo')).toHaveAttribute(
      'src',
      'https://example.com/canada.png',
    );
    expect(screen.getByAltText('Brazil logo')).toHaveAttribute(
      'src',
      'https://example.com/brazil.png',
    );

    expect(screen.getByText('Estadio Azteca')).toBeInTheDocument();
    expect(screen.getByText('Group A')).toBeInTheDocument();
    expect(screen.getByText('Status Badge: scheduled')).toBeInTheDocument();

    expect(screen.getByText(/^Jun 11, 2026,/)).toBeInTheDocument();
    expect(screen.getByText(/^Last updated:/)).toHaveTextContent(/1 minute ago/);
  });

  it('renders VS for scheduled matches even when scores are null', () => {
    renderMatchHeader();

    expect(screen.getByText('VS')).toBeInTheDocument();
  });

  it('renders live match score and elapsed status', () => {
    renderMatchHeader(
      makeMatch({
        status: 'live',
        elapsed: 67,
        team_a_score: 2,
        team_b_score: 1,
      }),
    );

    expect(screen.getByText('2 - 1')).toBeInTheDocument();
    expect(screen.getByText('Status Badge: live 67')).toBeInTheDocument();
  });

  it('renders zero scores correctly without treating them as missing', () => {
    renderMatchHeader(
      makeMatch({
        status: 'finished',
        team_a_score: 0,
        team_b_score: 0,
      }),
    );

    expect(screen.getByText('0 - 0')).toBeInTheDocument();
  });

  it('renders penalty score only when both penalty values are present', () => {
    renderMatchHeader(
      makeMatch({
        status: 'finished',
        team_a_score: 1,
        team_b_score: 1,
        team_a_penalties: 4,
        team_b_penalties: 3,
      }),
    );

    expect(screen.getByText('(4 - 3 pens)')).toBeInTheDocument();
  });

  it('does not render penalty score when only one penalty value is present', () => {
    renderMatchHeader(
      makeMatch({
        status: 'finished',
        team_a_score: 1,
        team_b_score: 1,
        team_a_penalties: 4,
        team_b_penalties: null,
      }),
    );

    expect(screen.queryByText(/pens/)).not.toBeInTheDocument();
  });

  it('does not render team logos when logo urls are null', () => {
    renderMatchHeader(
      makeMatch({
        team_a: {
          ...teamA,
          logo_url: null,
        },
        team_b: {
          ...teamB,
          logo_url: null,
        },
      }),
    );

    expect(screen.queryByAltText('Canada logo')).not.toBeInTheDocument();
    expect(screen.queryByAltText('Brazil logo')).not.toBeInTheDocument();
  });

  it('does not render venue when venue is null', () => {
    renderMatchHeader(makeMatch({ venue: null }));

    expect(screen.queryByText('Estadio Azteca')).not.toBeInTheDocument();
    expect(screen.getByText(/^Jun 11, 2026,/)).toBeInTheDocument();
  });

  it('uses configured stage label when group is null', () => {
    renderMatchHeader(
      makeMatch({
        stage: 'group',
        group: null,
      }),
    );

    expect(screen.getByText('Group')).toBeInTheDocument();
  });

  it('uses last_updated before last_successful_refresh when both metadata timestamps exist', () => {
    renderMatchHeader(
      baseMatch,
      makeMetadata({
        last_updated: '2026-06-11T19:09:00Z',
        last_successful_refresh: '2026-06-10T19:10:00Z',
      }),
    );

    expect(screen.getByText(/^Last updated:/)).toHaveTextContent(/1 minute ago/);
    expect(screen.getByText(/^Last updated:/)).not.toHaveTextContent(/1 day ago/);
  });

  it('falls back to last_successful_refresh when last_updated is null', () => {
    renderMatchHeader(
      baseMatch,
      makeMetadata({
        last_updated: null,
        last_successful_refresh: '2026-06-11T17:10:00Z',
      }),
    );

    expect(screen.getByText(/^Last updated:/)).toHaveTextContent(/2 hours ago/);
  });

  it('renders metadata message when a displayed timestamp exists', () => {
    renderMatchHeader(
      baseMatch,
      makeMetadata({
        is_delayed: true,
        message: 'Live match events may be delayed because the latest refresh failed.',
      }),
    );

    expect(
      screen.getByText('Live match events may be delayed because the latest refresh failed.'),
    ).toBeInTheDocument();
  });

  it('does not render freshness or message when both metadata timestamps are null', () => {
    renderMatchHeader(
      baseMatch,
      makeMetadata({
        last_updated: null,
        last_successful_refresh: null,
        message: 'This message should stay hidden without a timestamp.',
      }),
    );

    expect(screen.queryByText(/^Last updated:/)).not.toBeInTheDocument();
    expect(
      screen.queryByText('This message should stay hidden without a timestamp.'),
    ).not.toBeInTheDocument();
  });
});
