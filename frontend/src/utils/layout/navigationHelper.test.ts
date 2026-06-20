import { describe, expect, it } from 'vitest';

import { ROUTES } from '@/constants/navigation';

import { getBackLabel, isNavItemActive } from './navigationHelper';

describe('isNavItemActive', () => {
  it('marks schedule active only for schedule and match detail routes', () => {
    expect(isNavItemActive('/schedule', '/schedule')).toBe(true);
    expect(isNavItemActive('/matches/123', '/schedule')).toBe(true);

    expect(isNavItemActive('/', '/schedule')).toBe(false);
    expect(isNavItemActive('/teams', '/schedule')).toBe(false);
    expect(isNavItemActive('/schedule/extra', '/schedule')).toBe(false);
  });

  it('marks non-schedule nav items active for exact and nested routes', () => {
    expect(isNavItemActive('/teams', '/teams')).toBe(true);
    expect(isNavItemActive('/teams/123', '/teams')).toBe(true);

    expect(isNavItemActive('/team', '/teams')).toBe(false);
    expect(isNavItemActive('/standings', '/teams')).toBe(false);
  });

  it('does not treat match details as active for non-schedule nav items', () => {
    expect(isNavItemActive('/matches/123', '/teams')).toBe(false);
    expect(isNavItemActive('/matches/123', '/')).toBe(false);
  });
});

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
