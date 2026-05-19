import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import LoadingState from './LoadingState';

describe('LoadingState', () => {
  it('renders the default loading message', () => {
    render(<LoadingState />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders a custom loading message', () => {
    render(<LoadingState message="Fetching standings..." />);

    expect(screen.getByText('Fetching standings...')).toBeInTheDocument();
  });
});
