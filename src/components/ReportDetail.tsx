import { ExternalLink } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@project/components/ui/sheet';
import { Badge } from '@project/components/ui/badge';
import { isFieldVisible } from '../lib/labels';
import { useAppConfig, gameKey } from '../lib/appConfig';

type Row = { rowNumber: number; values: string[]; detail?: { headers: string[]; values: string[] } };

export default function ReportDetail({ headers: baseHeaders, row, onClose }: { headers: string[]; row: Row | null; onClose: () => void }) {
  const { images } = useAppConfig();
  // Home entries carry the full original record from their source tab
  const headers = row?.detail?.headers ?? baseHeaders;
  const values = row?.detail?.values ?? row?.values ?? [];
  const titleIdx = Math.max(0, headers.findIndex((h) => h.toLowerCase() === 'game name'));
  const statusIdx = headers.findIndex((h) => h.toLowerCase() === 'status');
  return (
    <Sheet open={!!row} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {row && (
          <>
            {images[gameKey(values[titleIdx] ?? '')] && (
              <img src={images[gameKey(values[titleIdx] ?? '')]} alt="" className="mb-4 mt-6 aspect-video w-full rounded-lg object-cover" />
            )}
            <SheetHeader className="space-y-2 border-b pb-4 text-left">
              <SheetTitle className="text-2xl">{values[titleIdx] || 'Report'}</SheetTitle>
              <SheetDescription className="flex items-center gap-2">
                {statusIdx >= 0 && values[statusIdx] && (
                  <Badge className="rounded-full border-transparent bg-primary/15 text-primary shadow-none">{values[statusIdx]}</Badge>
                )}
              </SheetDescription>
            </SheetHeader>
            <dl className="divide-y">
              {headers.map((h, i) => i !== titleIdx && h && h.toLowerCase() !== 'row number' && isFieldVisible(h, (k) => values[headers.indexOf(k)]) && (
                <div key={h + i} className="py-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{h}</dt>
                  <dd className="mt-1 whitespace-pre-wrap break-words text-sm">
                    {!values[i] ? <span className="text-muted-foreground">—</span>
                      : /^https?:\/\//.test(values[i]) ? (
                        <a href={values[i]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 break-all text-primary hover:underline">
                          {values[i]} <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      ) : values[i]}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
