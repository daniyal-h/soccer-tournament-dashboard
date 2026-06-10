import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import Navbar from './Navbar';

vi.mock('./TournamentSelector', () => ({
  default: () => <div>Tournament Selector</div>,
}));

vi.mock('./ThemeToggle', () => ({
  default: () => <button>Theme Toggle</button>,
}));

describe('Navbar', () => {
  it('renders navigation content', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    );

    expect(screen.getByText('Soccer Dashboard')).toBeInTheDocument();

    expect(screen.getByText('Tournament Selector')).toBeInTheDocument();

    expect(screen.getAllByText('Theme Toggle')).toHaveLength(3);
  });
});
