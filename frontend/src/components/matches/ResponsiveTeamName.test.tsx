import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ResponsiveTeamName from './ResponsiveTeamName';

describe('ResponsiveTeamName', () => {
  it('renders the full team name for wider screens', () => {
    render(<ResponsiveTeamName name="Canada" shortName="CAN" />);

    expect(screen.getByText('Canada')).toBeInTheDocument();
    expect(screen.getByText('Canada')).toHaveClass('hidden', 'min-[400px]:inline', 'truncate');
  });

  it('renders the short team name for narrow screens', () => {
    render(<ResponsiveTeamName name="Canada" shortName="CAN" />);

    expect(screen.getByText('CAN')).toBeInTheDocument();
    expect(screen.getByText('CAN')).toHaveClass('inline', 'min-[400px]:hidden');
  });

  it('applies custom className to both name variants', () => {
    render(
      <ResponsiveTeamName
        name="Canada"
        shortName="CAN"
        className="font-semibold text-muted-foreground"
      />,
    );

    expect(screen.getByText('Canada')).toHaveClass('font-semibold', 'text-muted-foreground');
    expect(screen.getByText('CAN')).toHaveClass('font-semibold', 'text-muted-foreground');
  });

  it('keeps the full name hidden below 400px and the short name hidden at 400px and above', () => {
    render(<ResponsiveTeamName name="Argentina" shortName="ARG" />);

    expect(screen.getByText('Argentina')).toHaveClass('hidden');
    expect(screen.getByText('Argentina')).toHaveClass('min-[400px]:inline');

    expect(screen.getByText('ARG')).toHaveClass('inline');
    expect(screen.getByText('ARG')).toHaveClass('min-[400px]:hidden');
  });
});
