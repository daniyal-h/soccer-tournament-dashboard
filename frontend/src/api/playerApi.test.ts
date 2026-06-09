import { describe, expect, it } from 'vitest';

import { isPlayerSummary } from './playersApi';

const validPlayer = {
  id: 1,
  first_name: 'Lionel',
  last_name: 'Messi',
  photo_url: 'https://example.com/messi.png',
};

describe('isPlayerSummary', () => {
  it('returns true for a valid player summary with a photo URL', () => {
    expect(isPlayerSummary(validPlayer)).toBe(true);
  });

  it('returns true for a valid player summary with a null photo URL', () => {
    expect(isPlayerSummary({ ...validPlayer, photo_url: null })).toBe(true);
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['string', 'player'],
    ['number', 10],
    ['boolean', true],
    ['array', []],
  ])('returns false for %s', (_label, value) => {
    expect(isPlayerSummary(value)).toBe(false);
  });

  it.each([
    ['id', '1'],
    ['id', null],
    ['first_name', 123],
    ['first_name', null],
    ['last_name', 123],
    ['last_name', null],
    ['photo_url', 123],
    ['photo_url', undefined],
  ])('returns false when %s has invalid value %s', (field, value) => {
    expect(
      isPlayerSummary({
        ...validPlayer,
        [field]: value,
      }),
    ).toBe(false);
  });

  it.each([['id'], ['first_name'], ['last_name'], ['photo_url']])(
    'returns false when %s is missing',
    (field) => {
      const player = { ...validPlayer };
      delete player[field as keyof typeof player];

      expect(isPlayerSummary(player)).toBe(false);
    },
  );
});
