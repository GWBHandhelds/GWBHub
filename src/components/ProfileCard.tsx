import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Camera, Loader2 } from 'lucide-react';
import { useAuth } from 'zitejs/auth';
import { useUpload } from 'zitejs/upload';
import { getProfile, saveProfile } from 'zitejs/api';
import { Avatar, AvatarFallback, AvatarImage } from '@project/components/ui/avatar';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { Label } from '@project/components/ui/label';
import { Skeleton } from '@project/components/ui/skeleton';

export default function ProfileCard() {
  const { user } = useAuth();
  const { upload, isUploading } = useUpload();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState('');
  const [username, setUsername] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProfile({}).then((p) => { setUsername(p.username); setSaved(p.username); setImage(p.image); }).finally(() => setLoaded(true));
  }, []);

  const trimmed = username.trim();
  const invalid = trimmed.length < 2 || trimmed.length > 32;

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await upload(file);
      await saveProfile({ image: url });
      setImage(url);
      toast.success('Profile picture updated');
    } catch {
      toast.error('Could not upload picture');
    }
  };

  const onSave = async () => {
    setSaving(true);
    setError('');
    try {
      await saveProfile({ username: trimmed });
      setSaved(trimmed);
      toast.success('Username saved');
    } catch (e: any) {
      setError(e.message?.includes('taken') ? 'Name is already taken' : e.message ?? 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return <Skeleton className="h-40 rounded-xl" />;

  return (
    <div className="flex flex-col gap-6 rounded-xl border bg-card p-6 sm:flex-row sm:items-center">
      <button className="group relative shrink-0" onClick={() => fileRef.current?.click()} disabled={isUploading} aria-label="Change profile picture">
        <Avatar className="h-24 w-24 border-2 border-primary/40">
          {image && <AvatarImage src={image} className="object-cover" />}
          <AvatarFallback className="text-2xl font-bold">{(saved || user?.email || '?')[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="absolute inset-0 grid place-items-center rounded-full bg-background/70 opacity-0 transition-opacity group-hover:opacity-100">
          {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
        </span>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      </button>
      <div className="flex-1 space-y-2">
        <Label htmlFor="username">Username</Label>
        <div className="flex gap-2">
          <Input id="username" value={username} maxLength={32} placeholder="Pick a username"
            onChange={(e) => { setUsername(e.target.value); setError(''); }} aria-invalid={!!error} />
          <Button onClick={onSave} disabled={invalid || saving || trimmed === saved}>
            {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Save
          </Button>
        </div>
        {error ? <p className="text-sm font-medium text-destructive">{error}</p>
          : <p className="text-xs text-muted-foreground">{user?.email} · Your username appears as "Uploaded By" on new reports.</p>}
      </div>
    </div>
  );
}
