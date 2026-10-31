// Removes common identifiers from text before it is sent to the AI in the /coach
// demo. Used by the page (so identifiers never leave the device) and again by the
// Netlify function (in case the page was bypassed).
//
// This is pattern matching, not understanding. It reliably catches structured
// identifiers (emails, phone numbers, card and ID numbers, links, many street
// addresses). Names are only caught when they follow a telltale phrase ("my name
// is", "my sister Maria", "Dr. Lee"), so most names will NOT be caught. Nothing
// that uses this may claim anonymity.

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
  '(?:wife|husband|partner|boyfriend|girlfriend|fianc[ée]e?|ex|mom|mother|dad|father|brother|sister|son|daughter|boss|manager|coworker|co-worker|friend|best friend|roommate|therapist|doctor|teacher|neighbor|landlord|cousin|aunt|uncle|grandmother|grandfather|grandma|grandpa)';

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
