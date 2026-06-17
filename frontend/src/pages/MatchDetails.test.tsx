import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import MatchDetails from './MatchDetails';

vi.mock('@/components/feedback/ErrorState', () => ({
  default: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="error-state">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  ),
}));

vi.mock('@/components/matchEvents/MatchDetailsContent', () => ({
  default: ({ matchId }: { matchId: number }) => (
    <section data-testid="match-details-content">Match ID: {matchId}</section>
  ),
}));

function LocationSnapshot() {
  const location = useLocation();

  return <div data-testid="location-pathname">{location.pathname}</div>;
}

function renderMatchDetails(
  initialEntries: (string | { pathname: string; state?: unknown })[],
  initialIndex = initialEntries.length - 1,
) {
  return render(
    <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
      <Routes>
        <Route path="/matches/:matchId" element={<MatchDetails />} />
        <Route path="/schedule" element={<LocationSnapshot />} />
        <Route path="/custom-return" element={<LocationSnapshot />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('MatchDetails', () => {
  it('renders the match details content with a parsed numeric match id', () => {
    renderMatchDetails(['/matches/42']);

    expect(screen.getByRole('button', { name: /back to schedule/i })).toBeInTheDocument();
    expect(screen.getByTestId('match-details-content')).toHaveTextContent('Match ID: 42');
    expect(screen.queryByTestId('error-state')).not.toBeInTheDocument();
  });

  it.each([
    ['non-numeric text', ['/matches/not-a-number']],
    ['zero', ['/matches/0']],
    ['negative number', ['/matches/-7']],
    ['decimal number', ['/matches/3.5']],
  ])('renders an error state for an invalid match id: %s', (_caseName, route) => {
    renderMatchDetails(route);

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Match Unavailable' })).toBeInTheDocument();
    expect(screen.getByText('Invalid match ID.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /back to schedule/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId('match-details-content')).not.toBeInTheDocument();
  });

  it('navigates back to the schedule page when no return route exists in location state', () => {
    renderMatchDetails(['/matches/12']);

    fireEvent.click(screen.getByRole('button', { name: /back to schedule/i }));

    expect(screen.getByTestId('location-pathname')).toHaveTextContent('/schedule');
  });

  it('navigates back to the route stored in location state when provided', () => {
    renderMatchDetails([{ pathname: '/matches/12', state: { from: '/custom-return' } }]);

    fireEvent.click(screen.getByRole('button', { name: 'Back to Previous Page' }));

    expect(screen.getByTestId('location-pathname')).toHaveTextContent('/custom-return');
  });

  it('treats numeric strings with leading zeros as valid positive integer ids', () => {
    renderMatchDetails(['/matches/007']);

    expect(screen.getByTestId('match-details-content')).toHaveTextContent('Match ID: 7');
    expect(screen.queryByTestId('error-state')).not.toBeInTheDocument();
  });

  it('navigates back to the previous route when browser history exists', () => {
    renderMatchDetails(['/schedule', { pathname: '/matches/12', state: { from: '/schedule' } }]);

    fireEvent.click(screen.getByRole('button', { name: /back to schedule/i }));

    expect(screen.getByTestId('location-pathname')).toHaveTextContent('/schedule');
  });

  it('navigates back to the previous custom route when location state exists', () => {
    renderMatchDetails([
      '/custom-return',
      { pathname: '/matches/12', state: { from: '/custom-return' } },
    ]);

    fireEvent.click(screen.getByRole('button', { name: 'Back to Previous Page' }));

    expect(screen.getByTestId('location-pathname')).toHaveTextContent('/custom-return');
  });

  it('falls back to the stored route when no browser history exists', () => {
    Object.defineProperty(globalThis.history, 'length', {
      configurable: true,
      value: 1,
    });

    renderMatchDetails([{ pathname: '/matches/12', state: { from: '/custom-return' } }]);

    fireEvent.click(screen.getByRole('button', { name: 'Back to Previous Page' }));

    expect(screen.getByTestId('location-pathname')).toHaveTextContent('/custom-return');
  });

  it('falls back to the schedule page when no return route exists', () => {
    Object.defineProperty(globalThis.history, 'length', {
      configurable: true,
      value: 1,
    });

    renderMatchDetails(['/matches/12']);

    fireEvent.click(screen.getByRole('button', { name: /back to schedule/i }));

    expect(screen.getByTestId('location-pathname')).toHaveTextContent('/schedule');
  });

  // scroll behaviour
  describe('scroll to top', () => {
    beforeEach(() => {
      vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        cb(0);
        return 0;
      });
      vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('scrolls to the top on initial mount', () => {
      act(() => {
        renderMatchDetails(['/matches/42']);
      });

      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' });
    });
    it('scrolls to the top again when navigating to a different match', () => {
      function NavigateTrigger({ to }: { to: string }) {
        const navigate = useNavigate();
        return <button onClick={() => navigate(to)}>go</button>;
      }

      act(() => {
        render(
          <MemoryRouter initialEntries={['/matches/42']}>
            <Routes>
              <Route path="/matches/:matchId" element={<MatchDetails />} />
            </Routes>
            <NavigateTrigger to="/matches/99" />
          </MemoryRouter>,
        );
      });

      const callsAfterMount = (window.scrollTo as ReturnType<typeof vi.spyOn>).mock.calls.length;

      act(() => {
        fireEvent.click(screen.getByRole('button', { name: 'go' }));
      });

      expect(window.scrollTo).toHaveBeenCalledTimes(callsAfterMount + 1);
    });

    it('scrolls to the top even when an invalid match id is provided', () => {
      act(() => {
        renderMatchDetails(['/matches/not-a-number']);
      });

      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' });
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });

    it('schedules the scroll with requestAnimationFrame', () => {
      act(() => {
        renderMatchDetails(['/matches/42']);
      });

      expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' });
    });

    it('cancels the scheduled scroll animation frame on unmount', () => {
      vi.mocked(window.requestAnimationFrame).mockImplementation(() => 123);

      const { unmount } = renderMatchDetails(['/matches/42']);

      unmount();

      expect(window.cancelAnimationFrame).toHaveBeenCalledExactlyOnceWith(123);
    });
  });
});
