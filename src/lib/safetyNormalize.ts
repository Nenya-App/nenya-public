// Undoing common spelling tricks before the crisis phrases are matched (2026-11-19, step 2 of the suicidal-ideation audit).
// DRAFT: awaiting clinician review.
//
// What it does: given one message, it returns a few alternative spellings of it ("variants"), each with one family of tricks undone: invisible
// and look-alike characters, spaced-out or dotted letters ("k i l l", "k.i.l.l"), digits and symbols for letters ("k1ll", "5uicide", "m@ke"),
// censor marks ("su*cide"), and stretched letters ("killlll"). The checker matches the phrase lists against the message as written AND against these
// variants, so a variant can only add a match, never remove one.
//
// Rules that keep it from inventing matches out of ordinary text:
//   - URLs, email addresses and `code` are cut out of the variants first (usernames, links and snippets are full of digits and symbols).
//   - A digit or symbol counts as a letter only inside a word that already has at least two real letters ("k1" and part numbers like "A1B2" are left alone;
//     a lone "5", a date or a price is never touched). Symbols other than "$" only count between two letters.
//   - Spaced letters are joined only in a run of three or more single letters ("a b" and "I m" are left alone).
//   - A variant still has to match a whole phrase rule, with that rule's own "unless" clauses, to flag anything.
// The variants are used for matching only. They are never stored, logged, sent or shown anywhere. The work is a handful of cheap regex passes over at
// most 1,000 characters, and a stop on the message as written skips it entirely.

import { INVISIBLE } from './promptGuard.ts';

const MAX_CHARS = 1000;
const MAX_VARIANTS = 24;

// Letters from other alphabets that look like Latin ones (Cyrillic and Greek mostly). NFKC already folds full-width and mathematical letters.
const LOOKALIKE: Record<string, string> = {
  а: 'a', е: 'e', о: 'o', р: 'p', с: 'c', у: 'y', х: 'x', і: 'i', ј: 'j', ѕ: 's', һ: 'h', ԁ: 'd', ԛ: 'q', ԝ: 'w', к: 'k', м: 'm', т: 't', н: 'h', в: 'b', ӏ: 'l',
  α: 'a', ο: 'o', ρ: 'p', ι: 'i', κ: 'k', ν: 'v', τ: 't', υ: 'u', ε: 'e', η: 'n', β: 'b', χ: 'x', μ: 'u', ѵ: 'v', ɡ: 'g', ɪ: 'i', ʟ: 'l', ᴅ: 'd', ᴇ: 'e', ᴋ: 'k', ᴍ: 'm', ɴ: 'n', ᴏ: 'o', ᴜ: 'u', ꜱ: 's',
};
const LOOKALIKE_RE = new RegExp(`[${Object.keys(LOOKALIKE).join('')}]`, 'g');

// Not words the person wrote: links, email addresses, `code`.
const NOT_PROSE = /```[\s\S]*?```|`[^`\n]*`|\b(?:https?:\/\/|www\.)\S+|\S+@\S+\.[a-z]{2,}\b/gi;

// Three or more single letters, each separated from the next by one space, dot, dash, underscore, star or middle dot: "k i l l", "k.i.l.l", "k-i-l-l".
const SPACED = /(?<![a-z0-9'])(?:[a-z][ .\-_*·•]){2,}[a-z](?![a-z0-9'])/g;

// The same with a dot, dash, underscore or star only (words stay apart by their spaces): "k-i-l-l m-y-s-e-l-f".
const PUNCTED = /(?<![a-z0-9'])(?:[a-z][.\-_*\u00b7\u2022]){2,}[a-z](?![a-z0-9'])/g;

// Digits and symbols used for letters. "1" is ambiguous (i or l), so both are tried.
const DIGITS: Record<string, string> = { '0': 'o', '3': 'e', '4': 'a', '5': 's', '7': 't' };
const SYMBOLS: Record<string, string> = { '@': 'a', '$': 's', '!': 'i', '|': 'i', '+': 't' };
const TOKEN = /[a-z0-9@$!|+]+/g;

/** The message with invisible characters, accents, and look-alike letters undone, lower-cased. Always safe: it only reads. */
function fold(text: string): string {
  return text
    .normalize('NFKC')
    .replace(INVISIBLE, '')
    .replace(/­/g, '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(LOOKALIKE_RE, (c) => LOOKALIKE[c] ?? c)
    .replace(/[‘’]/g, "'");
}

function leet(s: string, one: 'i' | 'l'): string {
  return s.replace(TOKEN, (tok) => {
    if (tok.replace(/[^a-z]/g, '').length < 2 || !/[0-9@$!|+]/.test(tok)) return tok;
    let out = '';
    for (let i = 0; i < tok.length; i++) {
      const c = tok[i];
      const between = i > 0 && i < tok.length - 1 && /[a-z0-9]/.test(tok[i - 1]) && /[a-z0-9]/.test(tok[i + 1]);
      if (c === '1') out += one;
      else if (DIGITS[c]) out += DIGITS[c];
      else if (SYMBOLS[c] && (c === '$' || between)) out += SYMBOLS[c];
      else out += c;
    }
    return out;
  });
}

const CENSOR = /(?<=[a-z])[*#_]+(?=[a-z])/g;
const censored = (s: string): boolean => /[a-z][*#_]+[a-z]/.test(s);
const STRETCH = /([a-z])\1{2,}/g;
const stretched = (s: string): boolean => /([a-z])\1\1/.test(s);

/** Other spellings of the message with one family of tricks undone each; never includes the message as written. Matching only. */
export function evasionVariants(text: string): string[] {
  const asWritten = text.replace(/[‘’]/g, "'").toLowerCase();
  const base = fold(text.slice(0, MAX_CHARS)).replace(NOT_PROSE, ' ');
  const out = new Set<string>([base]);
  const join = (m: string) => m.replace(/[ .\-_*\u00b7\u2022]/g, '');
  out.add(base.replace(SPACED, join));
  // "I k i l l": the word "I" or "a" in front of a spaced-out word is kept as a word.
  out.add(base.replace(SPACED, (m) => (/^[ia][ .\-_*\u00b7\u2022]/.test(m) ? m[0] + ' ' + join(m.slice(2)) : join(m))));
  out.add(base.replace(PUNCTED, join));
  for (const b of [...out]) {
    if (/[a-z][0-9@$!|+]|[0-9@$!|+][a-z]/.test(b)) {
      out.add(leet(b, 'i'));
      out.add(leet(b, 'l'));
    }
    if (censored(b)) for (const v of 'aeiou') out.add(b.replace(CENSOR, v));
  }
  for (const v of [...out]) {
    if (stretched(v)) {
      out.add(v.replace(STRETCH, '$1'));
      out.add(v.replace(STRETCH, '$1$1'));
      // vowels to one, other letters to two: "kiiiilll" -> "kill"
      out.add(v.replace(STRETCH, (_m, c: string) => (/[aeiou]/.test(c) ? c : c + c)));
    }
  }
  return [...new Set([...out].map((v) => v.replace(/\s+/g, ' ').trim()))].filter((v) => v !== asWritten && v !== '').slice(0, MAX_VARIANTS);
}
