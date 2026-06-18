import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { PositionType } from '@/types/player';

import SquadMemberCard from './SquadMemberCard';

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  AvatarImage: ({ src, alt }: { src?: string; alt?: string }) => <img src={src} alt={alt} />,
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="avatar-fallback">{children}</span>
  ),
}));

function makeMember(overrides = {}) {
  return {
    player: {
      id: 1,
      display_name: 'A. Davies',
      first_name: 'Alphonso',
      last_name: 'Davies',
      photo_url: 'https://example.com/davies.png',
      nationality: 'Canada',
      date_of_birth: '2000-11-02',
      height: 183,
    },
    squad_number: 19,
    position: 'DEF' as PositionType,
    ...overrides,
  };
}

describe('SquadMemberCard', () => {
  it('renders player photo, display name, squad number, position, and details', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-03T12:00:00Z'));

    render(<SquadMemberCard member={makeMember()} />);

    expect(screen.getByRole('img', { name: 'A. Davies' })).toHaveAttribute(
      'src',
      'https://example.com/davies.png',
    );
    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('AD');
    expect(screen.getByText('#19')).toBeInTheDocument();
    expect(screen.getByText('A. Davies')).toBeInTheDocument();
    expect(screen.getByText('DEF')).toBeInTheDocument();
    expect(screen.getByText('Alphonso Davies')).toBeInTheDocument();
    expect(screen.getByText('Canada')).toBeInTheDocument();
    expect(screen.getByText('183 cm')).toBeInTheDocument();
    expect(screen.getByText('26 yrs')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('does not render full name when it matches display name', () => {
    render(
      <SquadMemberCard
        member={makeMember({
          player: {
            ...makeMember().player,
            display_name: 'Alphonso Davies',
            first_name: 'Alphonso',
            last_name: 'Davies',
          },
        })}
      />,
    );

    expect(screen.getAllByText('Alphonso Davies')).toHaveLength(1);
  });

  it('renders available partial full name', () => {
    render(
      <SquadMemberCard
        member={makeMember({
          player: {
            ...makeMember().player,
            first_name: null,
            last_name: 'Davies',
          },
        })}
      />,
    );

    expect(screen.getByText('Davies')).toBeInTheDocument();
  });

  it('hides nullable optional fields when missing', () => {
    render(
      <SquadMemberCard
        member={makeMember({
          squad_number: null,
          position: null,
          player: {
            ...makeMember().player,
            first_name: null,
            last_name: null,
            photo_url: null,
            nationality: null,
            date_of_birth: null,
            height: null,
          },
        })}
      />,
    );

    expect(screen.getByText('A. Davies')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('AD');

    expect(screen.queryByText('#19')).not.toBeInTheDocument();
    expect(screen.queryByText('DEF')).not.toBeInTheDocument();
    expect(screen.queryByText('Alphonso Davies')).not.toBeInTheDocument();
    expect(screen.queryByText('Canada')).not.toBeInTheDocument();
    expect(screen.queryByText('183 cm')).not.toBeInTheDocument();
    expect(screen.queryByText(/yrs/)).not.toBeInTheDocument();
  });

  it('does not render squad number zero because the UI treats it as unavailable', () => {
    render(<SquadMemberCard member={makeMember({ squad_number: 0 })} />);

    expect(screen.queryByText('#0')).not.toBeInTheDocument();
  });

  it('renders initials for multi-word display names', () => {
    render(
      <SquadMemberCard
        member={makeMember({
          player: {
            ...makeMember().player,
            display_name: 'Dayne St. Clair',
          },
        })}
      />,
    );

    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('DS');
  });
});
