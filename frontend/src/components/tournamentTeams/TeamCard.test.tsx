import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import type { TournamentTeam } from '@/types/tournamentTeam';

import { MATCH_STAGE_LABELS } from '@/constants/matches';
import { ROUTES } from '@/constants/navigation';
import { RANK_CARD_STYLES } from '@/constants/tournamentTeams';

import TeamCard from './TeamCard';

function createTournamentTeam(overrides: Partial<TournamentTeam> = {}): TournamentTeam {
  return {
    team: {
      id: 10,
      name: 'Argentina',
      short_name: 'ARG',
      logo_url: 'https://example.com/argentina.png',
    },
    group: 'A',
    final_rank: null,
    stage_reached: null,
    ...overrides,
  };
}

function renderTeamCard(tournamentTeam: TournamentTeam) {
  return render(
    <MemoryRouter>
      <TeamCard tournamentTeam={tournamentTeam} />
    </MemoryRouter>,
  );
}

function LocationStateProbe() {
  const location = useLocation();

  return <div data-testid="location-state">{JSON.stringify(location.state)}</div>;
}

describe('TeamCard', () => {
  it('renders the team name and links to the team page', () => {
    renderTeamCard(createTournamentTeam());

    const link = screen.getByRole('link');

    expect(screen.getByText('Argentina')).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/teams/10');
  });

  it('renders the group and default ranking label when team is unranked', () => {
    renderTeamCard(
      createTournamentTeam({
        group: 'B',
        final_rank: null,
        stage_reached: null,
      }),
    );

    expect(screen.getByText('Group B · Not ranked yet')).toBeInTheDocument();
  });

  it('renders Group TBD when group is null', () => {
    renderTeamCard(
      createTournamentTeam({
        group: null,
      }),
    );

    expect(screen.getByText('Group TBD · Not ranked yet')).toBeInTheDocument();
  });

  it('renders final rank before stage label when final rank exists', () => {
    renderTeamCard(
      createTournamentTeam({
        final_rank: 1,
        stage_reached: 'final',
      }),
    );

    expect(screen.getByText('Group A · Rank #1')).toBeInTheDocument();
    expect(screen.queryByText(`Group A · ${MATCH_STAGE_LABELS.final}`)).not.toBeInTheDocument();
  });

  it('renders stage label when stage is reached but final rank is missing', () => {
    renderTeamCard(
      createTournamentTeam({
        final_rank: null,
        stage_reached: 'semi_final',
      }),
    );

    expect(screen.getByText(`Group A · ${MATCH_STAGE_LABELS.semi_final}`)).toBeInTheDocument();
  });

  it('renders the team logo as a decorative background image when logo exists', () => {
    const { container } = renderTeamCard(createTournamentTeam());

    const image = container.querySelector('img');

    expect(image).toHaveAttribute('src', 'https://example.com/argentina.png');
    expect(image).toHaveAttribute('alt', '');
    expect(image).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not render a background image when logo is null', () => {
    renderTeamCard(
      createTournamentTeam({
        team: {
          id: 10,
          name: 'Argentina',
          short_name: 'ARG',
          logo_url: null,
        },
      }),
    );

    expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
  });

  it('applies rank card style for top ranked teams', () => {
    const { container } = renderTeamCard(
      createTournamentTeam({
        final_rank: 1,
      }),
    );

    const card = container.querySelector('[data-slot="card"]');

    expect(card).toHaveClass(...RANK_CARD_STYLES[1].split(' '));
  });

  it('does not apply a rank card style when final rank is null', () => {
    const { container } = renderTeamCard(
      createTournamentTeam({
        final_rank: null,
      }),
    );

    const card = container.querySelector('[data-slot="card"]');

    expect(card).not.toHaveClass(...RANK_CARD_STYLES[1].split(' '));
    expect(card).not.toHaveClass(...RANK_CARD_STYLES[2].split(' '));
    expect(card).not.toHaveClass(...RANK_CARD_STYLES[3].split(' '));
  });

  it('does not apply rank card style for active progress teams without final rank', () => {
    const { container } = renderTeamCard(
      createTournamentTeam({
        final_rank: null,
        stage_reached: 'semi_final',
      }),
    );

    const card = container.querySelector('[data-slot="card"]');

    expect(screen.getByText(`Group A · ${MATCH_STAGE_LABELS.semi_final}`)).toBeInTheDocument();
    expect(card).not.toHaveClass(...RANK_CARD_STYLES[1].split(' '));
    expect(card).not.toHaveClass(...RANK_CARD_STYLES[2].split(' '));
    expect(card).not.toHaveClass(...RANK_CARD_STYLES[3].split(' '));
  });

  it('keeps the clickable affordance styling on the card', () => {
    const { container } = renderTeamCard(createTournamentTeam());

    const card = container.querySelector('[data-slot="card"]');

    expect(card).toHaveClass(
      'relative',
      'w-full',
      'cursor-pointer',
      'overflow-hidden',
      'shadow-sm',
      'transition-all',
      'hover:bg-accent',
      'hover:shadow-md',
      'active:scale-[0.98]',
      'active:bg-accent',
    );
  });

  it('preserves navigation state back to the teams page', () => {
    renderTeamCard(createTournamentTeam());

    const link = screen.getByRole('link');

    expect(link).toHaveAttribute('href', '/teams/10');

    // React Router state is not exposed as a DOM attribute.
    // This test still protects the user-facing navigation target.
    expect(ROUTES.TEAMS).toBe('/teams');
  });

  it('passes teams route in link state when navigating to team profile', () => {
    render(
      <MemoryRouter initialEntries={[ROUTES.TEAMS]}>
        <Routes>
          <Route
            path={ROUTES.TEAMS}
            element={<TeamCard tournamentTeam={createTournamentTeam()} />}
          />
          <Route path="/teams/:teamId" element={<LocationStateProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('link'));

    expect(screen.getByTestId('location-state')).toHaveTextContent(
      JSON.stringify({ from: ROUTES.TEAMS }),
    );
  });
});
