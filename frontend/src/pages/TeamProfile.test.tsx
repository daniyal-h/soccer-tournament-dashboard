import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ROUTES } from '@/constants/navigation';

import TeamProfile from './TeamProfile';

const mockNavigate = vi.fn();

let mockTeamId: string | undefined;
let mockLocationState: unknown;

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({
    teamId: mockTeamId,
  }),
  useLocation: () => ({
    state: mockLocationState,
  }),
}));

vi.mock('@/components/teamProfile/TeamProfileContent', () => ({
  default: ({ teamId }: { teamId: number }) => (
    <div data-testid="team-profile-content">Team profile content {teamId}</div>
  ),
}));

vi.mock('@/components/feedback/ErrorState', () => ({
  default: ({ title, description }: { title: string; description: string }) => (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  ),
}));

describe('TeamProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTeamId = '12';
    mockLocationState = undefined;

    vi.spyOn(globalThis.history, 'length', 'get').mockReturnValue(1);
  });

  it('renders the team profile content with a parsed numeric team id', () => {
    render(<TeamProfile />);

    expect(screen.getByTestId('team-profile-content')).toHaveTextContent('Team profile content 12');
  });

  it.each(['abc', '12.5', '0', '-1', '', 'NaN', 'Infinity'])(
    'renders an error state for invalid team id %s',
    (teamId) => {
      mockTeamId = teamId;

      render(<TeamProfile />);

      expect(screen.getByRole('heading', { name: 'Team Profile Unavailable' })).toBeInTheDocument();
      expect(screen.getByText('Invalid team ID.')).toBeInTheDocument();
      expect(screen.queryByTestId('team-profile-content')).not.toBeInTheDocument();
    },
  );

  it('renders an error state when the team id param is missing', () => {
    mockTeamId = undefined;

    render(<TeamProfile />);

    expect(screen.getByRole('heading', { name: 'Team Profile Unavailable' })).toBeInTheDocument();
    expect(screen.getByText('Invalid team ID.')).toBeInTheDocument();
    expect(screen.queryByTestId('team-profile-content')).not.toBeInTheDocument();
  });

  it('renders the back button', () => {
    render(<TeamProfile />);

    expect(screen.getByRole('button', { name: /back to teams/i })).toBeInTheDocument();
  });

  it('navigates back when there is browser history', async () => {
    vi.spyOn(globalThis.history, 'length', 'get').mockReturnValue(2);

    render(<TeamProfile />);

    await userEvent.click(screen.getByRole('button', { name: /back to teams/i }));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('navigates to teams page when there is no browser history', async () => {
    vi.spyOn(globalThis.history, 'length', 'get').mockReturnValue(1);

    render(<TeamProfile />);

    await userEvent.click(screen.getByRole('button', { name: /back to teams/i }));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.TEAMS);
  });

  it('uses the route from location state as the fallback back route', async () => {
    const from = ROUTES.STANDINGS;
    mockLocationState = { from };

    vi.spyOn(globalThis.history, 'length', 'get').mockReturnValue(1);

    render(<TeamProfile />);

    await userEvent.click(screen.getByRole('button', { name: 'Back to Standings' }));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(from);
  });

  it('prefers browser history over the location state fallback route', async () => {
    mockLocationState = { from: ROUTES.SCHEDULE };

    vi.spyOn(globalThis.history, 'length', 'get').mockReturnValue(2);

    render(<TeamProfile />);

    await userEvent.click(screen.getByRole('button', { name: 'Back to Schedule' }));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('does not render the back button for invalid team ids', () => {
    mockTeamId = 'invalid';

    render(<TeamProfile />);

    expect(screen.queryByRole('button', { name: /back to teams/i })).not.toBeInTheDocument();
  });

  it.each([
    [undefined, 'Back to Teams'],
    [{ from: ROUTES.TEAMS }, 'Back to Teams'],
    [{ from: ROUTES.SCHEDULE }, 'Back to Schedule'],
    [{ from: ROUTES.STANDINGS }, 'Back to Standings'],
    [{ from: '/matches/123' }, 'Back to Match'],
    [{ from: '/unknown' }, 'Back to Previous Page'],
  ])('renders dynamic back label for location state %#', (state, label) => {
    mockLocationState = state;

    render(<TeamProfile />);

    expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
  });

  it.each([{ from: null }, { from: 123 }, { from: true }, { from: {} }, { from: [] }])(
    'falls back to Teams label for invalid from state %#',
    (state) => {
      mockLocationState = state;

      render(<TeamProfile />);

      expect(screen.getByRole('button', { name: 'Back to Teams' })).toBeInTheDocument();
    },
  );
});
