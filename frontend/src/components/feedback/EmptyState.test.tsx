import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('renders default empty state content', () => {
    render(<EmptyState />);

    expect(screen.getByText('No data available')).toBeInTheDocument();

    expect(screen.getByText('There is currently nothing to display.')).toBeInTheDocument();
  });

  it('renders custom empty state content', () => {
    render(<EmptyState title="No matches found" description="Try another tournament." />);

    expect(screen.getByText('No matches found')).toBeInTheDocument();

    expect(screen.getByText('Try another tournament.')).toBeInTheDocument();
  });
});
