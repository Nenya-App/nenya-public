import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import type { ScaleNote, Timbre } from '../../lib/audio';
import { playChords, voice, type Voicing } from '../../lib/chords';

// Staging-only prototype (VITE_SOUND_CHORDS=on): hear each color's three notes as a chord, three ways, to decide whether the Sound gateway
// should offer chords. Nothing here is saved or reported; it only plays. Never starts by itself, and Stop works from the keyboard.
const VOICINGS: { id: Voicing; label: string; hint: string }[] = [
  { id: 'raw', label: 'As the color gives it', hint: 'the three notes together, exactly' },
  { id: 'softened', label: 'Softened', hint: 'moved to the nearest settled chord (Western scale only)' },
  { id: 'drone', label: 'Over a drone', hint: 'one after another over a held low note' },
];

export function ChordPrototype({ chords, labels, scale, noteNames, westernScale, volume, timbre }: {
  /** Each entry is one color's three notes (scale indices). */
  chords: number[][];
  /** A name for each chord ("Present", "Wish", a palette color's name). */
  labels: string[];
  scale: ScaleNote[];
  noteNames: string[];
  westernScale: boolean;
  volume: number;
  timbre: Timbre;
}) {
  const [voicing, setVoicing] = useState<Voicing>('raw');
  const [playing, setPlaying] = useState<number | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  useEffect(() => () => stopRef.current?.(), []);
  useEffect(() => { if (!westernScale && voicing === 'softened') setVoicing('raw'); }, [westernScale, voicing]);

  const play = (which: number[]) => {
    stopRef.current?.();
    setPlaying(which[0]);
    stopRef.current = playChords(which.map((i) => chords[i]), scale, voicing, {
      volume, timbre, westernScale,
      onChord: (c) => setPlaying(which[c]),
      onEnd: () => { setPlaying(null); stopRef.current = null; },
    });
  };
  const stop = () => { stopRef.current?.(); stopRef.current = null; setPlaying(null); };
  const complete = chords.filter((c) => c.length === 3 && c.every((n) => Number.isInteger(n)));
  if (complete.length < 1) return null;

  return (
    <section aria-labelledby="chord-proto" className="space-y-3 rounded-lg border border-dashed border-border p-4 text-sm">
      <h3 id="chord-proto" className="text-base">Chords (prototype, staging only)</h3>
      <p className="text-muted-foreground">Each color&rsquo;s three notes, played together instead of one by one. Only for listening: nothing here is saved or added to your report.</p>
      <fieldset className="space-y-1">
        <legend className="text-muted-foreground">How to voice them</legend>
        {VOICINGS.map((v) => (
          <label key={v.id} className={`flex min-h-11 items-center gap-2 ${v.id === 'softened' && !westernScale ? 'opacity-60' : ''}`}>
            <input type="radio" name="chord-voicing" value={v.id} checked={voicing === v.id} disabled={v.id === 'softened' && !westernScale} onChange={() => setVoicing(v.id)} />
            <span>{v.label} <span className="text-muted-foreground">({v.hint})</span></span>
          </label>
        ))}
      </fieldset>
      <div className="flex flex-wrap gap-2">
        {chords.map((_, i) => (
          <Button key={i} variant="outline" size="sm" onClick={() => play([i])} disabled={playing !== null}>Play {labels[i] ?? `chord ${i + 1}`}</Button>
        ))}
        {chords.length > 1 && <Button size="sm" onClick={() => play(chords.map((_, i) => i))} disabled={playing !== null}>Play them in order</Button>}
        <Button variant="outline" size="sm" onClick={stop} disabled={playing === null}>Stop</Button>
      </div>
      <ul className="space-y-1 text-muted-foreground" aria-live="polite">
        {chords.map((c, i) => {
          const v = voice(c, scale, voicing, westernScale);
          return (
            <li key={i} className={playing === i ? 'text-foreground' : ''}>
              {playing === i ? '▶ ' : ''}{labels[i] ?? `Chord ${i + 1}`}: {c.map((n) => noteNames[n] ?? '?').join(', ')}, {v.describe}.
            </li>
          );
        })}
      </ul>
    </section>
  );
}
