import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { FEELS, TEXTURE_GROUPS, TOUCH_TEXTURES, bySmoothness, nearestToSlider, textureAlt, textureById, texturePath, type TouchTexture } from '../../lib/touchTextures';

interface TextureChooserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The surface chosen so far (id) or null. */
  selected: string | null;
  onChoose: (id: string | null) => void;
  /** Where the Texture slider is now (0 rough to 100 smooth), for "start near my slider". */
  slider: number;
  /** "Present" or "Wish", for the title. */
  stateName: string;
}

// A picker for a surface, as a list (grid) or a carousel. Every surface is a radio button with a roving tab stop, so the keyboard moves among them with
// the arrow keys, Home and End; each has a plain description for screen readers. Nothing is chosen until "Use this surface".
export function TextureChooser({ open, onOpenChange, selected, onChoose, slider, stateName }: TextureChooserProps) {
  const [view, setView] = useState<'grid' | 'carousel'>('grid');
  const [order, setOrder] = useState<'smooth' | 'kind'>('smooth');
  const [group, setGroup] = useState<'all' | (typeof TEXTURE_GROUPS)[number]>('all');
  const [feel, setFeel] = useState<'all' | (typeof FEELS)[number]>('all');
  const [draft, setDraft] = useState<string | null>(selected);
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const strip = useRef<HTMLDivElement>(null);

  useEffect(() => { if (open) setDraft(selected); }, [open, selected]);

  const list = useMemo(() => {
    const filtered = TOUCH_TEXTURES.filter((t) => (group === 'all' || t.group === group) && (feel === 'all' || t.feel === feel));
    return order === 'smooth' ? bySmoothness(filtered) : [...filtered].sort((a, b) => TEXTURE_GROUPS.indexOf(a.group) - TEXTURE_GROUPS.indexOf(b.group) || a.kind.localeCompare(b.kind) || a.title.localeCompare(b.title));
  }, [order, group, feel]);

  const current = textureById(draft) ?? undefined;
  const tabStop = draft && list.some((t) => t.id === draft) ? draft : list[0]?.id;

  const focusId = (id: string) => { refs.current.get(id)?.focus(); refs.current.get(id)?.scrollIntoView({ block: 'nearest', inline: 'center' }); };
  const onKey = (e: React.KeyboardEvent) => {
    const i = list.findIndex((t) => t.id === tabStop);
    let j = i;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = Math.min(list.length - 1, i + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = Math.max(0, i - 1);
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = list.length - 1;
    else return;
    e.preventDefault();
    if (list[j]) { setDraft(list[j].id); focusId(list[j].id); }
  };

  const startNearSlider = () => {
    const near = nearestToSlider(slider);
    setOrder('smooth'); setGroup('all'); setFeel('all'); setDraft(near.id);
    setTimeout(() => focusId(near.id), 0);
  };

  const page = (dir: 1 | -1) => { const el = strip.current; if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' }); };

  const Chip = ({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button type="button" onClick={onClick} aria-pressed={pressed} className={`min-h-8 rounded-full border px-3 py-1 text-xs ${pressed ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background'}`}>
      {children}
    </button>
  );

  const card = (t: TouchTexture) => {
    const on = draft === t.id;
    return (
      <button
        key={t.id}
        ref={(el) => { if (el) refs.current.set(t.id, el); else refs.current.delete(t.id); }}
        type="button"
        role="radio"
        aria-checked={on}
        aria-label={`${textureAlt(t)}`}
        tabIndex={t.id === tabStop ? 0 : -1}
        onClick={() => setDraft(t.id)}
        className={`flex shrink-0 flex-col gap-1 rounded-lg border p-1.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${view === 'carousel' ? 'w-36 snap-start' : ''} ${on ? 'border-primary bg-primary/10' : 'border-border'}`}
      >
        <img src={texturePath(t.id)} alt="" loading="lazy" decoding="async" width={128} height={128} className="aspect-square w-full rounded-md object-cover" />
        <span className="text-xs leading-tight">{t.title}</span>
        <span className="text-xs leading-tight text-muted-foreground">{t.feel}</span>
      </button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[95vw] max-w-4xl flex-col gap-3 overflow-hidden p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Choose a surface for your {stateName.toLowerCase()} state</DialogTitle>
          <DialogDescription>
            Pick the picture that is closest to the feeling under your hands. Pictures are starting points: none of them has a fixed meaning, and you can skip this and use the sliders and your own words instead. Feel labels are measured from the surface's shape only, not from softness or warmth.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="How to look">
          <Chip pressed={view === 'grid'} onClick={() => setView('grid')}>List</Chip>
          <Chip pressed={view === 'carousel'} onClick={() => setView('carousel')}>Carousel</Chip>
          <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
          <Chip pressed={order === 'smooth'} onClick={() => setOrder('smooth')}>Smooth to rough</Chip>
          <Chip pressed={order === 'kind'} onClick={() => setOrder('kind')}>By kind</Chip>
          <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
          <Button type="button" variant="outline" size="sm" onClick={startNearSlider}>Start near my Texture slider</Button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Kind of surface">
          <Chip pressed={group === 'all'} onClick={() => setGroup('all')}>All kinds</Chip>
          {TEXTURE_GROUPS.map((g) => <Chip key={g} pressed={group === g} onClick={() => setGroup(g)}>{g}</Chip>)}
        </div>
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Measured feel">
          <Chip pressed={feel === 'all'} onClick={() => setFeel('all')}>Any feel</Chip>
          {FEELS.map((f) => <Chip key={f} pressed={feel === f} onClick={() => setFeel(f)}>{f}</Chip>)}
        </div>

        <p className="text-xs text-muted-foreground" role="status">{list.length} {list.length === 1 ? 'surface' : 'surfaces'}{order === 'smooth' ? ', smoothest first' : ''}.</p>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {list.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">Nothing matches. Try "Any feel" or "All kinds".</p>
          ) : view === 'grid' ? (
            <div role="radiogroup" aria-label="Surfaces" onKeyDown={onKey} className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {list.map(card)}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Button type="button" variant="outline" size="icon" onClick={() => page(-1)} aria-label="Previous surfaces"><ChevronLeft className="size-4" /></Button>
              <div ref={strip} role="radiogroup" aria-label="Surfaces" onKeyDown={onKey} className="flex flex-1 snap-x gap-2 overflow-x-auto py-1">
                {list.map(card)}
              </div>
              <Button type="button" variant="outline" size="icon" onClick={() => page(1)} aria-label="Next surfaces"><ChevronRight className="size-4" /></Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-start gap-3 rounded-lg border border-border p-3" aria-live="polite">
          {current ? (
            <>
              <img src={texturePath(current.id)} alt={textureAlt(current)} width={96} height={96} className="size-24 rounded-md object-cover" />
              <div className="min-w-0 flex-1 text-sm">
                <div className="font-medium">{current.title}</div>
                <div className="text-xs text-muted-foreground">
                  {current.kind} · {current.feel}{current.relief !== null ? ` (steepness ${current.relief.toFixed(2)})` : ''} · {current.credit}
                </div>
                <a href={current.url} target="_blank" rel="noopener noreferrer" className="text-xs underline underline-offset-2">View the original at {current.source} (opens in a new tab)</a>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No surface picked yet.</p>
          )}
        </div>

        <DialogFooter className="gap-2">
          {selected && <Button type="button" variant="ghost" onClick={() => { onChoose(null); onOpenChange(false); }}>Remove my surface</Button>}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" disabled={!current} onClick={() => { onChoose(current ? current.id : null); onOpenChange(false); }}>Use this surface</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
