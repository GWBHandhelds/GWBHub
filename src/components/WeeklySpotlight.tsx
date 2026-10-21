import { useEffect, useState } from 'react';
import { weeklySpotlight, WeeklySpotlightOutputType } from 'zitejs/api';
import { Avatar, AvatarFallback, AvatarImage } from '@project/components/ui/avatar';
import { Skeleton } from '@project/components/ui/skeleton';
import { Trophy } from 'lucide-react';

export default function WeeklySpotlight() {
  const [list, setList] = useState<WeeklySpotlightOutputType['contributors'] | null>(null);
  useEffect(() => { weeklySpotlight({}).then((r) => setList(r.contributors)).catch(() => setList([])); }, []);
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-lg font-semibold"><Trophy className="h-5 w-5 text-primary" />Weekly Spotlight</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {!list ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl bg-muted" />)
          : list.length === 0 ? <p className="col-span-full text-sm text-muted-foreground">No contributions yet this week.</p>
          : list.map((c, i) => (
            <div key={c.name} className="relative flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center">
              <span className="absolute left-3 top-2 font-mono text-xs text-muted-foreground">#{i + 1}</span>
              <Avatar className="h-14 w-14">
                {c.image && <AvatarImage src={c.image} alt={c.name} />}
                <AvatarFallback>{c.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <p className="w-full truncate font-semibold">{c.name}</p>
              <p className="text-xs text-muted-foreground"><span className="font-mono text-primary">{c.count}</span> contribution{c.count === 1 ? '' : 's'}</p>
            </div>
          ))}
      </div>
    </section>
  );
}