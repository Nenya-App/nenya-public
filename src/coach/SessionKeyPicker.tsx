import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Play, Shuffle } from 'lucide-react';
import NenyaLogo from '../app/components/NenyaLogo';
import { Button } from '../app/components/ui/button';
import { isHex, playSignature, signatureNotes } from '../lib/sessionSound';

export interface SessionKey {
  color1: string;
  color2: string;
}

interface SessionKeyPickerProps {
  onComplete: (key: SessionKey) => void;
  onBack: () => void;
}

const DEFAULT_1 = '#7A9B9E';
const DEFAULT_2 = '#DAC682';

const randomHex = () =>
  '#' +
  [0, 1, 2]
    .map(() => Math.floor(60 + Math.random() * 160).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();

const withHash = (v: string) => (v.startsWith('#') ? v : '#' + v);

// Used when someone opens the coach on its own, or finishes the gateways without
// choosing a Sight color. Two colors plus the melody they make: a temporary
// session key. Nothing here is stored.
export default function SessionKeyPicker({ onComplete, onBack }: SessionKeyPickerProps) {
  const [c1, setC1] = useState(DEFAULT_1);
  const [c2, setC2] = useState(DEFAULT_2);
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(false);
  const stop = useRef<(() => void) | null>(null);

  const valid = isHex(c1) && isHex(c2);

  // A new color means a new melody, so it has to be heard again.
  const change = (set: (v: string) => void) => (v: string) => {
    stop.current?.();
    setPlaying(false);
    setPlayed(false);
    set(v.toUpperCase());
  };

  useEffect(() => () => stop.current?.(), []);

  const hear = () => {
    if (!valid || playing) return;
    setPlaying(true);
    stop.current = playSignature(c1, c2, () => {
      setPlaying(false);
      setPlayed(true);
    });
  };

  const notes = valid ? signatureNotes(c1, c2) : null;

  const tile = (label: string, value: string, set: (v: string) => void) => (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="relative h-20 overflow-hidden rounded-2xl border border-border bg-muted/40">
        <input
          type="color"
          aria-label={label}
          value={isHex(value) ? value.toLowerCase() : DEFAULT_1.toLowerCase()}
          onChange={(e) => change(set)(e.target.value)}
          className="absolute inset-0 z-[2] size-full cursor-pointer opacity-0"
        />
        <div className="absolute inset-0 z-[1]" style={{ background: isHex(value) ? value : undefined }} />
        <div className="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center">
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5">
            <circle cx="10" cy="10" r="7" />
            <path d="M10 6v8M6 10h8" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <input
        type="text"
        inputMode="text"
        aria-label={`${label} hex code`}
        value={value}
        maxLength={7}
        placeholder="#______"
        onChange={(e) => change(set)(withHash(e.target.value))}
        className="w-full border-0 border-b bg-transparent pb-2 text-center font-mono text-sm tracking-widest outline-none"
        style={{ borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: isHex(value) ? value : 'var(--border)' }}
      />
    </div>
  );

  const chip = (n: string, color: string, i: number) => (
    <span
      key={`${color}${i}`}
      className="rounded-lg border px-2 py-1 font-mono text-[11px]"
      style={{ borderColor: `${color}99`, backgroundColor: `${color}22` }}
    >
      {n}
    </span>
  );

  return (
    <div className="size-full flex flex-col bg-background text-foreground">
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-background-secondary px-4 py-3 md:px-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <NenyaLogo size={32} />
          <span className="text-lg">Session key</span>
        </div>
        <div className="w-20" />
      </header>

      <main className="scroll-container flex-1 overflow-y-auto px-4 py-8 md:px-6">
        <div className="mx-auto w-full max-w-xl space-y-7">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Before the coach</p>
            <h1 className="text-2xl md:text-3xl">Choose your colors.</h1>
            <p className="text-sm text-muted-foreground">
              These become your session key, your palette, and your sound. For now they are a temporary label for this
              conversation: not an account, and not stored.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {tile('First color', c1, setC1)}
            {tile('Second color', c2, setC2)}
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                change(setC1)(randomHex());
                setC2(randomHex());
              }}
            >
              <Shuffle className="size-4" />
              Random pair
            </Button>
          </div>

          {valid && notes && (
            <section className="space-y-4 rounded-2xl border border-border bg-card p-4" aria-label="Your signature">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="mb-2.5 text-xs uppercase tracking-widest text-muted-foreground">Your signature</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {notes.first.map((n, i) => chip(n, c1, i))}
                    <span className="mx-1 opacity-30">·</span>
                    {notes.second.map((n, i) => chip(n, c2, i + 3))}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={hear} disabled={playing} className="shrink-0 gap-2 rounded-full">
                  <Play className={`size-3 ${playing ? 'animate-pulse' : ''}`} />
                  {playing ? 'playing…' : played ? 'play again' : 'hear it'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground" role="status">
                {played
                  ? '✓ Your signature is set.'
                  : 'Listen once before continuing. Your colors make this melody, and it is how this session is named.'}
              </p>
            </section>
          )}

          <div className="flex justify-end pt-2">
            <Button size="lg" disabled={!valid || !played} onClick={() => onComplete({ color1: c1, color2: c2 })} className="px-8">
              {played ? 'Continue' : 'Hear your sound first'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
