import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { NAV_ITEMS } from '@/constants/navigation';

import CompactNav from './CompactNav';
import InLineNav from './InLineNav';

function renderWithRouter(ui: React.ReactElement, initialEntry = '/') {
  return render(<MemoryRouter initialEntries={[initialEntry]}>{ui}</MemoryRouter>);
}

describe('InLineNav', () => {
  it('renders every navigation item as a link', () => {
    renderWithRouter(<InLineNav navItems={NAV_ITEMS} />);

    expect(screen.getByRole('link', { name: 'Standings' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Teams' })).toHaveAttribute('href', '/teams');
    expect(screen.getByRole('link', { name: 'Schedule' })).toHaveAttribute('href', '/schedule');
  });

  it('applies active styling to the current route', () => {
    renderWithRouter(<InLineNav navItems={NAV_ITEMS} />, '/teams');

    expect(screen.getByRole('link', { name: 'Teams' })).toHaveClass('bg-accent', 'text-foreground');

    expect(screen.getByRole('link', { name: 'Standings' })).toHaveClass('text-muted-foreground');
  });

  it('keeps Schedule active on match detail routes', () => {
    renderWithRouter(<InLineNav navItems={NAV_ITEMS} />, '/matches/123');

    expect(screen.getByRole('link', { name: 'Schedule' })).toHaveClass(
      'bg-accent',
      'text-foreground',
    );

    expect(screen.getByRole('link', { name: 'Teams' })).toHaveClass('text-muted-foreground');
  });

  it('keeps Teams active on team profile routes', () => {
    renderWithRouter(<InLineNav navItems={NAV_ITEMS} />, '/teams/10');

    expect(screen.getByRole('link', { name: 'Teams' })).toHaveClass('bg-accent', 'text-foreground');

    expect(screen.getByRole('link', { name: 'Schedule' })).toHaveClass('text-muted-foreground');
  });
});

function renderWithRoutes(initialEntry = '/teams') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <div>
        <h1 id="main-heading" tabIndex={-1}>
          Page heading
        </h1>
        <CompactNav navItems={NAV_ITEMS} />
        <Routes>
          <Route path="/" element={<div>Standings page</div>} />
          <Route path="/teams" element={<div>Teams page</div>} />
          <Route path="/schedule" element={<div>Schedule page</div>} />
        </Routes>
      </div>
    </MemoryRouter>,
  );
}

describe('CompactNav', () => {
  it('renders the sheet closed by default', () => {
    renderWithRouter(<CompactNav navItems={NAV_ITEMS} />);

    expect(screen.queryByText('Navigation')).not.toBeInTheDocument();
  });

  it('opens the mobile navigation sheet and renders nav links', async () => {
    const user = userEvent.setup();

    renderWithRouter(<CompactNav navItems={NAV_ITEMS} />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Standings' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Teams' })).toHaveAttribute('href', '/teams');
    expect(screen.getByRole('link', { name: 'Schedule' })).toHaveAttribute('href', '/schedule');
  });

  it('applies active styling inside the mobile sheet', async () => {
    const user = userEvent.setup();

    renderWithRouter(<CompactNav navItems={NAV_ITEMS} />, '/teams');

    await user.click(screen.getByRole('button'));

    expect(screen.getByRole('link', { name: 'Teams' })).toHaveClass('text-foreground');
    expect(screen.getByRole('link', { name: 'Standings' })).toHaveClass('text-muted-foreground');
  });

  it('keeps Schedule active inside the mobile sheet on match detail routes', async () => {
    const user = userEvent.setup();

    renderWithRouter(<CompactNav navItems={NAV_ITEMS} />, '/matches/123');

    await user.click(screen.getByRole('button'));

    expect(screen.getByRole('link', { name: 'Schedule' })).toHaveClass(
      'bg-accent',
      'text-foreground',
    );
    expect(screen.getByRole('link', { name: 'Teams' })).toHaveClass('text-muted-foreground');
  });

  it('keeps Teams active inside the mobile sheet on team profile routes', async () => {
    const user = userEvent.setup();

    renderWithRouter(<CompactNav navItems={NAV_ITEMS} />, '/teams/10');

    await user.click(screen.getByRole('button'));

    expect(screen.getByRole('link', { name: 'Teams' })).toHaveClass('bg-accent', 'text-foreground');
    expect(screen.getByRole('link', { name: 'Schedule' })).toHaveClass('text-muted-foreground');
  });

  it('closes the sheet when the route changes as a result of clicking a nav link', async () => {
    const user = userEvent.setup();

    renderWithRoutes('/teams');

    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Navigation')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Schedule' }));

    expect(await screen.findByText('Schedule page')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Navigation')).not.toBeInTheDocument();
    });
  });

  it('keeps the sheet open when navigating to the same route that is already active', async () => {
    const user = userEvent.setup();

    renderWithRoutes('/teams');

    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Navigation')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Teams' }));

    // pathname did not change, so the route-driven close effect should not fire
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  it('can be reopened after the route-driven close', async () => {
    const user = userEvent.setup();

    renderWithRoutes('/teams');

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('link', { name: 'Schedule' }));

    await waitFor(() => {
      expect(screen.queryByText('Navigation')).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  it('moves focus to the main heading instead of returning it to the trigger on close', async () => {
    const user = userEvent.setup();

    renderWithRoutes('/teams');

    const trigger = screen.getByRole('button');
    await user.click(trigger);
    await user.click(screen.getByRole('link', { name: 'Schedule' }));

    await waitFor(() => {
      expect(screen.queryByText('Navigation')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(document.getElementById('main-heading')).toHaveFocus();
    });

    expect(trigger).not.toHaveFocus();
  });
});
