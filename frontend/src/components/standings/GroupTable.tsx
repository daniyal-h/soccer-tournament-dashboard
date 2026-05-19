import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { COLUMNS, LEGEND } from '@/constants/standings';

import { type Standing } from '@/constants/standings';

interface GroupTableProps {
  rows: Standing[];
}

export function GroupTable({ rows }: GroupTableProps) {
  return (
    <Table>
      <TableHeader>
        {/* Include a header row of the columns */}
        <TableRow>
          <TableHead className="w-8">#</TableHead>
          <TableHead>Team</TableHead>
          {COLUMNS.map((col) => (
            <TableHead key={col.key} className="text-center">
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
            <TableCell>
              <div className="flex items-center gap-2">
                <img
                  src={row.team.logo_url}
                  alt={row.team.name}
                  className="h-5 w-5 object-contain"
                />
                <span className="font-medium">{row.team.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-center">{row.matches_played}</TableCell>
            <TableCell className="text-center">{row.wins}</TableCell>
            <TableCell className="text-center">{row.draws}</TableCell>
            <TableCell className="text-center">{row.losses}</TableCell>
            <TableCell className="text-center">{row.goals_for}</TableCell>
            <TableCell className="text-center">{row.goals_against}</TableCell>
            <TableCell className="text-center">{row.goal_difference}</TableCell>
            <TableCell className="text-center font-bold">{row.points}</TableCell>
          </TableRow>
        ))}
      </TableBody>

      {/* Include a legend in the footer */}
      <TableFooter>
        <TableRow>
          <TableCell colSpan={10}>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {LEGEND.map((item) => (
                <span key={item.abbr}>
                  {item.abbr} — {item.full}
                </span>
              ))}
            </div>
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
