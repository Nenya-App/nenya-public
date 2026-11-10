// Removes common identifiers from text before it is sent to the AI in the /coach
// demo. Used by the page (so identifiers never leave the device) and again by the
// Netlify function (in case the page was bypassed).
//
// This is pattern matching, not understanding. It reliably catches structured
// identifiers (emails, phone numbers, card and ID numbers, links, many street
// addresses). Names are only caught when they follow a telltale phrase ("my name
// is", "my sister Maria", "Dr. Lee"), so most names will NOT be caught. Nothing
// that uses this may claim anonymity.

import { AMBIGUOUS_NAMES, GIVEN_NAMES, SAFE_SURNAMES, SURNAMES } from './givenNames.ts';

export interface ScrubResult {
  text: string;
  counts: Record<string, number>;
  total: number;
}

const luhn = (digits: string): boolean => {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
};

const STREET_SUFFIX =
  '(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Way|Place|Pl|Terrace|Ter|Circle|Cir|Highway|Hwy|Parkway|Pkwy|street|avenue|road|boulevard|lane|drive|court|place)';

const RELATION =
  '(?:wife|husband|partner|boyfriend|girlfriend|fianc[ée]e?|ex|mom|mother|dad|father|brother|sister|son|daughter|boss|manager|coworker|co-worker|friend|best friend|roommate|therapist|doctor|teacher|neighbor|landlord|cousin|aunt|uncle|grandmother|grandfather|grandma|grandpa|niece|nephew|colleague|supervisor|classmate|teammate|sibling|stepmom|stepdad|stepmother|stepfather|mentor|sponsor|counselor|neighbour|client|patient|ex-husband|ex-wife|ex-boyfriend|ex-girlfriend|kid|child|baby|dog|cat)';

const NAME = "[A-Z][a-z]{1,}(?:[-'][A-Z]?[a-z]+)?(?:\\s+[A-Z][a-z]{1,}){0,2}";

interface Rule {
  tag: string;
  pattern: RegExp;
  // Replace the whole match (default) or only capture group 1.
  group1Only?: boolean;
  // Extra check on the matched text; return false to leave it alone.
  accept?: (match: string) => boolean;
}

const ordered: Rule[] = [
  { tag: 'EMAIL', pattern: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g },
  { tag: 'LINK', pattern: /\b(?:https?:\/\/|www\.)[^\s<>"')]+/gi },
  {
    tag: 'CARD',
    pattern: /(?<!\d)\d(?:[ -]?\d){12,18}(?!\d)/g,
    accept: (m) => luhn(m.replace(/\D/g, '')),
  },
  { tag: 'SSN', pattern: /(?<!\d)\d{3}-\d{2}-\d{4}(?!\d)/g },
  {
    tag: 'IP',
    pattern: /(?<![\d.])(?:\d{1,3}\.){3}\d{1,3}(?![\d.])/g,
    accept: (m) => m.split('.').every((n) => Number(n) <= 255),
  },
  { tag: 'PHONE', pattern: /(?<!\d)(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}(?!\d)/g },
  { tag: 'PHONE', pattern: /(?<![\d+])\+\d{1,3}[\s.-]?\d(?:[\s.-]?\d){7,12}(?!\d)/g },
  {
    tag: 'DATE OF BIRTH',
    pattern:
      /\b(?:born(?: on)?|dob|d\.o\.b\.?|date of birth(?: is)?|birth ?day is)\s*:?\s*(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}(?:st|nd|rd|th)?,?\s*\d{2,4})/gi,
    group1Only: true,
  },
  { tag: 'ADDRESS', pattern: /\bP\.?\s?O\.?\s+Box\s+\d+\b/gi },
  {
    tag: 'ADDRESS',
    pattern: new RegExp(
      `\\b\\d{1,6}\\s+(?:(?:[A-Z][A-Za-z0-9.'-]*|\\d+(?:st|nd|rd|th))\\s+){1,4}${STREET_SUFFIX}\\b\\.?(?:\\s*(?:#|Apt\\.?|Apartment|Unit|Suite|Ste\\.?)\\s*\\w+)?`,
      'g'
    ),
  },
  { tag: 'ZIP', pattern: /\b[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/g },
  { tag: 'HANDLE', pattern: /(?<![\w.])@[A-Za-z0-9_]{2,30}\b/g },
  // Names, only after a telltale phrase.
  {
    tag: 'NAME',
    pattern: new RegExp(`(?:[Mm]y name(?: is|'s)|[Cc]all me|[Ii] go by|[Ii] am called|[Ii]'m called)\\s+(${NAME})`, 'g'),
    group1Only: true,
  },
  {
    tag: 'NAME',
    pattern: new RegExp(`\\b[Mm]y\\s+${RELATION}(?:,\\s*|\\s+)(?:named\\s+)?(${NAME})`, 'g'),
    group1Only: true,
  },
  { tag: 'NAME', pattern: new RegExp(`\\bnamed\\s+(${NAME})`, 'g'), group1Only: true },
  {
    tag: 'NAME',
    pattern: new RegExp(`\\b(?:Dr|Mr|Mrs|Ms|Mx|Prof|Professor|Judge|Officer|Pastor|Rabbi|Imam)\\.?\\s+${NAME}`, 'g'),
  },
];


// ── Names with no telltale phrase ────────────────────────────────────────────
// "Maria yelled at me", "I told Jordan", "Me and Sam". Found by a list of common given names (src/lib/givenNames.ts), so a name that is not on the list is
// missed. Words that are also names (Will, Mark, Rose, Hope...) count only when the sentence shows it is a person: after "my sister", "told", "with", or
// beside a surname. A capitalised word right after a name is taken as its surname ("Maria Gonzalez", "Aroha Te Rangi").
const RELATION_WORDS = new Set('wife husband partner boyfriend girlfriend ex mom mother dad father brother sister son daughter boss manager coworker friend roommate therapist doctor teacher neighbor neighbour landlord uncle aunt cousin grandma grandmother grandpa grandfather grandson granddaughter nephew niece colleague client patient pastor named called dr mr mrs ms mx prof'.split(' '));
const PERSON_PREPS = new Set('with told tell asked ask call called saw miss missed love loved hate hated ignore ignored forgive forgave thank thanked'.split(' '));
const CAP = /(?<![\p{L}\p{N}_])(\p{Lu}\p{Ll}+(?:-\p{Lu}\p{Ll}+)?)(?![\p{L}\p{N}_])/gu;
const plain = (w: string): string => w.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const STOP_CAPS = new Set('i monday tuesday wednesday thursday friday saturday sunday january february march april may june july august september october november december the a an and but or so then yes no please thank thanks honestly sometimes maybe also because when while after before since if my our your his her their we you he she they it this that these those there here what why how who'.split(' '));

function scrubBareNames(input: string): { text: string; count: number } {
  let out = '';
  let last = 0;
  let count = 0;
  let prevEnd = -1; // end index of the previous token that was taken as a name
  let chain = 0;
  for (const m of input.matchAll(CAP)) {
    const t = m[1];
    const i = m.index ?? 0;
    const low = plain(t);
    const before = input.slice(0, i);
    const sentenceStart = /(?:^|[.!?]["')\]]*\s+|\n\s*)$/.test(before);
    const prevWord = (/(\p{L}+)[\s,]*$/u.exec(before)?.[1] ?? '').toLowerCase();
    const adjacentToName = prevEnd >= 0 && /^\s$/.test(input.slice(prevEnd, i));
    let isName = false;
    if (AMBIGUOUS_NAMES.has(low)) isName = !sentenceStart && (RELATION_WORDS.has(prevWord) || PERSON_PREPS.has(prevWord) || adjacentToName);
    else if (GIVEN_NAMES.has(low)) isName = true;
    else if (SAFE_SURNAMES.has(low)) isName = !STOP_CAPS.has(low);
    else if (SURNAMES.has(low)) isName = adjacentToName || RELATION_WORDS.has(prevWord);
    else if (adjacentToName && chain > 0 && chain < 3 && !STOP_CAPS.has(low) && !sentenceStart) isName = true; // the rest of a full name
    if (!isName) { chain = 0; prevEnd = -1; continue; }
    chain = adjacentToName ? chain + 1 : 1;
    out += input.slice(last, i) + '[NAME]';
    last = i + t.length;
    prevEnd = last;
    count++;
  }
  return { text: out + input.slice(last), count };
}

export function scrubPII(input: string): ScrubResult {
  let text = input;
  const counts: Record<string, number> = {};
  for (const rule of ordered) {
    text = text.replace(rule.pattern, (...args: unknown[]) => {
      const match = args[0] as string;
      if (rule.accept && !rule.accept(match)) return match;
      counts[rule.tag] = (counts[rule.tag] ?? 0) + 1;
      if (rule.group1Only) {
        const name = args[1] as string;
        return match.slice(0, match.length - name.length) + `[${rule.tag}]`;
      }
      return `[${rule.tag}]`;
    });
  }
  // Names with no telltale phrase, last, so the telltale rules above (which leave "[NAME]" behind) have had their say.
  const bare = scrubBareNames(text);
  if (bare.count) { text = bare.text; counts.NAME = (counts.NAME ?? 0) + bare.count; }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return { text, counts, total };
}

const NICE: Record<string, [string, string]> = {
  EMAIL: ['an email address', 'email addresses'],
  LINK: ['a link', 'links'],
  CARD: ['a card number', 'card numbers'],
  SSN: ['an ID number', 'ID numbers'],
  IP: ['an IP address', 'IP addresses'],
  PHONE: ['a phone number', 'phone numbers'],
  'DATE OF BIRTH': ['a birth date', 'birth dates'],
  ADDRESS: ['an address', 'addresses'],
  ZIP: ['a postal code', 'postal codes'],
  HANDLE: ['a username', 'usernames'],
  NAME: ['a name', 'names'],
};

/** "an email address and 2 phone numbers" */
export function describeScrub(counts: Record<string, number>): string {
  const parts = Object.entries(counts).map(([tag, n]) => {
    const [one, many] = NICE[tag] ?? ['an identifier', 'identifiers'];
    return n === 1 ? one : `${n} ${many}`;
  });
  if (parts.length <= 1) return parts[0] ?? '';
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}
