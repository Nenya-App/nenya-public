interface FlavorWheelProps {
  terms: string[];
  selected: string[];
  onToggle: (term: string) => void;
  accentColor?: string;
}

const SIZE = 260;
const CENTER = SIZE / 2;
const OUTER_R = 118;
const INNER_R = 30; // small hole in the middle, like a real tasting/aroma wheel
const LABEL_R = (OUTER_R + INNER_R) / 2;

function polarToCartesian(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad) };
}

function wedgePath(startAngle: number, endAngle: number) {
  const outerStart = polarToCartesian(startAngle, OUTER_R);
  const outerEnd = polarToCartesian(endAngle, OUTER_R);
  const innerStart = polarToCartesian(endAngle, INNER_R);
  const innerEnd = polarToCartesian(startAngle, INNER_R);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${OUTER_R} ${OUTER_R} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${INNER_R} ${INNER_R} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
    'Z',
  ].join(' ');
}

// A radial selector modeled on real tasting/aroma wheels (wine, coffee,
// perfume) -- wedge-per-term, multi-select by tapping, rather than a
// scrollable checkbox list. Better suited to a sense that's exploratory
// and associative rather than a flat category list.
export function FlavorWheel({ terms, selected, onToggle, accentColor = '#8FA98C' }: FlavorWheelProps) {
  const wedgeAngle = 360 / terms.length;
  const fontSize = terms.length > 9 ? 7.5 : 9;

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[260px] mx-auto" role="group">
      {terms.map((term, i) => {
        const startAngle = i * wedgeAngle;
        const endAngle = startAngle + wedgeAngle;
        const midAngle = startAngle + wedgeAngle / 2;
        const isSelected = selected.includes(term);
        const label = polarToCartesian(midAngle, LABEL_R);
        return (
          <g key={term} onClick={() => onToggle(term)} className="cursor-pointer">
            <path
              d={wedgePath(startAngle, endAngle)}
              fill={isSelected ? accentColor : 'var(--muted)'}
              fillOpacity={isSelected ? 0.85 : 0.4}
              stroke="var(--border)"
              strokeWidth={1}
              className="transition-colors hover:fill-opacity-70"
            />
            <text
              x={label.x}
              y={label.y}
              fontSize={fontSize}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${midAngle > 90 && midAngle < 270 ? midAngle + 180 : midAngle}, ${label.x}, ${label.y})`}
              fill={isSelected ? '#fff' : 'currentColor'}
              className="pointer-events-none select-none"
            >
              {term}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
