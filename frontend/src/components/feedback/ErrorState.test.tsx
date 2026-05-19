import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ErrorState from './ErrorState';

describe('ErrorState', () => {
  it('renders default error content', () => {
    render(<ErrorState />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    expect(
      screen.getByText('An unexpected error occurred. Please try again later.'),
    ).toBeInTheDocument();
  });

  it('renders custom error content', () => {
    render(<ErrorState title="Failed to load standings" description="Please refresh the page." />);

    expect(screen.getByText('Failed to load standings')).toBeInTheDocument();

    expect(screen.getByText('Please refresh the page.')).toBeInTheDocument();
  });
});
