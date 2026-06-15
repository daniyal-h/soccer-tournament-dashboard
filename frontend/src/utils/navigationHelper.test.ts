import { describe, expect, it } from 'vitest';

import { ROUTES } from '@/constants/navigation';

import { getBackLabel } from './navigationHelper';

describe('getBackLabel', () => {
  it.each([
    [ROUTES.TEAMS, 'Teams'],
    [ROUTES.SCHEDULE, 'Schedule'],
    [ROUTES.STANDINGS, 'Standings'],
  ])('returns %s label for %s route', (route, label) => {
    expect(getBackLabel(route)).toBe(label);
  });

  it.each(['/matches/1', '/matches/123', '/matches/999'])(
    'returns Match for dynamic match route %s',
    (route) => {
      expect(getBackLabel(route)).toBe('Match');
    },
  );

  it.each(['/teams/1', '/unknown', '', '/schedule/extra'])(
    'returns Previous Page for unknown route %s',
    (route) => {
      expect(getBackLabel(route)).toBe('Previous Page');
    },
  );

  it('does not treat partial match-like routes as match details', () => {
    expect(getBackLabel('/match/1')).toBe('Previous Page');
    expect(getBackLabel('/matches')).toBe('Previous Page');
    expect(getBackLabel('/matches-extra/1')).toBe('Previous Page');
  });
});
