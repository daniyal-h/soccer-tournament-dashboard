import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import RecentForm from './RecentForm';

describe('RecentForm', () => {
  it('renders the section title', () => {
    render(<RecentForm form={['W']} />);

    expect(screen.getByText('Last Five Matches')).toBeInTheDocument();
  });

  it('renders win, draw, and loss badges with labels', () => {
    render(<RecentForm form={['W', 'D', 'L']} />);

    expect(screen.getByText('W')).toBeInTheDocument();
    expect(screen.getByText('Win')).toBeInTheDocument();

    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.getByText('Draw')).toBeInTheDocument();

    expect(screen.getByText('L')).toBeInTheDocument();
    expect(screen.getByText('Loss')).toBeInTheDocument();
  });

  it('applies result-specific styling', () => {
    render(<RecentForm form={['W', 'D', 'L']} />);

    expect(screen.getByText('W')).toHaveClass('bg-green-100', 'text-green-800');
    expect(screen.getByText('D')).toHaveClass('bg-accent', 'text-muted-foreground');
    expect(screen.getByText('L')).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('sets accessible hover titles on result containers', () => {
    render(<RecentForm form={['W', 'D', 'L']} />);

    expect(screen.getByTitle('Win')).toBeInTheDocument();
    expect(screen.getByTitle('Draw')).toBeInTheDocument();
    expect(screen.getByTitle('Loss')).toBeInTheDocument();
  });

  it('renders duplicate results separately', () => {
    render(<RecentForm form={['W', 'W', 'L']} />);

    expect(screen.getAllByText('W')).toHaveLength(2);
    expect(screen.getAllByText('Win')).toHaveLength(2);
    expect(screen.getByText('L')).toBeInTheDocument();
  });

  it('renders an empty message when there is no form', () => {
    render(<RecentForm form={[]} />);

    expect(screen.getByText('No completed matches yet.')).toBeInTheDocument();
    expect(screen.queryByText('W')).not.toBeInTheDocument();
    expect(screen.queryByText('D')).not.toBeInTheDocument();
    expect(screen.queryByText('L')).not.toBeInTheDocument();
  });
});
