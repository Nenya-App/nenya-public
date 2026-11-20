import { sixthLensName } from './vocabulary.ts';
import { activeLenses, type LensId } from './lensState.ts';
// One plain sentence per gateway, for the welcome page's short overview (and anywhere else a quick summary is needed). Each says what the
// person actually does there, matching the gateway pages; nothing about what it means or does for them.
export const GATEWAY_SUMMARIES: { id: 'sight' | 'sound' | 'touch' | 'essence' | 'movement' | 'insight'; name: string; summary: string }[] = [
  { id: 'sight', name: 'Sight', summary: 'Choose two colors: one for how you feel now, one for how you would like to feel.' },
  { id: 'sound', name: 'Sound', summary: 'Hear your colors as a short melody, or make one from silence.' },
  { id: 'touch', name: 'Touch', summary: 'Describe the feeling by touch: its texture, temperature, pressure, weight and sharpness.' },
  { id: 'essence', name: 'Essence', summary: 'Describe it as a scent or a taste, and how strong it is.' },
  { id: 'movement', name: 'Movement', summary: 'Show which way it moves, with how much energy and speed, in words or a drawing.' },
  { id: 'insight', name: sixthLensName(), summary: 'Sketch the shape of your thinking: its pattern, and how clear and deep it feels.' },
];

/** The seventh and eighth lenses (owner, 2026-11-19): shown only where their switches are on (src/lib/lensState.ts). Plain sentences saying what the person does there. */
export const EXTRA_LENS_SUMMARIES: { id: 'nature' | 'story'; name: string; summary: string }[] = [
  { id: 'nature', name: 'Nature', summary: 'Describe it with plants and animals, weather, landscapes, or the qualities of materials.' },
  { id: 'story', name: 'Story', summary: 'Tell a moment: where it is, who is in it, what changes and how it ends.' },
];

/** The summaries of the lenses a visitor can open now, in tray order. The welcome page and the lens list read this, so a lens switched on appears without any other change. */
export const lensSummaries = (active: readonly LensId[] = activeLenses()): { id: LensId; name: string; summary: string }[] => [...GATEWAY_SUMMARIES, ...EXTRA_LENS_SUMMARIES].filter((g) => active.includes(g.id));

/** "Sight, Sound, Touch, Essence, Movement and Insight" for the lenses on now (the sixth is written Insight here and becomes Pattern through L() with the lens words on). */
export function lensNamesLine(active: readonly LensId[] = activeLenses()): string {
  const names = lensSummaries(active).map((g) => (g.id === 'insight' ? 'Insight' : g.name));
  return names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** Routes through the gateways by choice and order alone: one to six of them, in any order (6 + 30 + 120 + 360 + 720 + 720). */
export const GATEWAY_ROUTES = [1, 2, 3, 4, 5, 6].reduce((sum, k) => sum + Array.from({ length: k }, (_, i) => 6 - i).reduce((p, x) => p * x, 1), 0);
