import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { getTab, updateReport, MyReportsOutputType } from 'zitejs/api';
import { Button } from '@project/components/ui/button';
import { Label } from '@project/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@project/components/ui/dialog';
import { Field } from './AddReportDialog';
import { tabLabel, isFieldVisible } from '../lib/labels';
 
type Report = MyReportsOutputType['reports'][0];
const AUTO = ['date added', 'uploaded by', 'row number'];
 
export default function EditReportDialog({ report, onClose, onSaved }: { report: Report | null; onClose: () => void; onSaved: () => void }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [options, setOptions] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);
 
  useEffect(() => {
    if (!report) return;
    setValues(Object.fromEntries(report.headers.map((h, i) => [h, report.values[i] ?? ''])));
    getTab({ tab: report.tab }).then((d) => setOptions(d.options)).catch(() => setOptions({}));
  }, [report]);
 
  if (!report) return null;
  const fields = report.headers.filter((h) => h && !AUTO.includes(h.toLowerCase()) && isFieldVisible(h, (k) => values[k]));
  const required = fields.find((h) => h.toLowerCase() === 'game name') ?? fields[0];
  const valid = !!values[required]?.trim();
 
  const save = async () => {
    setSaving(true);
    try {
      await updateReport({ tab: report.tab, rowNumber: report.rowNumber, gameName: report.gameName, values });
      toast.success('Report updated');
      onClose();
      onSaved();
    } catch (e: any) {
      toast.error(e.message ?? 'Could not save changes');
    } finally {
      setSaving(false);
    }
  };
 
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>Edit report · {tabLabel(report.tab)}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2 sm:grid-cols-2">
          {fields.map((h) => (
            <div key={h} className={/info|notes/i.test(h) ? 'grid gap-1.5 sm:col-span-2' : 'grid gap-1.5'}>
              <Label>{h}{h === required && <span className="text-primary"> *</span>}</Label>
              <Field h={h} value={values[h] ?? ''} onChange={(v) => setValues((p) => ({ ...p, [h]: v }))} options={options[h]} />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={!valid || saving}>{saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
