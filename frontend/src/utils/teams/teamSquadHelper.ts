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

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);
}

export function getAge(dateOfBirth: string) {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  const age = today.getFullYear() - birthDate.getFullYear();

  const birthdayPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  return birthdayPassed ? age : age - 1;
}
