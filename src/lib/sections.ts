// One address per part of the site (owner, 2026-11-15; docs/start-chooser-scope.md, part 2): /breath (the front page with the breathing
// animation, as it always was), /senses (the gateway choice, the gateways and the review, all at one address because a reflection lives
// only in the tab's memory and cannot be resumed from an address), and /coach (the coach, including the one reached after a reflection).
// "/" shows the same front page and the address bar changes to /breath. Behind VITE_SECTION_ADDRESSES, and on whenever the lens tray is on (/senses is the tray). It used to share the start chooser's switch; the chooser was removed on 2026-11-18.

import { lensTrayOn } from './lensState.ts';

export type Section = 'breath' | 'senses' | 'coach';

export const sectionsOn = (): boolean => import.meta.env?.VITE_SECTION_ADDRESSES === 'on' || lensTrayOn();

export const SECTION_PATHS: Record<Section, string> = { breath: '/breath', senses: '/senses', coach: '/coach' };

const SENSES_SCREENS = ['home', 'sight', 'sound', 'touch', 'essence', 'movement', 'insight', 'nature', 'story', 'color-selection', 'gateway-review'];

/** The part of the site a screen belongs to, or null for screens with their own addresses (About) or none (partner practice). */
export function sectionOfScreen(screen: string): Section | null {
  if (screen === 'welcome') return 'breath';
  if (SENSES_SCREENS.includes(screen)) return 'senses';
  if (screen === 'session') return 'coach';
  return null;
}

/** The part of the site an address names, or null (About pages, anything else). "/" is the front page. Trailing slashes are ignored. */
export function sectionOfPath(pathname: string): Section | null {
  const p = pathname.replace(/\/+$/, '') || '/';
  if (p === '/' || p === '/breath') return 'breath';
  if (p === '/senses') return 'senses';
  if (p === '/coach') return 'coach';
  return null;
}
