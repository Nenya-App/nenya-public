import type { StartChoice } from '../../lib/startCopy';
import { START_COPY } from '../../lib/startCopy';

// The start chooser as a triangle of three glowing circles (owner, 2026-11-15): the three Elven rings as codenames. Breathe is white (Nenya, water and
// adamant), Reflect is blue (Vilya, sapphire, air), Coach is red (Narya, ruby, fire). Breathe sits at the top. Each circle is a real button with its name
// and a one-line description under it; "Learn more" for all three is one closed disclosure below. The glow breathes slowly unless the device asks for
// reduced motion. In light mode the white ring gets a pearl rim so it stays visible.

const RING: Record<StartChoice, { glow: string; rim: string; core: string; label: string }> = {
  breathing: { glow: 'rgba(250, 248, 245, 0.85)', rim: '#C9C4BD', core: '#FAF8F5', label: 'Breathe' },
  reflection: { glow: 'rgba(74, 144, 226, 0.75)', rim: '#4A90E2', core: '#DCEBFB', label: 'Reflect' },
  coach: { glow: 'rgba(214, 69, 65, 0.75)', rim: '#D64541', core: '#FBE0DE', label: 'Coach' },
};

function Icon({ id }: { id: StartChoice }) {
  const stroke = id === 'breathing' ? '#6B6560' : RING[id].rim;
  if (id === 'breathing')
    return (
      <svg viewBox="0 0 48 48" className="size-9" aria-hidden="true" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round">
        <circle cx="24" cy="24" r="5" />
        <circle cx="24" cy="24" r="11" opacity="0.7" />
        <circle cx="24" cy="24" r="17" opacity="0.4" />
      </svg>
    );
  if (id === 'reflection')
    return (
      <svg viewBox="0 0 48 48" className="size-9" aria-hidden="true" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 24c4.5-7 10.5-11 18-11s13.5 4 18 11c-4.5 7-10.5 11-18 11S10.5 31 6 24z" />
        <circle cx="24" cy="24" r="5.5" />
      </svg>
    );
  return (
    <svg viewBox="0 0 48 48" className="size-9" aria-hidden="true" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13h28a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H22l-8 6v-6h-4a3 3 0 0 1-3-3V16a3 3 0 0 1 3-3z" />
      <path d="M16 21h16M16 26h10" opacity="0.7" />
    </svg>
  );
}

function RingButton({ id, onChoose }: { id: StartChoice; onChoose: (c: StartChoice) => void }) {
  const r = RING[id];
  const opt = START_COPY.options.find((o) => o.id === id)!;
  return (
    <button
      type="button"
      onClick={() => onChoose(id)}
      className="group flex w-32 flex-col items-center gap-2 rounded-2xl p-2 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nenya-accent-warm sm:w-36"
      aria-describedby={`start-line-${id}`}
    >
      <span
        className="start-ring flex size-20 items-center justify-center rounded-full border-2 transition-transform duration-300 group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transition-none sm:size-24"
        style={{ borderColor: r.rim, background: `radial-gradient(circle at 50% 40%, ${r.core}, ${r.core}CC 55%, transparent 75%)`, ['--ring-glow' as string]: r.glow }}
      >
        <Icon id={id} />
      </span>
      <span className="text-base font-medium">{opt.title}</span>
      <span id={`start-line-${id}`} className="text-xs leading-snug text-muted-foreground">{opt.line}</span>
    </button>
  );
}

export function StartTriad({ onChoose }: { onChoose: (c: StartChoice) => void }) {
  return (
    <div className="space-y-4">
      <style>{`
        .start-ring { box-shadow: 0 0 18px 4px var(--ring-glow); animation: start-ring-glow 7s ease-in-out infinite; }
        @keyframes start-ring-glow { 0%, 100% { box-shadow: 0 0 14px 2px var(--ring-glow); } 50% { box-shadow: 0 0 26px 8px var(--ring-glow); } }
        @media (prefers-reduced-motion: reduce) { .start-ring { animation: none; } }
      `}</style>
      {/* The triangle: Breathe at the top, Reflect and Coach below. Reading and tab order follow the same order. */}
      <div role="group" aria-label="Where to start" className="flex flex-col items-center gap-2">
        <RingButton id="breathing" onChoose={onChoose} />
        <div className="flex justify-center gap-6 sm:gap-12">
          <RingButton id="reflection" onChoose={onChoose} />
          <RingButton id="coach" onChoose={onChoose} />
        </div>
      </div>
      <details className="rounded-xl border border-border px-3 pb-2 text-xs text-muted-foreground">
        <summary className="flex min-h-11 cursor-pointer items-center underline underline-offset-4">{START_COPY.learnMore}: what each one is</summary>
        <dl className="space-y-2">
          {START_COPY.options.map((o) => (
            <div key={o.id}>
              <dt className="font-medium text-foreground">{o.title}</dt>
              <dd>{o.more}</dd>
            </div>
          ))}
        </dl>
      </details>
    </div>
  );
}
