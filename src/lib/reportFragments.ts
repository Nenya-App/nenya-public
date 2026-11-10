// Page side of bringing part of a reflection report to the coach (docs/report-to-coach-scope.md). Splits a report into pieces the person can choose
// from, and builds the one plain-text summary that goes to the coach: nothing is chosen by default, the person sees exactly the words that would go,
// and the pieces use the same words as the report itself (src/lib/reportText.ts). The shared header and the opening message are in reportShare.ts.
import { formatBodyMapLines, formatGatewayData, gatewayTitles, isBodyMapUsed, type BodyMapLike, type Gateway } from './reportText.ts';
import { PALETTE_INFO, describePalette } from './paletteInfo.ts';
import { headerFor, MAX_SHARED_CHARS, REPORT_SECTIONS, type ReportMeta } from './reportShare.ts';

export interface Fragment {
  id: string;
  /** The report section, from the fixed list in reportShare.ts. */
  section: string;
  title: string;
  lines: string[];
  /** Outward palette names whose colours appear in this piece. */
  palettes: string[];
  /** A colour the person chose themselves, not from a palette. */
  custom: boolean;
}

/** The outward palette name a colour belongs to, or null (a colour of the person's own). Supplied by the caller so this file stays free of the components. */
export type PaletteLookup = (hex: string) => string | null;

const HEX = /^#[0-9a-f]{6}$/i;
const sectionOf = (g: Gateway): string => gatewayTitles[g].split(' - ')[0];

function colourLines(label: string, hex: string, lookup: PaletteLookup, into: { palettes: Set<string>; custom: boolean }): string[] {
  const name = lookup(hex);
  if (name) {
    into.palettes.add(name);
    return [`  ${label} colour ${hex.toUpperCase()} is from the ${name} palette.`];
  }
  into.custom = true;
  return [`  ${label} colour ${hex.toUpperCase()} is a colour the person chose themselves, not from a palette.`];
}

/** Plain words for a colour, supplied by the caller (the colour-name list is loaded on the page): a description and the nearest named colour. */
export type ColorWords = (hex: string) => string | null;

/** The report as pieces: one per gateway that has data, and one for the body map if it was used. With `words`, the colours are also described in plain words, so the model is not left to guess what a hex code looks like. */
export function buildFragments(gatewayData: { gateway: Gateway; data: any }[], bodyMap: BodyMapLike | undefined, lookup: PaletteLookup, words?: ColorWords): Fragment[] {
  const out: Fragment[] = [];
  for (const gd of gatewayData) {
    const found = { palettes: new Set<string>(), custom: false };
    const lines = formatGatewayData(gd.gateway, gd.data);
    if (gd.gateway === 'sight') {
      if (HEX.test(gd.data?.color1 ?? '')) lines.push(...colourLines('Present', gd.data.color1, lookup, found));
      if (HEX.test(gd.data?.color2 ?? '')) lines.push(...colourLines('Wish', gd.data.color2, lookup, found));
      // A palette the person made is their own: its colours are not one of the sixteen, whatever hex they happen to share.
      if ((gd.data?.generatedPalettes ?? []).some((p: any) => p?.colors?.length)) found.custom = true;
      if (words) {
        const say = (label: string, hex: unknown) => { const w = typeof hex === 'string' && HEX.test(hex) ? words(hex) : null; return w ? [`  ${label} colour in plain words: ${w}.`] : []; };
        lines.push(...say('Present', gd.data?.color1), ...say('Wish', gd.data?.color2));
        for (const p of gd.data?.generatedPalettes ?? []) {
          const each = (p?.colors ?? []).map((c: any) => (typeof c?.hex === 'string' && HEX.test(c.hex) ? `${c.hex.toUpperCase()} is ${words(c.hex) ?? 'a colour'}` : '')).filter(Boolean);
          if (each.length) lines.push(`  The palette's colours in plain words: ${each.join('; ')}.`);
        }
      }
    }
    out.push({ id: gd.gateway, section: sectionOf(gd.gateway), title: gatewayTitles[gd.gateway], lines, palettes: [...found.palettes], custom: found.custom });
  }
  if (bodyMap && isBodyMapUsed(bodyMap)) {
    const found = { palettes: new Set<string>(), custom: false };
    for (const p of bodyMap.placements) if (HEX.test(p.color)) colourLines('', p.color, lookup, found);
    out.push({ id: 'body-map', section: 'Body map', title: 'Body map', lines: formatBodyMapLines(bodyMap), palettes: [...found.palettes], custom: found.custom });
  }
  return out;
}

/**
 * Pieces from a saved text report that the person pastes or opens (the report's own format: an upper-case title, a line of dashes, then the lines).
 * Palettes are found from the hex codes that appear. Returns [] if the text does not look like a Nenya report.
 */
export function fragmentsFromText(text: string, lookup: PaletteLookup, words?: ColorWords): Fragment[] {
  const titles: { id: string; section: string; title: string }[] = [
    ...(Object.keys(gatewayTitles) as Gateway[]).map((g) => ({ id: g, section: sectionOf(g), title: gatewayTitles[g] })),
    { id: 'body-map', section: 'Body map', title: 'Body map' },
  ];
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const out: Fragment[] = [];
  let cur: Fragment | null = null;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const heading = titles.find((t) => raw.trim() === t.title.toUpperCase());
    if (heading && /^-{5,}$/.test((lines[i + 1] ?? '').trim())) {
      cur = { id: heading.id, section: heading.section, title: heading.title, lines: [], palettes: [], custom: false };
      out.push(cur);
      i++;
      continue;
    }
    if (/^={5,}$/.test(raw.trim()) || /^End of Report$/i.test(raw.trim())) { cur = null; continue; }
    if (cur && raw.trim()) cur.lines.push(raw.replace(/\s+$/, ''));
  }
  for (const f of out) {
    const hexes = new Set<string>();
    for (const l of f.lines) for (const m of l.matchAll(/#[0-9a-f]{6}\b/gi)) hexes.add(m[0]);
    const found = { palettes: new Set<string>(), custom: false };
    for (const h of hexes) colourLines('', h, lookup, found);
    // A saved report only has hex codes: describe each in plain words, so the model is not left to guess what a code looks like.
    if (words && hexes.size) {
      const each = [...hexes].map((h) => { const w = words(h); return w ? `${h.toUpperCase()} is ${w}` : ''; }).filter(Boolean);
      if (each.length) f.lines.push(`  The colours above in plain words: ${each.join('; ')}.`);
    }
    f.palettes = [...found.palettes];
    f.custom = found.custom;
  }
  return out.filter((f) => f.lines.length > 0);
}

export interface SharedText {
  text: string;
  meta: ReportMeta;
  chars: number;
  fits: boolean;
}

/** The one plain-text summary that goes to the coach: the header, the chosen pieces word for word, and a line about each palette named. */
export function buildContext(selected: Fragment[], paletteColorWords?: (paletteName: string) => string | null): SharedText {
  const meta: ReportMeta = {
    palettes: [...new Set(selected.flatMap((f) => f.palettes))].filter((p) => p in PALETTE_INFO),
    custom: selected.some((f) => f.custom),
    sections: [...new Set(selected.map((f) => f.section))].filter((s) => (REPORT_SECTIONS as readonly string[]).includes(s)),
  };
  const body = selected.map((f) => `## ${f.title}\n${f.lines.join('\n')}`).join('\n\n');
  const notes = meta.palettes.length ? `\n\nAbout the palettes named above (starting points, not measurements; these are rough guesses, to be offered as questions):\n${meta.palettes.map((n) => describePalette(n) + (paletteColorWords?.(n) ? ' ' + paletteColorWords(n) : '')).join('\n')}` : '';
  const text = `${headerFor(meta)}\nParts of a sensory report that the person chose to share, in their own choices and words:\n\n${body}${notes}`;
  return { text, meta, chars: text.length, fits: text.length <= MAX_SHARED_CHARS };
}
