import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

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

  it('does not render an action button by default', () => {
    render(<ErrorState />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders an action button when onAction is provided', () => {
    render(<ErrorState onAction={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('uses custom action label when provided', () => {
    render(<ErrorState onAction={vi.fn()} actionLabel="Reload standings" />);

    expect(screen.getByRole('button', { name: 'Reload standings' })).toBeInTheDocument();
  });

  it('calls onAction when the action button is clicked', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(<ErrorState onAction={onAction} />);

    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
