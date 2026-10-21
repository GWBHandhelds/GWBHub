import { useEffect, useMemo, useState } from 'react';
import { getTab, GetTabOutputType } from 'zitejs/api';
import { Input } from '@project/components/ui/input';
import { Button } from '@project/components/ui/button';
import { Skeleton } from '@project/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { Search, X } from 'lucide-react';
import ReportTable from './ReportTable';
import ReportDetail from './ReportDetail';
import HomeCards from './HomeCards';
import WeeklySpotlight from './WeeklySpotlight';
import AddReportDialog from './AddReportDialog';
import { tabLabel, TabIcons } from '../lib/labels';
const ALL = '__all__';
export default function TabPage({
  tab,
  readOnly
}: {
  tab: string;
  readOnly: boolean;
}) {
  const [data, setData] = useState<GetTabOutputType | null>(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<{ rowNumber: number; values: string[]; detail?: { headers: string[]; values: string[] } } | null>(null);
  const load = () => getTab({
    tab
  }).then(setData).catch(e => setError(e.message ?? 'Failed to load'));
  useEffect(() => {
    load();
  }, [tab]);
  const filterDefs = useMemo(() => {
    if (!data) return [];
    return data.filterColumns.map(h => {
      const c = data.headers.indexOf(h);
      const present = new Set(data.rows.map(r => r.values[c]).filter(Boolean));
      const opts = data.options[h]?.length ? data.options[h] : [...present].sort();
      return {
        h,
        c,
        opts: [...new Set([...opts, ...present])].filter(Boolean)
      };
    });
  }, [data]);
  const rows = useMemo(() => {
    if (!data) return [];
    const s = q.toLowerCase();
    return data.rows.filter(r => (!s || r.values.some(v => v.toLowerCase().includes(s))) && filterDefs.every(f => !filters[f.h] || r.values[f.c] === filters[f.h]));
  }, [data, q, filters, filterDefs]);
  return <div className="space-y-6">
      {readOnly && <>
          <p className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Play more, tinker less.</p>
          <WeeklySpotlight />
        </>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
            <TabIcons tab={tab} className="h-7 w-7 text-primary" />{tabLabel(tab)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {readOnly ? 'Recently added games across all sheets.' : 'Community compatibility reports.'}
            {data && <span className="ml-2 font-mono text-primary">{rows.length} of {data.rows.length} entries</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" className="pl-9" />
          </div>
          {!readOnly && data && <AddReportDialog tab={tab} headers={data.headers} options={data.options} suggestions={data.suggestions} onAdded={load} />}
        </div>
      </div>
      {!readOnly && filterDefs.length > 0 && <div className="flex flex-wrap items-center gap-2">
          {filterDefs.map(f => <Select key={f.h} value={filters[f.h] || ALL} onValueChange={v => setFilters(p => ({
        ...p,
        [f.h]: v === ALL ? '' : v
      }))}>
              <SelectTrigger className='h-9 w-auto min-w-[160px] max-w-[260px] shadow-sm'><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All {f.h}</SelectItem>
                {f.opts.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>)}
          {Object.values(filters).some(Boolean) && <Button variant="ghost" size="sm" onClick={() => setFilters({})}><X className="mr-1 h-4 w-4" />Clear</Button>}
        </div>}
      {error ? <p className="text-destructive">{error}</p> : !data ? <div className="overflow-hidden rounded-xl border bg-card">
          <div className="h-11 border-b bg-muted/40" />
          {Array.from({
        length: 8
      }).map((_, i) => <div key={i} className="flex gap-6 border-b px-4 py-3.5 last:border-0">
              {[30, 20, 15, 12, 10].map((w, j) => <Skeleton key={j} className="h-4 bg-muted" style={{
          width: `${w}%`
        }} />)}
            </div>)}
        </div> : <>
          {readOnly ? <HomeCards headers={data.headers} rows={rows} onClick={setSelected} />
            : <ReportTable headers={data.headers} rows={rows} onRowClick={setSelected} />}
          <ReportDetail headers={data.headers} row={selected} onClose={() => setSelected(null)} />
        </>}
    </div>;
}