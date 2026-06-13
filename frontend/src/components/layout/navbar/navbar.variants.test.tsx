import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
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

describe('CompactNav', () => {
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

  it('closes the mobile sheet after clicking a navigation link', async () => {
    const user = userEvent.setup();

    renderWithRouter(<CompactNav navItems={NAV_ITEMS} />, '/teams');

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('Navigation')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Teams' }));

    await waitFor(() => {
      expect(screen.queryByText('Navigation')).not.toBeInTheDocument();
    });
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
});
