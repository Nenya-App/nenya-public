import { ScaleNote } from '../../lib/audio';

interface ScaleRowProps {
  notes: ScaleNote[];
  currentSelected: number[];
  wishSelected: number[];
  onSelect: (index: number) => void;
  accentCurrent: string;
  accentWish: string;
}

// A plain labeled-button row rather than staff notation -- a maqam's
// quarter-tone degrees need a distinct accidental system (half-flat/
// half-sharp symbols) almost nobody already reads, this app's audience
// included. Naming every note plainly is more honest than a staff that
// implies more notational precision than it actually has here.
export function ScaleRow({ notes, currentSelected, wishSelected, onSelect, accentCurrent, accentWish }: ScaleRowProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-2 scroll-container">
      {notes.map((note, i) => {
        const isCurrent = currentSelected.includes(i);
        const isWish = wishSelected.includes(i);
        const accent = isCurrent ? accentCurrent : isWish ? accentWish : undefined;
        return (
          <button
            key={note.name}
            onClick={() => onSelect(i)}
            className="flex-shrink-0 rounded-lg px-2.5 py-2 text-xs transition-all active:scale-95"
            style={{
              background: accent ? `${accent}25` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${accent ? `${accent}70` : 'rgba(255,255,255,0.08)'}`,
              color: accent ?? 'rgba(255,255,255,0.65)',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {note.name}
          </button>
        );
      })}
    </div>
  );
}
