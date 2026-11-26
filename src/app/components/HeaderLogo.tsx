import { HEADER_ROUND_SIZE } from './EmergencyExit';
import { useTheme } from './ThemeProvider';
import badge from '../../assets/nenya-badge.webp';
import mark from '../../assets/nenya-header-mark.webp';

// The small logo in the header: a still picture that fills the same circle as the round Emergency Exit information button across the header, at every
// width and text size (owner, 2026-11-26). The mark's pale petals nearly vanish on the light page, so the light theme shows the round badge on a dark
// background, with the mark drawn large inside its gold ring. The button around it carries the name for screen readers.
export function HeaderLogo() {
  const { theme } = useTheme();
  return <img src={theme === 'light' ? badge : mark} alt="" width={44} height={44} className={`block ${HEADER_ROUND_SIZE}`} />;
}
