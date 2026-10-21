import { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@project/components/ui/table';
import { Button } from '@project/components/ui/button';
import { Badge } from '@project/components/ui/badge';
import { ArrowUpDown, ExternalLink } from 'lucide-react';
import { cn } from '@project/components/lib/utils';

type Row = { rowNumber: number; values: string[] };
const PAGE = 20;

const statusColor = (v: string) => {
  const s = v.toLowerCase();
  if (['perfect', 'full', 'latest'].includes(s)) return 'bg-primary/15 text-primary';
  if (['good', 'playable', 'partial'].includes(s)) return 'bg-[hsl(var(--warning)/0.15)] text-[hsl(var(--warning))]';
  if (['broken', 'none', 'unplayable'].includes(s)) return 'bg-destructive/20 text-[hsl(var(--danger-text))]';
  return 'bg-secondary text-secondary-foreground';
};

function Cell({ header, value }: { header: string; value: string }) {
  if (/^https?:\/\//.test(value))
    return (
      <a href={value} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1 text-primary hover:underline">
        Open <ExternalLink className="h-3 w-3" />
      </a>
    );
  if (value && /status|controller/i.test(header))
    return <Badge className={cn('whitespace-nowrap rounded-full border-transparent shadow-none', statusColor(value))}>{value}</Badge>;
  return <>{value}</>;
}

export default function ReportTable({ headers, rows, onRowClick }: { headers: string[]; rows: Row[]; onRowClick?: (r: Row) => void }) {
  const [sort, setSort] = useState<{ col: number; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sort) return [...rows].reverse();
    return [...rows].sort((a, b) => a.values[sort.col].localeCompare(b.values[sort.col], undefined, { numeric: true }) * sort.dir);
  }, [rows, sort]);
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE));
  const cur = Math.min(page, pages - 1);
  const shown = sorted.slice(cur * PAGE, cur * PAGE + PAGE);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((h, i) => (
                <TableHead key={h + i} className="h-11 whitespace-nowrap bg-muted/40 text-xs uppercase tracking-wide">
                  <button className="inline-flex items-center gap-1 font-semibold hover:text-foreground"
                    onClick={() => setSort((s) => ({ col: i, dir: s?.col === i && s.dir === 1 ? -1 : 1 }))}>
                    {h} <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.length === 0 ? (
              <TableRow><TableCell colSpan={headers.length} className="py-10 text-center text-muted-foreground">No reports found.</TableCell></TableRow>
            ) : shown.map((r) => (
              <TableRow key={r.rowNumber} className="cursor-pointer" onClick={() => onRowClick?.(r)}>
                {r.values.map((v, i) => (
                  <TableCell key={i} className={cn('max-w-xs truncate', i === 0 && 'font-semibold')}>
                    <Cell header={headers[i]} value={v} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
          <span className="font-mono">{cur + 1} / {pages}</span>
          <Button variant="outline" size="sm" disabled={cur === 0} onClick={() => setPage(cur - 1)}>Prev</Button>
          <Button variant="outline" size="sm" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}