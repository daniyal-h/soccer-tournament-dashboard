import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Accordion } from '@/components/ui/accordion';

import type { PositionType } from '@/types/player';

import PositionSquadAccordion from './PositionSquadAccordion';

vi.mock('./SquadMemberCard', () => ({
  default: ({ member }: { member: { player: { id: number; display_name: string } } }) => (
    <div data-testid="squad-member-card">{member.player.display_name}</div>
  ),
}));

function makeMember(id: number, displayName: string) {
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
    position: 'GK' as PositionType,
  };
}

function renderAccordion(group: Parameters<typeof PositionSquadAccordion>[0]['group']) {
  return render(
    <Accordion type="single" collapsible defaultValue={group.position}>
      <PositionSquadAccordion group={group} />
    </Accordion>,
  );
}

describe('PositionSquadAccordion', () => {
  it('renders the readable position label in the accordion trigger', () => {
    renderAccordion({
      position: 'GK',
      squad: [makeMember(1, 'D. St. Clair')],
    });

    expect(screen.getByRole('button', { name: /goalkeepers/i })).toBeInTheDocument();
  });

  it('renders one squad member card per member', () => {
    renderAccordion({
      position: 'DEF',
      squad: [makeMember(1, 'A. Davies'), makeMember(2, 'M. Bombito')],
    });

    expect(screen.getByRole('button', { name: /defenders/i })).toBeInTheDocument();

    const cards = screen.getAllByTestId('squad-member-card');

    expect(cards).toHaveLength(2);
    expect(screen.getByText('A. Davies')).toBeInTheDocument();
    expect(screen.getByText('M. Bombito')).toBeInTheDocument();
  });

  it('renders no squad member cards when the group is empty', () => {
    renderAccordion({
      position: 'MID',
      squad: [],
    });

    expect(screen.getByRole('button', { name: /midfielders/i })).toBeInTheDocument();
    expect(screen.queryByTestId('squad-member-card')).not.toBeInTheDocument();
  });

  it('uses the group position as the accordion item value', () => {
    renderAccordion({
      position: 'FWD',
      squad: [makeMember(9, 'J. David')],
    });

    const trigger = screen.getByRole('button', { name: /forwards/i });

    expect(trigger).toHaveAttribute('data-state', 'open');
    expect(screen.getByText('J. David')).toBeInTheDocument();
  });
});
