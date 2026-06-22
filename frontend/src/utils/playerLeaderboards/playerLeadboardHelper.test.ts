import { describe, expect, it } from 'vitest';

import { formatMinutes, formatRating } from './playerLeaderboardsHelper';

describe('formatMinutes', () => {
  it('returns null when minutes is null', () => {
    expect(formatMinutes(null)).toBeNull();
  });

  it('formats zero minutes', () => {
    expect(formatMinutes(0)).toBe('0 min');
  });

  it('formats positive minutes', () => {
    expect(formatMinutes(597)).toBe('597 min');
  });
});

describe('formatRating', () => {
  it('returns null when rating is null', () => {
    expect(formatRating(null)).toBeNull();
  });

  it('formats zero rating to two decimal places', () => {
    expect(formatRating(0)).toBe('0.00');
  });

  it('formats whole number rating to two decimal places', () => {
    expect(formatRating(8)).toBe('8.00');
  });

  it('preserves two decimal places', () => {
    expect(formatRating(7.61)).toBe('7.61');
  });

  it('rounds ratings to two decimal places', () => {
    expect(formatRating(8.456)).toBe('8.46');
  });
});
