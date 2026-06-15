import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import TeamProfileHeader from './TeamProfileHeader';

const teamProfile = {
  team: {
    id: 1,
    name: 'Canada',
    short_name: 'CAN',
    logo_url: 'https://example.com/canada.png',
  },
  group: 'B',
  standing: null,
};

describe('TeamProfileHeader', () => {
  it('renders the team name, short name, and group', () => {
    render(<TeamProfileHeader teamProfile={teamProfile} />);

    expect(screen.getByRole('heading', { name: 'Canada' })).toBeInTheDocument();
    expect(screen.getByText('CAN')).toBeInTheDocument();
    expect(screen.getByText('Group B')).toBeInTheDocument();
  });

  it('renders the team logo when logo_url exists', () => {
    render(<TeamProfileHeader teamProfile={teamProfile} />);

    const logo = screen.getByRole('img', { name: 'Canada logo' });

    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'https://example.com/canada.png');
  });

  it.each([null, ''])('does not render a logo when logo_url is %s', (logoUrl) => {
    render(
      <TeamProfileHeader
        teamProfile={{
          ...teamProfile,
          team: {
            ...teamProfile.team,
            logo_url: logoUrl,
          },
        }}
      />,
    );

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Canada' })).toBeInTheDocument();
  });

  it('uses the team name in the logo alt text', () => {
    render(
      <TeamProfileHeader
        teamProfile={{
          ...teamProfile,
          team: {
            ...teamProfile.team,
            name: 'Japan',
            short_name: 'JPN',
            logo_url: 'https://example.com/japan.png',
          },
          group: 'E',
        }}
      />,
    );

    expect(screen.getByRole('img', { name: 'Japan logo' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Japan' })).toBeInTheDocument();
    expect(screen.getByText('JPN')).toBeInTheDocument();
    expect(screen.getByText('Group E')).toBeInTheDocument();
  });
});
