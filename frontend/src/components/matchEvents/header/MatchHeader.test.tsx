import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import MatchHeader from '@/components/matchEvents/header/MatchHeader';

import type { Match } from '@/types/match';

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

function makeMatch(overrides: Partial<Match> = {}): Match {
  return {
    ...baseMatch,
    ...overrides,
  };
}

describe('MatchHeader', () => {
  it('renders team names, short names, logos, venue, stage, status, and kickoff date', () => {
    render(<MatchHeader match={baseMatch} />);

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
  });

  it('renders VS for scheduled matches even when scores are null', () => {
    render(<MatchHeader match={baseMatch} />);

    expect(screen.getByText('VS')).toBeInTheDocument();
  });

  it('renders live match score and elapsed status', () => {
    render(
      <MatchHeader
        match={makeMatch({
          status: 'live',
          elapsed: 67,
          team_a_score: 2,
          team_b_score: 1,
        })}
      />,
    );

    expect(screen.getByText('2 - 1')).toBeInTheDocument();
    expect(screen.getByText('Status Badge: live 67')).toBeInTheDocument();
  });

  it('renders zero scores correctly without treating them as missing', () => {
    render(
      <MatchHeader
        match={makeMatch({
          status: 'finished',
          team_a_score: 0,
          team_b_score: 0,
        })}
      />,
    );

    expect(screen.getByText('0 - 0')).toBeInTheDocument();
  });

  it('renders penalty score only when both penalty values are present', () => {
    render(
      <MatchHeader
        match={makeMatch({
          status: 'finished',
          team_a_score: 1,
          team_b_score: 1,
          team_a_penalties: 4,
          team_b_penalties: 3,
        })}
      />,
    );

    expect(screen.getByText('(4 - 3 pens)')).toBeInTheDocument();
  });

  it('does not render penalty score when only one penalty value is present', () => {
    render(
      <MatchHeader
        match={makeMatch({
          status: 'finished',
          team_a_score: 1,
          team_b_score: 1,
          team_a_penalties: 4,
          team_b_penalties: null,
        })}
      />,
    );

    expect(screen.queryByText(/pens/)).not.toBeInTheDocument();
  });

  it('does not render team logos when logo urls are null', () => {
    render(
      <MatchHeader
        match={makeMatch({
          team_a: {
            ...teamA,
            logo_url: null,
          },
          team_b: {
            ...teamB,
            logo_url: null,
          },
        })}
      />,
    );

    expect(screen.queryByAltText('Canada logo')).not.toBeInTheDocument();
    expect(screen.queryByAltText('Brazil logo')).not.toBeInTheDocument();
  });

  it('does not render venue when venue is null', () => {
    render(<MatchHeader match={makeMatch({ venue: null })} />);

    expect(screen.queryByText('Estadio Azteca')).not.toBeInTheDocument();
    expect(screen.getByText(/^Jun 11, 2026,/)).toBeInTheDocument();
  });

  it('uses configured stage label when group is null', () => {
    render(
      <MatchHeader
        match={makeMatch({
          stage: 'group',
          group: null,
        })}
      />,
    );

    expect(screen.getByText('Group')).toBeInTheDocument();
  });
});
