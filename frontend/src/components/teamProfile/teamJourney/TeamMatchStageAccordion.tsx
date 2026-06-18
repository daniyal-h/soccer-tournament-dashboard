import MatchCard from '@/components/matches/MatchCard';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import type { TeamMatchStageGroup } from '@/types/team';

import { ROUTES } from '@/constants/navigation';

interface TeamMatchStageAccordionProps {
  group: TeamMatchStageGroup;
}

const TeamMatchStageAccordion = ({ group }: TeamMatchStageAccordionProps) => {
  return (
    <AccordionItem value={group.stage}>
      <AccordionTrigger className="py-2 cursor-pointer">
        <span className="text-lg font-medium text-muted-foreground">{group.label}</span>
      </AccordionTrigger>

      <AccordionContent className="px-1 pt-2 pb-4">
        <div className="grid gap-4 md:grid-cols-2">
          {group.matches.map((match) => (
            <MatchCard key={match.id} match={match} variant="nested" from={ROUTES.TEAMS} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default TeamMatchStageAccordion;
