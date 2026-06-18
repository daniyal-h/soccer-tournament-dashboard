import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import type { TeamSquadPositionGroup } from '@/types/team';

import { POSITION_LABELS } from '@/constants/teams';

import SquadMemberCard from './SquadMemberCard';

interface PositionSquadAccordionProps {
  group: TeamSquadPositionGroup;
}

const PositionSquadAccordion = ({ group }: PositionSquadAccordionProps) => {
  return (
    <AccordionItem value={group.position}>
      <AccordionTrigger className="py-2">
        <span className="text-lg font-medium text-muted-foreground">
          {POSITION_LABELS[group.position]}
        </span>
      </AccordionTrigger>

      <AccordionContent className="px-1 pt-2 pb-4">
        <div className="grid gap-4 md:grid-cols-2">
          {group.squad.map((member) => (
            <SquadMemberCard key={member.player.id} member={member} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default PositionSquadAccordion;
