// Keeping names out of the coach's replies (docs/pii-names-scope.md). Names are scrubbed from what a person writes as far as patterns and a list of common names
// allow (src/lib/piiScrub.ts), but some get through. The coach is told never to use a person's name and to refer to people by role or pronoun; if a reply still
// repeats a capitalised word the person wrote (which is how a name that slipped through would come back), it is asked for again once, and then the sentences
// that repeat it are taken out. This is pattern matching and will sometimes act on a place or a brand: that is the safer mistake.

export const NAME_RULE =
  "Never use or repeat any person's name, even if one gets through in a message: refer to people by their role or a pronoun (your sister, your boss, they). Never ask for anyone's name, the person's own included.";

export const NAME_NOTE =
  "Your last reply repeated a name or a capitalised word the person wrote. Answer again without it: refer to people by their role or a pronoun, and do not repeat names.";

const CAP = /(?<![\p{L}\p{N}_])(\p{Lu}\p{Ll}{2,}(?:-\p{Lu}\p{Ll}+)?)(?![\p{L}\p{N}_])/gu;
// Capitalised words that are ordinary English at the start of a sentence, or days and months: never treated as names.
const COMMON = new Set('the and but for with that this then there they them their what when where which while who why how yes not now just really maybe also because since after before honestly sometimes sunday monday tuesday wednesday thursday friday saturday january february march april may june july august september october november december please thank thanks last next today yesterday tomorrow every everyone nobody anyone someone something nothing everything always never still even only well like been being have has had are was were will would could should can does did our your his her its mine yours into onto from about over under again every'.split(' '));

/** Capitalised words in the person's messages that might be names: not at the start of a sentence, or at the start but not a common English word. */
export function possibleNames(texts: string[]): string[] {
  const found = new Set<string>();
  for (const t of texts) {
    for (const m of t.matchAll(CAP)) {
      const w = m[1];
      if (COMMON.has(w.toLowerCase())) continue;
      if (w === 'I') continue;
      const before = t.slice(0, m.index ?? 0);
      const atStart = /(?:^|[.!?]["')\]]*\s+|\n\s*)$/.test(before);
      if (atStart && !/^[A-Z][a-z]+$/.test(w)) continue;
      // A capitalised word at the start of a sentence is a name only if it is not also written in lower case somewhere in the conversation.
      if (atStart && texts.some((x) => new RegExp(`(?<![\\p{L}])${w.toLowerCase()}(?![\\p{L}])`, 'u').test(x))) continue;
      found.add(w);
    }
  }
  return [...found];
}

/** Which of the person's possible names the reply repeats. */
export function echoedNames(userTexts: string[], reply: string): string[] {
  return possibleNames(userTexts).filter((n) => new RegExp(`(?<![\\p{L}\\p{N}_])${n}(?![\\p{L}\\p{N}_])`, 'u').test(reply));
}

/** The reply without the sentences that repeat the names. If that would leave nothing, the reply is returned as it was. */
export function withoutNames(reply: string, names: string[]): string {
  if (names.length === 0) return reply;
  const sentences = reply.trim().split(/(?<=[.!?])\s+/);
  const re = new RegExp(`(?<![\\p{L}\\p{N}_])(?:${names.join('|')})(?![\\p{L}\\p{N}_])`, 'u');
  const kept = sentences.filter((s) => !re.test(s));
  return kept.length === 0 ? reply : kept.join(' ');
}
