import { CHROMATIC_NOTES, StaffNote } from '../../lib/audio';

interface MusicalStaffProps {
  // Defaults to the Western chromatic scale, but any scale whose notes
  // carry a real letter/octave/accidental (Rast, Blues) can be staff-
  // notated the same way -- this is not Western-specific plumbing.
  notes?: StaffNote[];
  currentSelected: number[]; // indices into `notes` filling the "current state" slots
  wishSelected: number[]; // indices into `notes` filling the "wish state" slots
  onSelect: (index: number) => void;
  accentCurrent: string;
  accentWish: string;
}

const W = 560;
const H = 190;
const STEP_GAP = 8; // vertical px per diatonic step (line-to-space or space-to-line)
const BASE_Y = 165; // y position of diatonic index 0 (C4)
const X_START = 26;
const X_END = 545;

const LETTER_STEP: Record<string, number> = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };

// Diatonic staff index (0 = C4, one full step per natural letter,
// accidentals share their natural's index) -- this is what actually
// places a note on a specific line/space, the way real notation works.
function diatonicIndex(note: StaffNote): number {
  return (note.octave - 4) * 7 + LETTER_STEP[note.letter];
}

function yFor(index: number): number {
  return BASE_Y - index * STEP_GAP;
}

// The 5 real staff lines sit at E4, G4, B4, D5, F5 -- diatonic indices
// 2, 4, 6, 8, 10.
const STAFF_LINE_INDICES = [2, 4, 6, 8, 10];

// Only C4 (below) and G5/A5/B5/C6 (above) fall outside the 5-line staff in
// this two-octave range, so a small lookup is simpler and less error-prone
// than fully general ledger-line math for an edge case this narrow.
function ledgerLinesFor(index: number): number[] {
  if (index <= 0) return [0];
  if (index >= 12) return index >= 14 ? [12, 14] : [12];
  return [];
}

export function MusicalStaff({ notes = CHROMATIC_NOTES, currentSelected, wishSelected, onSelect, accentCurrent, accentWish }: MusicalStaffProps) {
  const colWidth = (X_END - X_START) / (notes.length - 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full select-none" role="group" aria-label="Musical staff, click a note to select it">
      {STAFF_LINE_INDICES.map((idx) => (
        <line key={idx} x1={X_START - 10} y1={yFor(idx)} x2={X_END + 10} y2={yFor(idx)} stroke="currentColor" strokeOpacity={0.35} strokeWidth={1} />
      ))}

      {notes.map((note, i) => {
        const x = X_START + i * colWidth;
        const dIndex = diatonicIndex(note);
        const y = yFor(dIndex);
        const isCurrent = currentSelected.includes(i);
        const isWish = wishSelected.includes(i);
        const accent = isCurrent ? accentCurrent : isWish ? accentWish : undefined;
        // Wider labels (e.g. Rast's "½♭") need more clearance from the
        // notehead than a single sharp sign does.
        const accidentalOffset = 9 + Math.max(0, (note.accidentalLabel?.length ?? 1) - 1) * 6;

        return (
          <g key={`${note.name}-${i}`} onClick={() => onSelect(i)} className="cursor-pointer">
            {ledgerLinesFor(dIndex).map((ledgerIdx) => (
              <line
                key={ledgerIdx}
                x1={x - 7}
                y1={yFor(ledgerIdx)}
                x2={x + 7}
                y2={yFor(ledgerIdx)}
                stroke="currentColor"
                strokeOpacity={0.35}
                strokeWidth={1}
              />
            ))}
            {note.accidentalLabel && (
              <text x={x - accidentalOffset} y={y + 3} fontSize={9} fill={accent ?? 'currentColor'} opacity={accent ? 1 : 0.45}>
                {note.accidentalLabel}
              </text>
            )}
            {/* Larger transparent click target than the visible notehead itself */}
            <circle cx={x} cy={y} r={7} fill="transparent" />
            <ellipse
              cx={x}
              cy={y}
              rx={4.2}
              ry={3.4}
              fill={accent ?? 'none'}
              stroke={accent ?? 'currentColor'}
              strokeOpacity={accent ? 1 : 0.4}
              strokeWidth={1}
              className="transition-colors"
            />
          </g>
        );
      })}
    </svg>
  );
}
