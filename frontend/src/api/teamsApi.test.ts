import { describe, expect, it } from 'vitest';

import { isTeamSummary } from './teamsApi';

function omitKey<T extends Record<string, unknown>, K extends keyof T>(
  object: T,
  key: K,
): Omit<T, K> {
  const copy = { ...object };
  delete copy[key];
  return copy;
}

describe('isTeam', () => {
  const validTeam = {
    id: 1,
    name: 'Canada',
    short_name: 'CAN',
    logo_url: 'https://example.com/canada.png',
  };

  it('returns true for a valid team', () => {
    expect(isTeamSummary(validTeam)).toBe(true);
  });

  it('allows null logo url', () => {
    expect(
      isTeamSummary({
        ...validTeam,
        logo_url: null,
      }),
    ).toBe(true);
  });

  it('rejects null', () => {
    expect(isTeamSummary(null)).toBe(false);
  });

  it('rejects non-object values', () => {
    expect(isTeamSummary('team')).toBe(false);
    expect(isTeamSummary(1)).toBe(false);
    expect(isTeamSummary(true)).toBe(false);
    expect(isTeamSummary(undefined)).toBe(false);
  });

  it('rejects invalid id', () => {
    expect(
      isTeamSummary({
        ...validTeam,
        id: '1',
      }),
    ).toBe(false);
  });

  it('rejects missing id', () => {
    expect(isTeamSummary(omitKey(validTeam, 'id'))).toBe(false);
  });

  it('rejects invalid name', () => {
    expect(
      isTeamSummary({
        ...validTeam,
        name: null,
      }),
    ).toBe(false);
  });

  it('rejects missing name', () => {
    expect(isTeamSummary(omitKey(validTeam, 'name'))).toBe(false);
  });

  it('rejects invalid short name', () => {
    expect(
      isTeamSummary({
        ...validTeam,
        short_name: 123,
      }),
    ).toBe(false);
  });

  it('rejects missing short name', () => {
    expect(isTeamSummary(omitKey(validTeam, 'short_name'))).toBe(false);
  });

  it('rejects invalid logo url', () => {
    expect(
      isTeamSummary({
        ...validTeam,
        logo_url: 123,
      }),
    ).toBe(false);
  });

  it('rejects missing logo url', () => {
    expect(isTeamSummary(omitKey(validTeam, 'logo_url'))).toBe(false);
  });
});
