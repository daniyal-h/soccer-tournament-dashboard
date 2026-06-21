import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Legend from './Legend';

describe('Legend', () => {
  it('renders visible legend items', () => {
    render(<Legend />);

    expect(screen.getByText('W')).toBeInTheDocument();
    expect(screen.getByText('Wins')).toBeInTheDocument();
    expect(screen.getByText('Pts')).toBeInTheDocument();
    expect(screen.getByText('Points')).toBeInTheDocument();
  });

  it('hides secondary legend items on mobile', () => {
    render(<Legend />);

    expect(screen.getByText('MP').parentElement).toHaveClass('hidden');
    expect(screen.getByText('GA').parentElement).toHaveClass('hidden');
    expect(screen.getByText('GF').parentElement).toHaveClass('hidden');
  });

  it('renders primary legend items as inline-flex', () => {
    render(<Legend />);

    expect(screen.getByText('W').parentElement).toHaveClass('inline-flex');
    expect(screen.getByText('Pts').parentElement).toHaveClass('inline-flex');
  });
});
