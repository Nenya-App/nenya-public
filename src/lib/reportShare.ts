// Bringing part of a reflection report to the coach (docs/report-to-coach-scope.md). This file is the part the page and the server share: the
// header that starts the shared text, the whitelist it is checked against, and the site-written opening message built from it. Nothing here reads a
// report; that is src/lib/reportFragments.ts, on the page, from what the person chose to share.
//
// The shared text starts with one machine-readable line (the header). The server does not trust what the page says it showed, so it rebuilds the
// opening message itself from the header, and only from names on the fixed lists below: a forged header can change which palette names appear in the
// opening of the visitor's own signed transcript, and nothing else.
import { PALETTE_DISPLAY_NAMES } from './paletteNames.ts';

export const REPORT_SECTIONS = ['Sight', 'Sound', 'Touch', 'Essence', 'Movement', 'Insight', 'Body map'] as const;
export const PALETTE_NAMES: string[] = [...new Set(Object.values(PALETTE_DISPLAY_NAMES))];

export interface ReportMeta {
  /** Outward palette names, from the fixed list. */
  palettes: string[];
  /** At least one colour was the person's own, not from a palette. */
  custom: boolean;
  /** Report sections, from the fixed list. */
  sections: string[];
}

export const MAX_SHARED_CHARS = 2500; // the coach function's limit for shared text

const HEADER = /^\[\[nenya-report palettes=([A-Za-z ,]*) custom=([01]) sections=([A-Za-z ,]*)\]\]/;

export const headerFor = (m: ReportMeta): string => `[[nenya-report palettes=${m.palettes.join(',')} custom=${m.custom ? 1 : 0} sections=${m.sections.join(',')}]]`;

/** The header's facts, or null if the text does not start with a valid header. Names not on the fixed lists are dropped, and there are at most 16 and 7. */
export function parseReportHeader(context: string): ReportMeta | null {
  const m = HEADER.exec(context.trimStart());
  if (!m) return null;
  const palettes = [...new Set(m[1].split(',').map((x) => x.trim()).filter((x) => PALETTE_NAMES.includes(x)))];
  const sections = [...new Set(m[3].split(',').map((x) => x.trim()).filter((x) => (REPORT_SECTIONS as readonly string[]).includes(x)))];
  return { palettes, custom: m[2] === '1', sections };
}

const list = (xs: string[]): string => (xs.length <= 1 ? xs.join('') : xs.length === 2 ? `${xs[0]} and ${xs[1]}` : `${xs.slice(0, -1).join(', ')}, and ${xs[xs.length - 1]}`);

/**
 * What the site says first when a person has shared part of a report. Written by the site, not the AI; built only from the header's whitelisted
 * names, so it states only what can be read exactly from what was shared.
 */
export function openingText(m: ReportMeta): string {
  const parts = ['I see you shared information from a report you made at nenya.biz.'];
  if (m.sections.length) parts.push(`I'm noticing that it covers ${list(m.sections.map((s) => s.toLowerCase() === 'body map' ? 'the body map' : s))}.`);
  if (m.palettes.length && m.custom) parts.push(`It appears you chose colors from the ${list(m.palettes)} ${m.palettes.length === 1 ? 'palette' : 'palettes'}, and at least one color of your own.`);
  else if (m.palettes.length) parts.push(`It appears you chose colors from the ${list(m.palettes)} ${m.palettes.length === 1 ? 'palette' : 'palettes'}.`);
  else if (m.custom) parts.push('It appears you chose a color of your own.');
  parts.push("You're welcome to share more about anything in the report, or to talk about something else, such as how you're feeling or a challenge you're facing. Where would you like to begin?");
  return parts.join(' ');
}
