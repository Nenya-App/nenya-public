// The address guard (docs/address-guard.md). The coach is told to point to findahelpline.com for other countries. A small model sometimes
// writes the address from memory and gets it wrong (findhelpline.com, helpaglobal.com, helpahline.com ...), which in a crisis can send a person to
// a site that does not exist or to a stranger's page. So every web address in a reply is checked against a short ALLOW-LIST of the addresses the site
// itself uses. An address that is not on the list is either swapped for the correct helpline address (when the sentence is about finding help) or
// taken out, with the sentence tidied. An address on the list is never touched. Pure: no network, no model, no storage.
//
// What counts as a web address: a full URL (http:// or https://), a www. form, a bare name.tld with a common top-level domain (com, org, net, biz,
// ca, gov, info, io, edu, co, uk, au, nz, ie, de, ai, app, help; lower case or ALL CAPS, never "Help" at the start of a sentence), and the spaced or spelled-out forms
// ("findahelpline dot com", "findahelpline . com", "findahelpline[.]com", "findahelpline (dot) com").
// What it leaves alone, on purpose:
//   - email addresses (name@host.tld): they are not web addresses; the check never starts a match right after an "@";
//   - file names with other endings (notes.txt, report.pdf), abbreviations (e.g., U.S., a.m., Ph.D.), decimals (3.5), and text where a period is followed
//     by a space ("It helps. Info is below.");
//   - a word that merely contains a top-level domain ("community", "network").
// A file name that ends in one of the domain endings above (a file called report.net) cannot be told apart from an address by looking at it, so it is treated as an address.

import { ABOUT_IDS, aboutPath } from './aboutRoutes.ts';

/** The correct address for finding a helpline in another country (the site's own words, src/lib/safetyFlags.ts and the coach's instructions). */
export const HELPLINE_ADDRESS = 'findahelpline.com';

/** Said when taking out an address would leave nothing of the reply. A DRAFT sentence: the owner has not approved it. */
export const ADDRESS_FALLBACK = 'I cannot give you a web address for that.';

/** The switch: off unless COACH_ADDRESS_GUARD is exactly 'on' (like the boundary guard). */
export const addressGuardOn = (value: string | undefined = process.env.COACH_ADDRESS_GUARD): boolean => value === 'on';

export interface AllowedAddress {
  /** The host, lower case, without www. */
  host: string;
  /** The paths that may follow it, lower case, no trailing slash ('' is the bare address). Anything else after the host (another path, a query, a port) is not on the list. */
  paths: readonly string[];
  /** Where the site uses it. */
  why: string;
}

const NENYA_PATHS: readonly string[] = [
  '',
  '/about',
  ...ABOUT_IDS.map((id) => aboutPath(id)), // every About page, at the address the page has (/about/<id>; the Six Lenses page is /about/six-lenses)
  '/about/six-gateways', // the old address of the Six Lenses page still opens it
  '/my-transcript',
  '/verify',
  '/guestbook',
  '/coach',
  '/why-nenya',
];

/**
 * The allow-list. Every entry is an address the site already shows a person:
 *   findahelpline.com            the coach's instructions and the site's own crisis text (safetyFlags.ts, "Outside the US and Canada")
 *   iasp.info/crisis-centres-helplines   the same line (safetyFlags.ts); the bare iasp.info is allowed too
 *   stopitnow.org                the resource for people worried about their own thoughts about children (externalLinks.ts, the site's resource list)
 *   report.cybertip.org          NCMEC's report page, in the site's own text for reporting images of children (safetyFlags.ts)
 *   nenya.biz and its pages      the site: the home page and every About page (src/lib/aboutRoutes.ts), my-transcript, verify, guestbook, coach, why-nenya
 *   nənya.biz                    the lower-case mark of the name (written with a schwa, "nunya biz"): a mention of the mark, not an address anybody could visit
 *   github.com/Nenya-App/nenya-public    the public code (externalLinks.ts)
 *   cnvc.org, nvcacademy.com     named in the site's own answer about Nonviolent Communication (aboutNenya.ts); credited and linked out
 *   yvetteerasmus.com            the featured NVC resource on the site's "Our Approach" page (NVCMethod.tsx)
 * Everything else is not on the list, including addresses of real, useful sites: the coach has no business inventing a link, and a real one is no safer to
 * leave in a crisis reply than a wrong one is. To add one, put it here with the reason and add a test.
 */
export const ALLOWED_ADDRESSES: readonly AllowedAddress[] = [
  { host: HELPLINE_ADDRESS, paths: [''], why: 'the helpline finder named in the coach instructions and the distress text' },
  { host: 'iasp.info', paths: ['', '/crisis-centres-helplines'], why: 'the crisis-centre directory in the distress text' },
  { host: 'stopitnow.org', paths: [''], why: 'a resource in the distress text (people worried about their own thoughts about children)' },
  { host: 'report.cybertip.org', paths: [''], why: 'the reporting page in the distress text' },
  { host: 'nenya.biz', paths: NENYA_PATHS, why: 'the site itself and its pages' },
  { host: 'nənya.biz', paths: [''], why: 'the lower-case mark of the name' },
  { host: 'github.com', paths: ['/nenya-app/nenya-public'], why: 'the public code' },
  { host: 'cnvc.org', paths: [''], why: 'credited in the site\'s answer about Nonviolent Communication' },
  { host: 'nvcacademy.com', paths: [''], why: 'named in the site\'s answer about Nonviolent Communication' },
  { host: 'yvetteerasmus.com', paths: [''], why: 'featured on the site\'s Our Approach page' },
];

export interface FoundAddress {
  /** Where it is in the text: [start, end). */
  start: number;
  end: number;
  /** The text as written. */
  raw: string;
  /** The host, lower case, without www., with spelled-out dots turned into dots. */
  host: string;
  /** What followed the host (a path, query, fragment, or port), as written; '' when nothing. */
  rest: string;
  /** It was written with http:// or https://. */
  schemed: boolean;
  /** It is on the allow-list. */
  allowed: boolean;
}

const TLDS = ['com', 'org', 'net', 'biz', 'ca', 'gov', 'info', 'io', 'edu', 'co', 'uk', 'au', 'nz', 'ie', 'de', 'ai', 'app', 'help'];
const W = '[\\p{L}\\p{N}]';
const LABEL = `${W}(?:[\\p{L}\\p{N}-]*${W})?`;
const SEP = '(?:\\s*[\\[(]\\s*(?:\\.|[dD][oO][tT])\\s*[\\])]\\s*|\\s+(?:[dD]ot|DOT)\\s+|\\s+\\.\\s+|\\.)';
const TLD = `(?:${TLDS.join('|')}|${TLDS.map((t) => t.toUpperCase()).join('|')})(?:\\.[a-z]{2})?`;
const TAIL = `(?::\\d{1,5})?(?:[/?#][^\\s<>"'\`]*)?`;
const PATTERN = new RegExp(
  `(?<![\\p{L}\\p{N}@._%+/\\\\-])(?:` +
    `(?<scheme>https?:\\/\\/)(?<shost>[^\\s/?#<>"'\`]+)(?<srest>[/?#][^\\s<>"'\`]*)?` +
    `|(?<wlabels>www\\.${LABEL}(?:\\.${LABEL})+)(?<wrest>${TAIL})` +
    `|(?<bare>${LABEL}(?:${SEP}${LABEL})*?${SEP}${TLD})(?![\\p{L}\\p{N}-])(?<brest>${TAIL})` +
  `)`,
  'gu',
);
const TRAILING_PUNCT = /[.,;:!?)\]}>]+$/;

const spelled = (h: string): string => h.replace(/\s*[[(]\s*(?:\.|dot)\s*[\])]\s*|\s+dot\s+|\s+\.\s+/gi, '.').toLowerCase();
const stripWww = (h: string): string => h.replace(/^www\./, '');

function lookup(host: string, rest: string): boolean {
  const entry = ALLOWED_ADDRESSES.find((a) => a.host === host);
  if (!entry) return false;
  const path = rest.replace(/\/+$/, '').toLowerCase(); // a trailing slash is the same address; a port, query or fragment is not on the list
  return entry.paths.includes(path);
}

/** Every web address in the text, in order, each with whether it is on the allow-list. */
export function findAddresses(text: string): FoundAddress[] {
  const out: FoundAddress[] = [];
  for (const m of text.matchAll(PATTERN)) {
    const g = m.groups ?? {};
    let start = m.index ?? 0;
    let raw = m[0];
    let host: string; let rest: string;
    const schemed = !!g.scheme;
    if (schemed) {
      host = String(g.shost); rest = g.srest ?? '';
      // Trailing sentence punctuation belongs to the sentence, not the address.
      const full = (host + rest);
      const trimmed = full.replace(TRAILING_PUNCT, '');
      if (trimmed.length < full.length) { raw = raw.slice(0, raw.length - (full.length - trimmed.length)); host = trimmed.slice(0, host.length); rest = trimmed.slice(host.length); }
      host = host.toLowerCase();
      if (!host.includes('.') && !host.includes('[')) continue; // "https://localhost" or "https://" with nothing: not an address a person can be sent to
    } else if (g.wlabels) {
      host = g.wlabels.toLowerCase(); rest = g.wrest ?? '';
    } else {
      host = spelled(String(g.bare)); rest = g.brest ?? '';
      if (!/\p{L}/u.test(host.split('.')[0] ?? '')) continue; // "3.com", "1.5.net": a number, not a name
    }
    if (rest) { const t = rest.replace(TRAILING_PUNCT, ''); if (t.length < rest.length) { raw = raw.slice(0, raw.length - (rest.length - t.length)); rest = t; } }
    host = stripWww(host);
    const allowed = !host.includes('@') && lookup(host, rest);
    out.push({ start, end: start + raw.length, raw, host, rest, schemed, allowed });
  }
  return out;
}

/** The persona check: true when every web address in the reply is on the allow-list (and true when there is none). */
export const hasOnlyAllowedAddresses = (text: string): boolean => findAddresses(text).every((a) => a.allowed);

// ---- the repair

/** Words that say a sentence is about finding help: a helpline, a crisis line, a person to reach, another country. */
const HELP_CONTEXT = new RegExp(
  '\\b(?:help ?lines?|hot ?lines?|crisis|lifeline|988|911|suicide|suicidal|distress|emergency|call or text|text or call|reach(?:ing)? out|reach someone|someone you trust|trusted (?:person|friend|adult)' +
  '|(?:other|your|another) countr(?:y|ies)|outside (?:of )?the (?:US|U\\.S\\.|United States|States)|local (?:help|support|services?|lines?|resources?)|support (?:lines?|services?|groups?)' +
  '|get help|find(?:ing)? (?:an? |the |local |other |more |another )*(?:help|support|helplines?|hotlines?|lines?|counsel+ors?|someone)|talk to (?:someone|a person)|counsel+ors?|therapists?)\\b',
  'i',
);

/** Where the sentence around [s, e) starts and ends: after the last sentence end or line break before it, and just after the next one. */
function sentenceBounds(text: string, s: number, e: number): [number, number] {
  let ss = 0;
  for (const m of text.slice(0, s).matchAll(/[.!?]["')\]]*\s+|\n\s*/g)) ss = (m.index ?? 0) + m[0].length;
  const after = /[.!?]["')\]]*(?=\s|$)|\n/.exec(text.slice(e));
  const se = after ? e + (after.index ?? 0) + (after[0] === '\n' ? 0 : after[0].length) : text.length;
  return [ss, se];
}

const FILLER_END = /(^|[\s(])(?:(?:you can|you could|you may|please|just|also|feel free to|i suggest)\s*)$/i;
const VERB_END = /(^|[\s(])(?:visit|see|check out|check|go to|head (?:over )?to|try|look up|(?:find|get|read|see) (?:it|them|that|this|more|more info|more information|one)|available|more (?:info|information|details)(?: (?:at|on))?)\s*$/i;
const PREP_END = /\s*\b(?:at|on|via|from|through|using|is|are|(?:can be )?found (?:at|on))\s*$/i;
const CONJ_START = /^\s*,?\s*(?:or|and)\s+(?=\S)/i;
const PREP_START = /^(?:at|on|via|from|through|using)\s+/i;
const VERB_START = /^(?:call|text|visit|reach|talk|speak|see|check|try|contact|ask|find|go|head|use|read|look|get|write|send)\b/i;
const wordsIn = (s: string): number => (s.match(/[\p{L}\p{N}']+/gu) ?? []).length;

/** The sentence with [a, b) (an address, relative to it) taken out and what is left tidied. Empty when too little remains to be a sentence. */
function without(sentence: string, a: number, b: number): string {
  let before = sentence.slice(0, a);
  let after = sentence.slice(b);
  const hadConj = CONJ_START.test(after);
  const next = after.replace(CONJ_START, '');
  if (hadConj && /^(?:(?:at|on|via|from|through|using)\s+)?(?:https?:\/\/|www\.|[\p{L}\p{N}-]+(?:\.|\s+dot\s+)[\p{L}\p{N}])/iu.test(next) && findAddresses(next.replace(/^(?:at|on|via|from|through|using)\s+/i, '')).some((f) => f.start === 0)) {
    // "find a helpline at X or Y" -> "find a helpline at Y": the words in front stay, the address and its "or" (and a second "at") go
    after = ' ' + next.replace(PREP_START, '');
  } else {
    before = before.replace(PREP_END, '');
    for (let i = 0; i < 4; i++) { const n = before.replace(VERB_END, '$1').replace(FILLER_END, '$1'); if (n === before) break; before = n; }
    if (hadConj && VERB_START.test(next)) after = ' ' + next; // "visit X or call 988" -> "call 988"
  }
  // brackets around it: (address) or <address>
  if (/[(<]\s*$/.test(before) && /^\s*[)>]/.test(after)) { before = before.replace(/[(<]\s*$/, ''); after = after.replace(/^\s*[)>]/, ''); }
  let out = (before + after)
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+(?:or|and)\s*([.!?]|$)/gi, '$1')
    .replace(/\s+([,;:.!?])/g, '$1')
    .replace(/([,;:])\s*([.!?])/g, '$2')
    .replace(/,\s*,/g, ',')
    .replace(/\(\s*\)/g, '')
    .replace(/^[\s,;:]+/, '')
    .trim();
  if (/^[a-z]/.test(out) && /^[A-Z]/.test(sentence.trimStart())) out = out[0].toUpperCase() + out.slice(1); // the start went with the address: the new start takes the capital
  if (!before.trim() && /^(?:for|to|about|if|when|where|because|which|that)\b/i.test(out)) return ''; // what is left is the tail of a sentence that began with the address ("Visit X for more")
  // A sentence with too little left is dropped, unless a correct address is still in it (that is never thrown away).
  return wordsIn(out) < 3 && !findAddresses(out).some((f) => f.allowed) ? '' : out;
}

/** Markdown links [label](address): a wrong address in the target keeps the label, and in a sentence about help the target becomes the correct address. */
function fixMarkdownLinks(text: string): { text: string; swapped: number; removed: number } {
  let out = text; let swapped = 0; let removed = 0;
  const links = [...text.matchAll(/\[([^\]\n]*)\]\(\s*<?([^\s)>]+)>?\s*\)/g)].reverse();
  for (const m of links) {
    const target = findAddresses(m[2]);
    if (!target.length || target.every((f) => f.allowed)) continue;
    const at = m.index ?? 0;
    const labelHasAddress = findAddresses(m[1]).length > 0;
    const [ss, se] = sentenceBounds(out, at, at + m[0].length);
    const helpy = HELP_CONTEXT.test(out.slice(ss, at) + ' ' + m[1] + ' ' + out.slice(at + m[0].length, se));
    const hasCorrect = findAddresses(out.slice(ss, se)).some((f) => f.allowed && f.host === HELPLINE_ADDRESS);
    const label = m[1].trim();
    let into: string;
    if (!labelHasAddress && label && helpy && !hasCorrect) { into = `[${m[1]}](https://${HELPLINE_ADDRESS})`; swapped++; } else { into = label; if (!labelHasAddress) removed++; }
    out = out.slice(0, at) + into + out.slice(at + m[0].length);
  }
  return { text: out, swapped, removed };
}

export interface AddressRepair {
  reply: string;
  changed: boolean;
  /** How many wrong addresses were swapped for the correct helpline address. */
  swapped: number;
  /** How many were taken out. */
  removed: number;
}

/**
 * Takes every address not on the allow-list out of the reply: swapped for findahelpline.com when its sentence is about finding help or a helpline (and does not already
 * hold a correct address), otherwise taken out with the sentence tidied (a sentence with too little left is dropped). An address on the list is never touched, and nothing
 * else in the reply changes except the tidy-up of a sentence that lost an address. Returns the same text when there is nothing to do. If nothing at all is left, the
 * site's draft sentence stands in.
 */
export function repairAddresses(reply: string): AddressRepair {
  if (!findAddresses(reply).some((a) => !a.allowed)) return { reply, changed: false, swapped: 0, removed: 0 };
  const md = fixMarkdownLinks(reply);
  let text = md.text;
  let swapped = md.swapped; let removed = md.removed;
  const wrong = findAddresses(text).filter((a) => !a.allowed);
  for (const a of [...wrong].reverse()) { // from the end, so the places of the earlier ones hold
    const [ss, se] = sentenceBounds(text, a.start, a.end);
    const inSentence = findAddresses(text.slice(ss, se));
    const hasCorrect = inSentence.some((f) => f.allowed && f.host === HELPLINE_ADDRESS);
    const context = text.slice(ss, a.start) + ' ' + text.slice(a.end, se);
    if (!hasCorrect && HELP_CONTEXT.test(context)) {
      text = text.slice(0, a.start) + (a.schemed ? 'https://' : '') + HELPLINE_ADDRESS + text.slice(a.end);
      swapped++;
      continue;
    }
    const left = without(text.slice(ss, se), a.start - ss, a.end - ss);
    if (left) text = text.slice(0, ss) + left + text.slice(se);
    else { // the whole sentence goes, with the space that joined it to the next (or the one before it at the end)
      let rest = text.slice(se).replace(/^[ \t]+/, '');
      if (text.slice(0, ss).endsWith('\n') && rest.startsWith('\n')) rest = rest.replace(/^\n+/, ''); // a line that held only the address: its line breaks go with it
      text = (rest ? text.slice(0, ss) : text.slice(0, ss).replace(/[ \t]+$/, '')) + rest;
    }
    removed++;
  }
  text = text.trim();
  if (!text) text = ADDRESS_FALLBACK;
  return { reply: text, changed: text !== reply, swapped, removed };
}
