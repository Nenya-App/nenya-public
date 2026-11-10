// The phrases of a longer melody, one for each color: reorder, mute (palette phrases), choose which note to change. The present and wish phrases always stay.
// Notes and Sight colors are separate here: nothing in this component changes a color.
import { ArrowDown, ArrowUp, Volume2, VolumeX } from 'lucide-react';
import { canMute, type Phrase } from '../../lib/longMelody';

export interface Active { id: string; position: number }

interface Props {
  phrases: Phrase[];
  noteNames: string[];
  active: Active | null;
  playing: Active | null;
  onActivate: (a: Active) => void;
  onMove: (id: string, by: -1 | 1) => void;
  onMute: (id: string, muted: boolean) => void;
}

const KIND_LABEL = { present: 'Present', wish: 'Wish', palette: 'Palette' } as const;

export function PhraseMelody({ phrases, noteNames, active, playing, onActivate, onMove, onMute }: Props) {
  return (
    <ol className="space-y-2" aria-label="The phrases of your melody, in playing order">
      {phrases.map((p, i) => (
        <li key={p.id} className="rounded-xl border border-border p-2.5" style={{ opacity: p.muted ? 0.55 : 1 }}>
          <div className="flex items-center gap-2">
            <span aria-hidden className="size-6 shrink-0 rounded-full border border-border" style={{ background: p.hex }} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                <span className="text-muted-foreground">{i + 1}. {KIND_LABEL[p.kind]}: </span>{p.label}
              </p>
              {p.label.toUpperCase() !== p.hex && <p className="text-xs text-muted-foreground">{p.hex}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button type="button" className="rounded-md border border-border p-1.5 disabled:opacity-30" disabled={i === 0} onClick={() => onMove(p.id, -1)} aria-label={`Move phrase ${i + 1}, ${p.label}, earlier`}><ArrowUp className="size-3.5" /></button>
              <button type="button" className="rounded-md border border-border p-1.5 disabled:opacity-30" disabled={i === phrases.length - 1} onClick={() => onMove(p.id, 1)} aria-label={`Move phrase ${i + 1}, ${p.label}, later`}><ArrowDown className="size-3.5" /></button>
              {canMute(p) ? (
                <button type="button" className="rounded-md border border-border p-1.5" aria-pressed={p.muted} onClick={() => onMute(p.id, !p.muted)} aria-label={p.muted ? `Unmute phrase ${i + 1}, ${p.label}` : `Mute phrase ${i + 1}, ${p.label}`}>
                  {p.muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
                </button>
              ) : (
                <span className="px-1 text-xs text-muted-foreground" title="The present and wish phrases always stay in the melody">stays</span>
              )}
            </div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {p.notes.map((n, k) => {
              const isActive = active?.id === p.id && active.position === k;
              const isPlaying = playing?.id === p.id && playing.position === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => onActivate({ id: p.id, position: k })}
                  aria-pressed={isActive}
                  aria-label={`Phrase ${i + 1}, note ${k + 1}: ${noteNames[n] ?? n}${isActive ? ', chosen: pick a note below to change it' : ''}${p.muted ? ', muted' : ''}`}
                  className="rounded-lg border py-2 text-xs"
                  style={{ borderColor: isActive ? p.hex : 'rgba(255,255,255,0.14)', background: isPlaying ? `${p.hex}55` : isActive ? `${p.hex}25` : 'rgba(255,255,255,0.05)' }}
                >
                  {noteNames[n] ?? n}
                </button>
              );
            })}
          </div>
        </li>
      ))}
    </ol>
  );
}
