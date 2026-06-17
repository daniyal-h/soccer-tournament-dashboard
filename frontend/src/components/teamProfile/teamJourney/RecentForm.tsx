import type { MatchFormResult } from '@/types/team';

import { FORM_LABELS } from '@/constants/teams';

import { cn } from '@/lib/utils';

interface RecentFormProps {
  form: MatchFormResult[];
}

const RecentForm = ({ form }: RecentFormProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">Last Five Matches</h3>

      {form.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {form.map((result, index) => (
            <div
              key={`${result}-${index}`}
              className="flex flex-col items-center gap-2"
              title={FORM_LABELS[result]}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-sm font-black',
                  result === 'W' &&
                    'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
                  result === 'D' && 'bg-accent text-muted-foreground',
                  result === 'L' && 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
                )}
              >
                {result}
              </div>

              <span className="text-xs text-muted-foreground">{FORM_LABELS[result]}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No completed matches yet.</p>
      )}
    </div>
  );
};

export default RecentForm;
