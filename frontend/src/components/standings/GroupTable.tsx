import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { COLUMNS } from '@/constants/standings';

import { type Standing } from '@/types/standings';

import { cn } from '@/lib/utils';

interface GroupTableProps {
  rows: Standing[];
}

export function GroupTable({ rows }: GroupTableProps) {
  return (
    <Table className="text-xs sm:text-sm">
      <TableHeader>
        {/* Include a header row of the columns */}
        <TableRow>
          <TableHead className="w-8">#</TableHead>
          <TableHead>Team</TableHead>
          {COLUMNS.map((col) => (
            <TableHead
              key={col.key}
              className={cn('text-center', col.mobileHidden && 'hidden sm:table-cell')}
            >
              {col.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      {/* Display each team and their stats, highlight top two */}
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.team.id} className={`${row.position <= 2 ? 'bg-accent' : ''}`}>
            <TableCell className="text-muted-foreground">{row.position}</TableCell>

            {/* Display the logo and name if space permits */}
            <TableCell className="min-w-0 px-2 py-1">
              <div className="flex min-w-0 items-center gap-2">
                <img
                  src={row.team.logo_url}
                  alt={row.team.name}
                  className="h-4 w-4 shrink-0 object-contain"
                />

                <span className="hidden sm:inline max-w-32 truncate font-medium">
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
                  'px-2 py-1 text-center',
                  col.mobileHidden && 'hidden sm:table-cell',
                  col.key === 'pts' && 'font-bold',
                )}
              >
                {row[col.dataKey]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
