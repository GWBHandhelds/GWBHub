import { useState } from 'react';
import { toast } from 'sonner';
import { Upload, RotateCcw, Loader2 } from 'lucide-react';
import { useUpload } from 'zitejs/upload';
import { setIcon } from 'zitejs/api';
import { Button } from '@project/components/ui/button';
import { useAppConfig } from '../lib/appConfig';
import { tabLabel, TabIcons } from '../lib/labels';

function IconRow({ iconKey, label, preview }: { iconKey: string; label: string; preview: React.ReactNode }) {
  const { icons, refresh } = useAppConfig();
  const { upload } = useUpload();
  const [busy, setBusy] = useState(false);
  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); await refresh(); toast.success('Icon updated'); }
    catch (e: any) { toast.error(e.message ?? 'Could not update icon'); }
    finally { setBusy(false); }
  };
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) run(async () => { const { url } = await upload(file); await setIcon({ iconKey, imageUrl: url }); });
  };
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span className="grid h-9 w-9 place-items-center">{preview}</span>
      <span className="flex-1 font-medium">{label}</span>
      {icons[iconKey] && (
        <Button variant="ghost" size="sm" disabled={busy} onClick={() => run(() => setIcon({ iconKey, imageUrl: null }))}>
          <RotateCcw className="mr-1 h-4 w-4" />Reset
        </Button>
      )}
      <Button variant="outline" size="sm" disabled={busy} asChild>
        <label className="cursor-pointer">
          {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Upload className="mr-1 h-4 w-4" />}Upload
          <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={busy} />
        </label>
      </Button>
    </li>
  );
}

export default function IconManager() {
  const { isAdmin, tabs, icons } = useAppConfig();
  if (!isAdmin) return null;
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Custom icons <span className="text-xs font-normal text-primary">Admin</span></h2>
        <p className="text-sm text-muted-foreground">Replace the logo or any menu tab icon with your own image.</p>
      </div>
      <ul className="divide-y overflow-hidden rounded-xl border bg-card">
        <IconRow iconKey="logo" label="GWB Hub logo"
          preview={icons.logo ? <img src={icons.logo} alt="" className="h-8 w-8 rounded-lg object-contain" /> : <span className="h-8 w-8 rounded-lg bg-primary" />} />
        {tabs.map((t) => <IconRow key={t} iconKey={t} label={tabLabel(t)} preview={<TabIcons tab={t} className="h-5 w-5 text-primary" />} />)}
      </ul>
    </section>
  );
}
