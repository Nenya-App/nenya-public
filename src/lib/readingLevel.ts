// A rough reading-level estimate (Flesch-Kincaid grade) for short interface text, used by tests to keep gateway wording plain.
// WCAG 2.2 AAA 3.1.5 asks for text understandable at a lower-secondary level (about US grades 7 to 9). Syllables are counted by
// a vowel-group rule, which is approximate; it is a guard against drift, not a measure to quote.

export function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const trimmed = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
  const groups = trimmed.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

/** Flesch-Kincaid grade for a passage (sentences split on . ! ? ; and line ends). */
export function gradeLevel(text: string): number {
  const sentences = text.split(/[.!?;:\n]+/).map((s) => s.trim()).filter((s) => /[a-z]/i.test(s));
  const words: string[] = text.match(/[A-Za-z’']+/g) ?? [];
  if (!sentences.length || !words.length) return 0;
  const syl = words.reduce((n, w) => n + syllables(w), 0);
  return 0.39 * (words.length / sentences.length) + 11.8 * (syl / words.length) - 15.59;
}
