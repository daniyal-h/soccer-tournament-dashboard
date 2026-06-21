import { useEffect, useMemo, useRef } from 'react';
import { useNavigationType } from 'react-router-dom';

import { type MatchGroup } from '@/types/match';

import { Accordion } from '../ui/accordion';
import MatchDayAccordion from './MatchDayAccordion';

import { findNextUpcomingDayKey } from '@/utils/matches/matchCardHelper';

interface MatchScheduleProps {
  groupedMatches: MatchGroup[];
}

const MatchSchedule = ({ groupedMatches }: MatchScheduleProps) => {
  const navigationType = useNavigationType();
  const scrollTargetRef = useRef<HTMLDivElement>(null);

  // Stryker disable next-line ArrayDeclaration: empty list is a valid input; equivalent
  const nextDay = useMemo(() => findNextUpcomingDayKey(groupedMatches), [groupedMatches]);

  useEffect(() => {
    if (navigationType === 'POP') return;
    if (!groupedMatches.length) return;

    const firstMatch = groupedMatches[0].matches[0];
    const lastGroup = groupedMatches.at(-1)!;
    const lastMatch = lastGroup.matches.at(-1)!;
    const start = new Date(firstMatch.kickoff_time).getTime();
    const end = new Date(lastMatch.kickoff_time).getTime();
    const now = Date.now();

    const isLive = now >= start && now <= end;
    if (!isLive) return;

    // Stryker disable next-line StringLiteral, OptionalChaining: scroll options are visual behavior only
    scrollTargetRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Accordion
      type="multiple"
      defaultValue={groupedMatches.map((group) => group.day)}
      className="gap-6"
    >
      {groupedMatches.map((group) => (
        <div key={group.day} ref={group.day === nextDay ? scrollTargetRef : undefined}>
          <MatchDayAccordion day={group.day} matches={group.matches} />
        </div>
      ))}
    </Accordion>
  );
};

export default MatchSchedule;
