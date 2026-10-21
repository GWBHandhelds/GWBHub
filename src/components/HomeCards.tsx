import { useState } from 'react';
import { Badge } from '@project/components/ui/badge';
import { Button } from '@project/components/ui/button';
import { useAppConfig, gameKey } from '../lib/appConfig';

type Row = { rowNumber: number; values: string[]; detail?: { headers: string[]; values: string[] } };
const PAGE = 24;

export default function HomeCards({ headers, rows, onClick }: { headers: string[]; rows: Row[]; onClick: (r: Row) => void }) {
  const [page, setPage] = useState(0);
  const { images } = useAppConfig();
  const idx = (n: string) => headers.findIndex((h) => h.toLowerCase() === n);
  const [name, status, src, date, by] = ['game name', 'status', 'source', 'date added', 'uploaded by'].map(idx);
  const sorted = [...rows].reverse();
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE));
  const cur = Math.min(page, pages - 1);
  const shown = sorted.slice(cur * PAGE, cur * PAGE + PAGE);
  if (!rows.length) return <p className="py-10 text-center text-muted-foreground">No entries found.</p>;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((r, i) => (
          <button key={r.rowNumber + '-' + i} onClick={() => onClick(r)}
            className="flex flex-col gap-3 overflow-hidden rounded-xl border bg-card text-left transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
            <div className="aspect-video w-full bg-muted">
              {images[gameKey(r.values[Math.max(0, name)] ?? '')] && (
                <img src={images[gameKey(r.values[Math.max(0, name)] ?? '')]} alt="" loading="lazy" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-3 px-4 pb-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 font-semibold">{r.values[Math.max(0, name)] || 'Untitled'}</h3>
              {status >= 0 && r.values[status] && <Badge className="shrink-0 rounded-full border-transparent bg-primary/15 text-primary shadow-none">{r.values[status]}</Badge>}
            </div>
            <div className="mt-auto space-y-1 text-xs text-muted-foreground">
              {src >= 0 && r.values[src] && <p className="truncate">{r.values[src]}</p>}
              <div className="flex justify-between gap-2">
                {by >= 0 && <span className="truncate">{r.values[by] ? `by ${r.values[by]}` : ''}</span>}
                {date >= 0 && <span className="shrink-0 font-mono">{r.values[date]}</span>}
              </div>
            </div>
            </div>
          </button>
        ))}
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
