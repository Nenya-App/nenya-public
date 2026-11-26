// Turns plain text into pieces of text and safe links, for the words the site and the coach put in front of a visitor (the greeting, the closing note,
// safety notices, crisis resources, pre-written answers, and the AI's replies). It returns data, never markup: the page draws each piece as a React text
// node or as an anchor, so nothing the AI writes can become HTML. Only two kinds of thing become a link:
//   1. a plain https:// address, ASCII only, with no user name or password in it;
//   2. a bare web address from the fixed list below, which is the site's own resource list (the crisis resources and the code).
// Everything else stays text, including javascript:, data:, http:, mailto: and anything written as an HTML or Markdown link.

/** Web addresses written without https:// that the site already lists (src/lib/safetyFlags.ts, the emergency exit, the Terms). Matched without regard to case. */
export const KNOWN_RESOURCE_DOMAINS: readonly string[] = [
  'findahelpline.com',
  'iasp.info/crisis-centres-helplines',
  'stopitnow.org',
  'report.cybertip.org',
  'github.com/Nenya-App/nenya-public',
];

export type LinkPiece = { kind: 'text'; text: string } | { kind: 'link'; text: string; href: string };

const TRAILING = /[.,;:!?)\]}'"]+$/;
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
// ASCII only on purpose: a look-alike letter from another alphabet in a web address is how people are sent to the wrong site.
const URL_CHARS = '[A-Za-z0-9\\-._~:/?#@!$&*+,;=%()]+';
const PATTERN = new RegExp(
  `(?<![A-Za-z0-9@./_-])(?:https:\\/\\/${URL_CHARS}|(?:${KNOWN_RESOURCE_DOMAINS.map(esc).join('|')})(?![A-Za-z0-9_-]|\\.[A-Za-z0-9]))`,
  'gi',
);

/** The address to link to, or null when it is not a plain, safe https address. */
export function safeExternalHref(raw: string): string | null {
  if (typeof raw !== 'string' || raw.length === 0 || raw.length > 2048) return null;
  if (!/^https:\/\/[A-Za-z0-9\-._~:/?#@!$&*+,;=%()[\]]+$/i.test(raw)) return null; // https only; no spaces, quotes, angle brackets, control characters or non-ASCII
  let u: URL;
  try { u = new URL(raw); } catch { return null; }
  if (u.protocol !== 'https:' || u.username || u.password) return null;
  if (!u.hostname.includes('.') || u.hostname.split('.').some((l) => l === '' || l.startsWith('xn--'))) return null;
  return u.href;
}

const count = (s: string, c: string) => s.split(c).length - 1;

/** Splits text into plain pieces and safe links, keeping every character of the text in order. */
export function linkify(text: string): LinkPiece[] {
  const out: LinkPiece[] = [];
  let last = 0;
  const push = (t: string) => { if (t) out.push({ kind: 'text', text: t }); };
  for (const m of text.matchAll(PATTERN)) {
    let found = m[0];
    const at = m.index ?? 0;
    const bare = !/^https:\/\//i.test(found);
    if (!bare) {
      found = found.replace(TRAILING, '');
      // A closing bracket the address did not open belongs to the sentence around it, not to the address.
      while (count(found, ')') > count(found, '(')) found = found.slice(0, -1).replace(TRAILING, '');
    }
    const known = bare ? KNOWN_RESOURCE_DOMAINS.find((d) => d.toLowerCase() === found.toLowerCase()) : undefined;
    const href = safeExternalHref(bare ? `https://${known ?? found}` : found);
    if (!href) continue;
    push(text.slice(last, at));
    out.push({ kind: 'link', text: found, href });
    last = at + found.length;
  }
  push(text.slice(last));
  return out;
}
