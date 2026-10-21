import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';
import { addReport } from 'zitejs/api';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { Label } from '@project/components/ui/label';
import { Textarea } from '@project/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@project/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@project/components/ui/dialog';
import { tabLabel, isFieldVisible } from '../lib/labels';
import GameImagePicker from './GameImagePicker';

const AUTO = ['date added', 'uploaded by'];

type Props = {
  tab: string;
  headers: string[];
  options: Record<string, string[]>;
  suggestions: Record<string, string[]>;
  onAdded: () => void;
};

function Field({ h, value, onChange, options, suggestions }: { h: string; value: string; onChange: (v: string) => void; options?: string[]; suggestions?: string[] }) {
  if (options?.length)
    return (
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder={`Select ${h.toLowerCase()}`} /></SelectTrigger>
        <SelectContent>
          {options.filter(Boolean).map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    );
  if (/info|notes/i.test(h)) return <Textarea value={value} onChange={(e) => onChange(e.target.value)} />;
  const listId = suggestions?.length ? `dl-${h.replace(/\W+/g, '-')}` : undefined;
  return (
    <>
      <Input value={value} list={listId} onChange={(e) => onChange(e.target.value)} />
      {listId && <datalist id={listId}>{suggestions!.map((s) => <option key={s} value={s} />)}</datalist>}
    </>
  );
}

export default function AddReportDialog({ tab, headers, options, suggestions, onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [pickFor, setPickFor] = useState('');
  const fields = headers.filter((h) => h && !AUTO.includes(h.toLowerCase()) && isFieldVisible(h, (k) => values[k]));
  const required = fields.find((h) => h.toLowerCase() === 'game name') ?? fields[0];
  const valid = !!values[required]?.trim();

  const submit = async () => {
    setSaving(true);
    try {
      await addReport({ tab, values: Object.fromEntries(Object.entries(values).filter(([k]) => isFieldVisible(k, (x) => values[x]))) });
      toast.success('Report added — pick a cover image');
      setPickFor(values[required]?.trim() ?? '');
      setValues({});
      setOpen(false);
      onAdded();
    } catch (e: any) {
      toast.error(e.message ?? 'Could not add report');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <GameImagePicker open={!!pickFor} onOpenChange={(o) => !o && setPickFor('')} tab={tab} gameName={pickFor} />
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-1 h-4 w-4" />Add report</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>New report · {tabLabel(tab)}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2 sm:grid-cols-2">
          {fields.map((h) => (
            <div key={h} className={/info|notes/i.test(h) ? 'grid gap-1.5 sm:col-span-2' : 'grid gap-1.5'}>
              <Label>{h}{h === required && <span className="text-primary"> *</span>}</Label>
              <Field h={h} value={values[h] ?? ''} onChange={(v) => setValues((p) => ({ ...p, [h]: v }))}
                options={options[h]} suggestions={suggestions[h]} />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {required && !valid && `${required} is required. `}Date added and your name are filled in automatically.
        </p>
        <DialogFooter>
          <Button onClick={submit} disabled={!valid || saving}>
            {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
