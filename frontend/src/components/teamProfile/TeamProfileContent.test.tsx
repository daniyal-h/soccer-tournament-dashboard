import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import TeamProfileContent from './TeamProfileContent';

vi.mock('./TeamOverviewSection', () => ({
  default: ({ teamId }: { teamId: number }) => (
    <section data-testid="team-overview-section">Overview {teamId}</section>
  ),
}));

vi.mock('./TeamJourneySection', () => ({
  default: ({ teamId }: { teamId: number }) => (
    <section data-testid="team-journey-section">Journey {teamId}</section>
  ),
}));

vi.mock('./TeamSquadSection', () => ({
  default: ({ teamId }: { teamId: number }) => (
    <section data-testid="team-squad-section">Squad {teamId}</section>
  ),
}));

describe('TeamProfileContent', () => {
  it('renders the overview and journey sections', () => {
    render(<TeamProfileContent teamId={34} />);

    expect(screen.getByTestId('team-overview-section')).toBeInTheDocument();
    expect(screen.getByTestId('team-journey-section')).toBeInTheDocument();
    expect(screen.getByTestId('team-squad-section')).toBeInTheDocument();
  });

  it('passes the team id to both child sections', () => {
    render(<TeamProfileContent teamId={34} />);

    expect(screen.getByTestId('team-overview-section')).toHaveTextContent('Overview 34');
    expect(screen.getByTestId('team-journey-section')).toHaveTextContent('Journey 34');
    expect(screen.getByTestId('team-squad-section')).toHaveTextContent('Squad 34');
  });
});
