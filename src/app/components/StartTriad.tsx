import type { StartChoice } from '../../lib/startCopy';
import { START_COPY } from '../../lib/startCopy';

// The start chooser as a triangle of three glowing circles (owner, 2026-11-15): the three Elven rings as codenames. Breathe is white (Nenya, water and
// adamant), Reflect is blue (Vilya, sapphire, air), Coach is red (Narya, ruby, fire). Breathe sits at the top. Each circle is a real button with its name
// and a one-line description under it (icons below); "Learn more" for all three is one closed disclosure below. The glow breathes slowly unless the device asks for
// reduced motion. In light mode the white ring gets a pearl rim so it stays visible.

const RING: Record<StartChoice, { glow: string; rim: string; core: string; label: string }> = {
  breathing: { glow: 'rgba(250, 248, 245, 0.85)', rim: '#C9C4BD', core: '#FAF8F5', label: 'Breathe' },
  reflection: { glow: 'rgba(74, 144, 226, 0.75)', rim: '#4A90E2', core: '#DCEBFB', label: 'Reflect' },
  coach: { glow: 'rgba(214, 69, 65, 0.75)', rim: '#D64541', core: '#FBE0DE', label: 'Coach' },
};

// Drawn from Nenya's own imagery (owner, 2026-11-15, second pass): Breathe is the logo's six-petal flower; Reflect is the hexagonal prism at its centre,
// splitting light into three lines (the senses); Coach is two circles meeting, the shared space between two people.
const PETALS = [0, 60, 120, 180, 240, 300];
function Icon({ id }: { id: StartChoice }) {
  const stroke = id === 'breathing' ? '#6B6560' : id === 'reflection' ? '#2F6FB8' : '#B23A36';
  const cls = 'size-12 sm:size-14';
  if (id === 'breathing')
    return (
      <svg viewBox="0 0 48 48" className={cls} aria-hidden="true" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinejoin="round">
        <g transform="translate(24 24)">
          {PETALS.map((a) => (
            <path key={a} transform={`rotate(${a})`} d="M0 -3 C 4.5 -7, 4.5 -14, 0 -18 C -4.5 -14, -4.5 -7, 0 -3 Z" />
          ))}
        </g>
        <circle cx="24" cy="24" r="2.2" fill={stroke} stroke="none" />
      </svg>
    );
  if (id === 'reflection')
    return (
      <svg viewBox="0 0 48 48" className={cls} aria-hidden="true" fill="none" stroke={stroke} strokeWidth="1.9" strokeLinejoin="round" strokeLinecap="round">
        <path d="M24 11 L35 17.5 L35 30.5 L24 37 L13 30.5 L13 17.5 Z" />
        <path d="M4 24 H13" />
        <path d="M35 21 L44 16" opacity="0.55" />
        <path d="M35 24 H45" opacity="0.8" />
        <path d="M35 27 L44 32" opacity="0.55" />
        <path d="M24 11 V37 M13 17.5 L35 30.5 M35 17.5 L13 30.5" opacity="0.28" />
      </svg>
    );
  return (
    <svg viewBox="0 0 48 48" className={cls} aria-hidden="true" fill="none" stroke={stroke} strokeWidth="1.9">
      <circle cx="18.5" cy="24" r="10.5" />
      <circle cx="29.5" cy="24" r="10.5" />
      <path d="M24 15.2 C 27 18, 27 30, 24 32.8 C 21 30, 21 18, 24 15.2 Z" fill={stroke} fillOpacity="0.22" stroke="none" />
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
