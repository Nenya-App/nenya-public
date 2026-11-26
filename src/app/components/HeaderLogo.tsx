import NenyaLogo from './NenyaLogo';
import { useTheme } from './ThemeProvider';
import type { BreathingTechnique } from '../../lib/breathingPresets';
import badge from '../../assets/nenya-badge.webp';

// The small logo in the header. The living logo's pale petals nearly vanish on the light page, so the light theme shows the round badge on a dark
// background instead (owner, 2026-11-26). The button around it carries the name for screen readers.
export function HeaderLogo({ size, technique, cycleStart }: { size: number; technique?: BreathingTechnique | null; cycleStart?: number }) {
  const { theme } = useTheme();
  if (theme === 'light') return <img src={badge} alt="" width={size} height={size} className="block" />;
  return <NenyaLogo size={size} technique={technique} cycleStart={cycleStart} />;
}
