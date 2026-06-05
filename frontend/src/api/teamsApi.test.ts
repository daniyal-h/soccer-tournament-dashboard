import { describe, expect, it } from 'vitest';

import { isTeam } from './teamsApi';

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
    expect(isTeam(validTeam)).toBe(true);
  });

  it('allows null logo url', () => {
    expect(
      isTeam({
        ...validTeam,
        logo_url: null,
      }),
    ).toBe(true);
  });

  it('rejects null', () => {
    expect(isTeam(null)).toBe(false);
  });

  it('rejects non-object values', () => {
    expect(isTeam('team')).toBe(false);
    expect(isTeam(1)).toBe(false);
    expect(isTeam(true)).toBe(false);
    expect(isTeam(undefined)).toBe(false);
  });

  it('rejects invalid id', () => {
    expect(
      isTeam({
        ...validTeam,
        id: '1',
      }),
    ).toBe(false);
  });

  it('rejects missing id', () => {
    expect(isTeam(omitKey(validTeam, 'id'))).toBe(false);
  });

  it('rejects invalid name', () => {
    expect(
      isTeam({
        ...validTeam,
        name: null,
      }),
    ).toBe(false);
  });

  it('rejects missing name', () => {
    expect(isTeam(omitKey(validTeam, 'name'))).toBe(false);
  });

  it('rejects invalid short name', () => {
    expect(
      isTeam({
        ...validTeam,
        short_name: 123,
      }),
    ).toBe(false);
  });

  it('rejects missing short name', () => {
    expect(isTeam(omitKey(validTeam, 'short_name'))).toBe(false);
  });

  it('rejects invalid logo url', () => {
    expect(
      isTeam({
        ...validTeam,
        logo_url: 123,
      }),
    ).toBe(false);
  });

  it('rejects missing logo url', () => {
    expect(isTeam(omitKey(validTeam, 'logo_url'))).toBe(false);
  });
});
