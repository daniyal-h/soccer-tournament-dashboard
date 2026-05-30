import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import type { Match } from '@/types/matches';

import MatchCard from './MatchCard';

interface MatchDayAccordionProps {
  day: string;
  matches: Match[];
}

const MatchDayAccordion = ({ day, matches }: MatchDayAccordionProps) => {
  return (
    <AccordionItem value={day}>
      <AccordionTrigger className="py-2">
        <span className="text-muted-foreground text-lg font-medium">{day}</span>
      </AccordionTrigger>
      <AccordionContent className="px-1 pt-2 pb-4">
        <div className="grid gap-4 md:grid-cols-2">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default MatchDayAccordion;
