import { describe, expect, it } from 'vitest';

import { cn } from './utils';

describe('cn', () => {
  it('merges class names together', () => {
    expect(cn('flex', 'items-center')).toBe('flex items-center');
  });

  it('removes conflicting tailwind classes', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('ignores falsy values', () => {
    expect(cn('flex', false, undefined, null, '')).toBe('flex');
  });

  it('supports conditional objects', () => {
    expect(
      cn({
        flex: true,
        hidden: false,
      }),
    ).toBe('flex');
  });
});
