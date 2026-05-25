import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import CompactNav from './CompactNav';
import DesktopNav from './DesktopNav';
import QuickNav from './QuickNav';

const navItems = [
  { label: 'Standings', to: '/standings' },
  { label: 'Teams', to: '/teams' },
  { label: 'Matches', to: '/matches' },
];

function renderWithRouter(ui: React.ReactElement, initialEntry = '/standings') {
  return render(<MemoryRouter initialEntries={[initialEntry]}>{ui}</MemoryRouter>);
}

describe('DesktopNav', () => {
  it('renders every navigation item as a link', () => {
    renderWithRouter(<DesktopNav navItems={navItems} />);

    expect(screen.getByRole('link', { name: 'Standings' })).toHaveAttribute('href', '/standings');
    expect(screen.getByRole('link', { name: 'Teams' })).toHaveAttribute('href', '/teams');
    expect(screen.getByRole('link', { name: 'Matches' })).toHaveAttribute('href', '/matches');
  });

  it('applies active styling to the current route', () => {
    renderWithRouter(<DesktopNav navItems={navItems} />, '/teams');

    expect(screen.getByRole('link', { name: 'Teams' })).toHaveClass(
      'bg-accent',
      'text-accent-foreground',
    );

    expect(screen.getByRole('link', { name: 'Standings' })).toHaveClass('text-muted-foreground');
  });
});

describe('QuickNav', () => {
  it('renders every quick navigation item as a link', () => {
    renderWithRouter(<QuickNav navItems={navItems} />);

    expect(screen.getByRole('link', { name: 'Standings' })).toHaveAttribute('href', '/standings');
    expect(screen.getByRole('link', { name: 'Teams' })).toHaveAttribute('href', '/teams');
    expect(screen.getByRole('link', { name: 'Matches' })).toHaveAttribute('href', '/matches');
  });

  it('applies active styling to the current route', () => {
    renderWithRouter(<QuickNav navItems={navItems} />, '/matches');

    expect(screen.getByRole('link', { name: 'Matches' })).toHaveClass(
      'bg-accent',
      'text-accent-foreground',
    );

    expect(screen.getByRole('link', { name: 'Teams' })).toHaveClass('text-muted-foreground');
  });
});

describe('CompactNav', () => {
  it('opens the mobile navigation sheet and renders nav links', async () => {
    const user = userEvent.setup();

    renderWithRouter(<CompactNav navItems={navItems} />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Standings' })).toHaveAttribute('href', '/standings');
    expect(screen.getByRole('link', { name: 'Teams' })).toHaveAttribute('href', '/teams');
    expect(screen.getByRole('link', { name: 'Matches' })).toHaveAttribute('href', '/matches');
  });

  it('applies active styling inside the mobile sheet', async () => {
    const user = userEvent.setup();

    renderWithRouter(<CompactNav navItems={navItems} />, '/teams');

    await user.click(screen.getByRole('button'));

    expect(screen.getByRole('link', { name: 'Teams' })).toHaveClass('text-foreground');

    expect(screen.getByRole('link', { name: 'Standings' })).toHaveClass('text-muted-foreground');
  });

  it('closes the mobile sheet after clicking a navigation link', async () => {
    const user = userEvent.setup();

    renderWithRouter(<CompactNav navItems={navItems} />, '/teams');

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('Navigation')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Teams' }));

    await waitFor(() => {
      expect(screen.queryByText('Navigation')).not.toBeInTheDocument();
    });
  });
});
