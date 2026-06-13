import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { MatchStage } from '@/types/match';

import { TEAM_STAGE_LABELS } from '@/constants/tournamentTeams';
import { type StageFilter } from '@/constants/tournamentTeams';

interface TeamFiltersProps {
  groups: string[];
  stages: MatchStage[];
  selectedGroup: string;
  selectedStage: string;
  onGroupChange: (group: string) => void;
  onStageChange: (stage: StageFilter) => void;
}

const TeamFilters = ({
  groups,
  stages,
  selectedGroup,
  selectedStage,
  onGroupChange,
  onStageChange,
}: TeamFiltersProps) => {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row">
      <Select value={selectedGroup} onValueChange={onGroupChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Group..." />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All Groups</SelectItem>

          {groups.map((group) => (
            <SelectItem key={group} value={group}>
              Group {group}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedStage} onValueChange={(value) => onStageChange(value as StageFilter)}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Stage..." />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All Stages</SelectItem>

          {stages.map((stage) => (
            <SelectItem key={stage} value={stage}>
              {TEAM_STAGE_LABELS[stage]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TeamFilters;
