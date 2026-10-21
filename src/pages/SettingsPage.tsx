import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Trash2, Image as ImageIcon } from 'lucide-react';
import GameImagePicker from '../components/GameImagePicker';
import IconManager from '../components/IconManager';
import DeleteAccount from '../components/DeleteAccount';
import { useAppConfig, gameKey } from '../lib/appConfig';
import { myReports, deleteReport, MyReportsOutputType } from 'zitejs/api';
import { Button } from '@project/components/ui/button';
import { Badge } from '@project/components/ui/badge';
import { Skeleton } from '@project/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@project/components/ui/alert-dialog';
import ProfileCard from '../components/ProfileCard';
import ReportDetail from '../components/ReportDetail';
import { tabLabel } from '../lib/labels';

type Report = MyReportsOutputType['reports'][0];

export default function SettingsPage() {
  const [reports, setReports] = useState<Report[] | null>(null);
  const [open, setOpen] = useState<Report | null>(null);
  const [toDelete, setToDelete] = useState<Report | null>(null);
  const [pick, setPick] = useState<Report | null>(null);
  const { images } = useAppConfig();

  const load = () => myReports({}).then((r) => setReports(r.reports)).catch(() => setReports([]));
  useEffect(() => { load(); }, []);

  const confirmDelete = async () => {
    if (!toDelete) return;
    const r = toDelete;
    setToDelete(null);
    setReports((p) => p?.filter((x) => x !== r) ?? null);
    try {
      await deleteReport({ tab: r.tab, rowNumber: r.rowNumber, gameName: r.gameName });
      toast.success('Report deleted');
    } catch (e: any) {
      toast.error(e.message ?? 'Could not delete');
    }
    load();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile and the reports you've shared.</p>
      </div>
      <ProfileCard />
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">My reports {reports && <span className="font-mono text-sm text-primary">{reports.length}</span>}</h2>
        {!reports ? (
          <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        ) : reports.length === 0 ? (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">You haven't added any reports yet.</p>
        ) : (
          <ul className="divide-y overflow-hidden rounded-xl border bg-card">
            {reports.map((r) => (
              <li key={r.tab + r.rowNumber} className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-muted/40" onClick={() => setOpen(r)}>
                <div className="aspect-video w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                  {images[gameKey(r.gameName)] && <img src={images[gameKey(r.gameName)]} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{r.gameName || 'Untitled'}</p>
                  <p className="truncate text-xs text-muted-foreground">{tabLabel(r.tab)}{r.device && ` · ${r.device}`}{r.dateAdded && ` · ${r.dateAdded}`}</p>
                </div>
                {r.status && <Badge className="rounded-full border-transparent bg-primary/15 text-primary shadow-none">{r.status}</Badge>}
                <Button variant="ghost" size="icon" aria-label="Change image" onClick={(e) => { e.stopPropagation(); setPick(r); }}>
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Delete report" onClick={(e) => { e.stopPropagation(); setToDelete(r); }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <IconManager />
      <DeleteAccount />
      <GameImagePicker open={!!pick} onOpenChange={(o) => !o && setPick(null)} tab={pick?.tab ?? ''} gameName={pick?.gameName ?? ''} />
      <ReportDetail headers={open?.headers ?? []} row={open} onClose={() => setOpen(null)} />
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this report?</AlertDialogTitle>
            <AlertDialogDescription>"{toDelete?.gameName}" will be removed from the {toDelete && tabLabel(toDelete.tab)} sheet. This can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
