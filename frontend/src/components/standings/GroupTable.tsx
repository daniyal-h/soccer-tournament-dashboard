import { useNavigate } from 'react-router-dom';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { type Standing } from '@/types/standing';

import { ROUTES } from '@/constants/navigation';
import { COLUMNS } from '@/constants/standings';

import { cn } from '@/lib/utils';

interface GroupTableProps {
  rows: Standing[];
}

/**
 * A table of given standings for a specific group of teams
 * Highlight top-two for non-zero-state standings
 */
export function GroupTable({ rows }: GroupTableProps) {
  const navigate = useNavigate();

  const openTeamProfile = (teamId: number) => {
    navigate(`/teams/${teamId}`, {
      state: { from: ROUTES.STANDINGS },
    });
  };

  return (
    <Table className="table-fixed text-xs sm:text-sm">
      <TableHeader>
        {/* Include a header row of the columns */}
        <TableRow>
          <TableHead className="w-4 md:w-6">#</TableHead>
          <TableHead className="w-16 sm:w-40">Team</TableHead>
          {COLUMNS.map((col) => (
            <TableHead
              key={col.key}
              className={
                // Stryker disable next-line StringLiteral, LogicalOperator, ConditionalExpression
                cn('w-6 md:w-10 text-center', col.mobileHidden && 'hidden min-[450px]:table-cell') // visual only
              }
            >
              {col.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      {/* Display each team and their stats, highlight top two */}
      <TableBody>
        {rows.map((row) => (
          <TableRow
            key={row.team.id}
            role="link"
            onClick={() => openTeamProfile(row.team.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                openTeamProfile(row.team.id);
              }
            }}
            className={cn(
              'cursor-pointer active:scale-[0.98] active:bg-accent',
              `${row.position === 1 || row.position === 2 ? 'bg-accent' : ''}`,
            )}
          >
            <TableCell className="text-muted-foreground">
              {row.position === 0 ? '-' : row.position}
            </TableCell>

            {/* Display the logo and name if space permits */}
            <TableCell className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                {row.team.logo_url && (
                  <img
                    src={row.team.logo_url}
                    alt={row.team.name}
                    className="h-4 w-4 md:h-5 md:w-5 shrink-0 object-contain"
                  />
                )}

                <span className="hidden sm:inline max-w-40 truncate font-medium">
                  {row.team.name}
                </span>

                <span className="sm:hidden font-medium">{row.team.short_name}</span>
              </div>
            </TableCell>

            {/* List out all stats defined by the columns, hide some if needed */}
            {COLUMNS.map((col) => (
              <TableCell
                key={col.key}
                className={cn(
                  // Stryker disable next-line StringLiteral: base table cell spacing/alignment is visual-only
                  'px-2 py-1 text-center',
                  // Stryker disable next-line StringLiteral, LogicalOperator, ConditionalExpression
                  col.mobileHidden && 'hidden min-[450px]:table-cell', // visual only
                  col.key === 'pts' && 'font-bold',
                )}
              >
                {/* Add a '+' prefix for positive goal differences */}
                {col.dataKey === 'goal_difference' && row[col.dataKey] > 0 ? '+' : ''}
                {row[col.dataKey]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
