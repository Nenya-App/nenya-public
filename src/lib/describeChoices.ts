// The description box is filled with the person's own choices (owner's comment sheet, 2026-11-18: "should be filled with the user's choices", and the entries go into "describe the movement"). The words chosen
// from the lists, and any words added with Add, make the text; once the person types in the box themselves it is theirs and stops following the choices. Pure, so the rules are tested.

/** "Upward, spiraling and fluid": the words in the order chosen, once each, first letter capital. Empty when there are none. */
export function composeDescription(words: string[]): string {
  const seen = new Set<string>(), list: string[] = [];
  for (const w of words.map((x) => x.trim()).filter(Boolean)) { const k = w.toLowerCase(); if (!seen.has(k)) { seen.add(k); list.push(w.toLowerCase()); } }
  if (list.length === 0) return '';
  const text = list.length === 1 ? list[0] : `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
  return `${text[0].toUpperCase()}${text.slice(1)}.`;
}

/** Adds a word to text the person owns: after a comma, unless it is already there. */
export function appendToOwnText(text: string, word: string): string {
  const t = text.trim().replace(/[.]$/, ''), w = word.trim();
  if (!w) return text;
  if (t.toLowerCase().split(/[,;]\s*|\sand\s/).includes(w.toLowerCase())) return text;
  return t ? `${t}, ${w}` : w;
}
