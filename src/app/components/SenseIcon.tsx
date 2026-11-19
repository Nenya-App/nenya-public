import { SENSE_ICONS, SENSE_ICON_VIEWBOX, type SenseId } from '../../lib/senseIcons';

/** One of the six senses' icons (Google's Material Symbols, self-hosted: src/lib/senseIcons.ts). Decorative: the name beside it says what it is. It takes the text colour. */
export function SenseIcon({ id, className = '' }: { id: SenseId; className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox={SENSE_ICON_VIEWBOX} fill="currentColor" className={`size-6 shrink-0 ${className}`}>
      <path d={SENSE_ICONS[id].path} />
    </svg>
  );
}
