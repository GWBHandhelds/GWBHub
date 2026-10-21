import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { deleteAccount } from 'zitejs/api';
import { logout } from 'zitejs/auth';
import { Button } from '@project/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@project/components/ui/alert-dialog';

export default function DeleteAccount() {
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    try {
      await deleteAccount({});
      toast.success('Account deleted');
      logout();
    } catch (e: any) {
      toast.error(e.message ?? 'Could not delete account');
      setBusy(false);
    }
  };
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-destructive/40 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-semibold">Delete account</h2>
        <p className="text-sm text-muted-foreground">Removes your username, profile picture and image choices, then signs you out.</p>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" disabled={busy}>{busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Delete account</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>Your profile will be removed and you'll be signed out. Reports you've already shared stay in the sheet. This can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={run} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
