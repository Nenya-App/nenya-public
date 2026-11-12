import NenyaLogo from './NenyaLogo';
import { toggleBreathingPanel } from '../../lib/breathingPanel';

/** The logo as a button that opens the breathing animation and accessibility panel, so the breathing tool is within reach on every page. */
export default function PanelLogo({ size, alt }: { size: number; alt?: string }) {
  return (
    <button
      type="button"
      onClick={toggleBreathingPanel}
      aria-label="Open breathing animation and accessibility settings"
      title="Open breathing animation & accessibility settings"
      className="inline-flex cursor-pointer rounded-full transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <NenyaLogo size={size} {...(alt !== undefined ? { alt } : {})} />
    </button>
  );
}
