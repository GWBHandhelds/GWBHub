import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Check } from 'lucide-react';
import { searchGameImages, setGameImage, SearchGameImagesOutputType } from 'zitejs/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@project/components/ui/dialog';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { cn } from '@project/components/lib/utils';
import { useAppConfig, gameKey } from '../lib/appConfig';

type Props = { open: boolean; onOpenChange: (o: boolean) => void; tab: string; gameName: string };

export default function GameImagePicker({ open, onOpenChange, tab, gameName }: Props) {
  const { images: current, refresh } = useAppConfig();
  const [term, setTerm] = useState(gameName);
  const [images, setImages] = useState<SearchGameImagesOutputType['images'] | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const search = (q: string) => {
    setImages(null);
    searchGameImages({ gameName: q }).then((r) => setImages(r.images)).catch((e) => { toast.error(e.message ?? 'Search failed'); setImages([]); });
  };
  useEffect(() => {
    if (!open) return;
    setTerm(gameName);
    setPicked(current[gameKey(gameName)] ?? null);
    search(gameName);
  }, [open, gameName]);

  const save = async () => {
    if (!picked) return;
    setSaving(true);
    try {
      await setGameImage({ tab, gameName, imageUrl: picked });
      await refresh();
      toast.success('Image updated');
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message ?? 'Could not save image');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader><DialogTitle>Choose an image · {gameName}</DialogTitle></DialogHeader>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); search(term); }}>
          <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search game…" />
          <Button type="submit" variant="outline">Search</Button>
        </form>
        {!images ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : images.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No images found. Try a different search.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((img) => (
              <button key={img.url} type="button" onClick={() => setPicked(img.url)}
                className={cn('relative aspect-video overflow-hidden rounded-lg border-2 transition-all',
                  picked === img.url ? 'border-primary ring-2 ring-primary/40' : 'border-transparent hover:border-border')}>
                <img src={img.thumb} alt="" loading="lazy" className="h-full w-full object-cover" />
                {picked === img.url && <span className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="h-4 w-4" /></span>}
              </button>
            ))}
          </div>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={!picked || saving}>{saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Use this image</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
