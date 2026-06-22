import { describe, expect, it } from 'vitest';

import { isPlayerSummary } from './playersApi';

const validPlayer = {
  id: 1,
  display_name: 'L. Messi',
  first_name: 'Lionel',
  last_name: 'Messi',
  photo_url: 'https://example.com/messi.png',
  nationality: 'Argentina',
  date_of_birth: '1987-06-24',
  height: 170,
};

describe('isPlayerSummary', () => {
  it('returns true for a valid player summary with all fields populated', () => {
    expect(isPlayerSummary(validPlayer)).toBe(true);
  });

  it('returns true for a valid player summary with nullable optional profile fields', () => {
    expect(
      isPlayerSummary({
        ...validPlayer,
        first_name: null,
        last_name: null,
        photo_url: null,
        nationality: null,
        date_of_birth: null,
        height: null,
      }),
    ).toBe(true);
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['string', 'player'],
    ['number', 10],
    ['boolean', true],
    ['array', []],
  ])('returns false for non-object value: %s', (_label, value) => {
    expect(isPlayerSummary(value)).toBe(false);
  });

  it.each([
    ['id', '1'],
    ['id', null],
    ['id', undefined],
    ['display_name', 123],
    ['display_name', null],
    ['display_name', undefined],
    ['first_name', 123],
    ['first_name', undefined],
    ['last_name', 123],
    ['last_name', undefined],
    ['photo_url', 123],
    ['photo_url', undefined],
    ['nationality', 123],
    ['nationality', undefined],
    ['date_of_birth', 123],
    ['date_of_birth', undefined],
    ['height', '170'],
    ['height', undefined],
  ])('returns false when %s has invalid value %s', (field, value) => {
    expect(
      isPlayerSummary({
        ...validPlayer,
        [field]: value,
      }),
    ).toBe(false);
  });

  it.each([
    ['id'],
    ['display_name'],
    ['first_name'],
    ['last_name'],
    ['photo_url'],
    ['nationality'],
    ['date_of_birth'],
    ['height'],
  ])('returns false when %s is missing', (field) => {
    const player = { ...validPlayer };
    delete player[field as keyof typeof player];

    expect(isPlayerSummary(player)).toBe(false);
  });
});
