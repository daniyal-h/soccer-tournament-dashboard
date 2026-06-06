import { type MatchGroup } from '@/types/match';

import { Accordion } from '../ui/accordion';
import MatchDayAccordion from './MatchDayAccordion';

interface MatchScheduleProps {
  groupedMatches: MatchGroup[];
}

const MatchSchedule = ({ groupedMatches }: MatchScheduleProps) => {
  return (
    <Accordion
      type="multiple"
      defaultValue={groupedMatches.map((group) => group.day)}
      className="gap-6"
    >
      {groupedMatches.map((group) => (
        <MatchDayAccordion key={group.day} day={group.day} matches={group.matches} />
      ))}
    </Accordion>
  );
};

export default MatchSchedule;
