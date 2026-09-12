import { ScaleNote } from '../../lib/audio';

interface KotoStringDiagramProps {
  notes: ScaleNote[];
  currentSelected: number[];
  wishSelected: number[];
  onSelect: (index: number) => void;
  accentCurrent: string;
  accentWish: string;
}

// Koto and shamisen music is traditionally notated by numbered string,
// not pitch name -- a koto's strings are numbered low to high and each is
// tuned to a fixed degree of the instrument's chosen mode. This mirrors
// that convention directly (string 1, 2, 3...) rather than relabeling
// Miyako-bushi's degrees with pitch letters the tradition doesn't
// actually use for this instrument. The numbering is purely positional
// (string N = the Nth entry of `notes`), so it needs no data of its own.
export function KotoStringDiagram({ notes, currentSelected, wishSelected, onSelect, accentCurrent, accentWish }: KotoStringDiagramProps) {
  return (
    <div className="flex items-end justify-center gap-2 overflow-x-auto pb-2 scroll-container" style={{ minHeight: 104 }}>
      {notes.map((_, i) => {
        const isCurrent = currentSelected.includes(i);
        const isWish = wishSelected.includes(i);
        const accent = isCurrent ? accentCurrent : isWish ? accentWish : undefined;
        // Real koto strings shorten as they go up in pitch (the bridge
        // positions move progressively closer to the player) -- echoed
        // here rather than drawing every string the same length.
        const height = 82 - i * 4;

        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-95 transition-transform"
            style={{ width: 22 }}
            aria-label={`String ${i + 1}`}
            title={`String ${i + 1}`}
          >
            <div
              style={{
                width: 2,
                height: Math.max(height, 34),
                background: accent ?? 'rgba(255,255,255,0.2)',
                boxShadow: accent ? `0 0 6px ${accent}80` : 'none',
                borderRadius: 1,
                transition: 'background 0.2s, box-shadow 0.2s',
              }}
            />
            <span
              style={{
                fontSize: '9px',
                color: accent ?? 'rgba(255,255,255,0.4)',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {i + 1}
            </span>
          </button>
        );
      })}
    </div>
  );
}
