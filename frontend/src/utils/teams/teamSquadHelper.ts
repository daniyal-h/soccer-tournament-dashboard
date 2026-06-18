import type { TeamMember, TeamPositionType, TeamSquadPositionGroup } from '@/types/team';


// Group the given matches by positions.
export function groupSquadByPosition(squad: TeamMember[]): TeamSquadPositionGroup[] {
  const groups = new Map<TeamPositionType, TeamMember[]>();

  // build the map with keys as positions
  for (const member of squad) {
    const memberPosition = member.position ?? 'UNKNOWN';
    const positionMember = groups.get(memberPosition) ?? [];

    positionMember.push(member);
    groups.set(memberPosition, positionMember);
  }

  // return in the image of the necessary interface
  return Array.from(groups.entries()).map(([position, positionMembers]) => ({
    position: position,
    squad: positionMembers,
  }));
}
