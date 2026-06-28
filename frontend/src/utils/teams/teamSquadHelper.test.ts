import { describe, expect, it, vi } from 'vitest';

import type { TeamMember } from '@/types/team';

import { getAge, getInitials, groupSquadByPosition } from './teamSquadHelper';

function makeMember(
  id: number,
  position: TeamMember['position'],
  displayName = `Player ${id}`,
): TeamMember {
  return {
    player: {
      id,
      display_name: displayName,
      first_name: null,
      last_name: null,
      photo_url: null,
      nationality: null,
      date_of_birth: null,
      height: null,
    },
    squad_number: id,
    position,
  };
}

describe('groupSquadByPosition', () => {
  it('groups squad members by position while preserving first-seen group order', () => {
    const goalkeeper = makeMember(1, 'GK');
    const defender = makeMember(2, 'DEF');
    const secondGoalkeeper = makeMember(3, 'GK');
    const forward = makeMember(4, 'FWD');

    expect(groupSquadByPosition([goalkeeper, defender, secondGoalkeeper, forward])).toEqual([
      {
        position: 'GK',
        squad: [goalkeeper, secondGoalkeeper],
      },
      {
        position: 'DEF',
        squad: [defender],
      },
      {
        position: 'FWD',
        squad: [forward],
      },
    ]);
  });

  it('groups null positions under UNKNOWN', () => {
    const unknown = makeMember(1, null);
    const defender = makeMember(2, 'DEF');

    expect(groupSquadByPosition([unknown, defender])).toEqual([
      {
        position: 'UNKNOWN',
        squad: [unknown],
      },
      {
        position: 'DEF',
        squad: [defender],
      },
    ]);
  });

  it('returns an empty array for an empty squad', () => {
    expect(groupSquadByPosition([])).toEqual([]);
  });

  it('does not mutate the input squad', () => {
    const squad = [makeMember(1, 'GK'), makeMember(2, null)];
    const original = structuredClone(squad);

    groupSquadByPosition(squad);

    expect(squad).toEqual(original);
  });
});

describe('getInitials', () => {
  it('returns the first two initials from a multi-word name', () => {
    expect(getInitials('Alphonso Davies')).toBe('AD');
  });

  it('uses only the first two words when more than two words are present', () => {
    expect(getInitials('Dayne Tristan St. Clair')).toBe('DT');
  });

  it('returns one initial for a single-word name', () => {
    expect(getInitials('Neymar')).toBe('N');
  });

  it('returns an empty string for an empty name', () => {
    expect(getInitials('')).toBe('');
  });
});

describe('getAge', () => {
  it('returns age when birthday has already passed this year', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-03T12:00:00Z'));

    expect(getAge('2000-11-02')).toBe(26);

    vi.useRealTimers();
  });

  it('returns age when birthday is today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-02T12:00:00Z'));

    expect(getAge('2000-11-02')).toBe(26);

    vi.useRealTimers();
  });

  it('subtracts one when birthday has not happened yet this year', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-30T12:00:00Z'));

    expect(getAge('2000-11-02')).toBe(25);

    vi.useRealTimers();
  });

  it('handles birthday earlier in the year', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T12:00:00Z'));

    expect(getAge('2000-01-15')).toBe(26);

    vi.useRealTimers();
  });

  it('does not treat a birthday later this month as already passed', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-01T00:00:00Z'));

    expect(getAge('2000-11-02')).toBe(25);

    vi.useRealTimers();
  });
});
