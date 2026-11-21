// Spots a reply that gives the same words the coach already gave earlier in the conversation. A small model sometimes answers a
// follow-up ("I'm worried it will upset her") by repeating the sentence it offered the turn before. Two replies repeat when they
// share a run of ten words in a row; punctuation and capitals are ignored.
const words = (s: string): string[] =>
  s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}'\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);

const grams = (w: string[], run: number): string[] => {
  const out: string[] = [];
  for (let i = 0; i + run <= w.length; i++) out.push(w.slice(i, i + run).join(' '));
  return out;
};

export function repeatsEarlier(reply: string, earlier: string[], run = 10): boolean {
  const mine = new Set(grams(words(reply), run));
  if (mine.size === 0) return false;
  return earlier.some((e) => grams(words(e), run).some((g) => mine.has(g)));
}

/**
 * The reply without the sentences that share a run of `run` words with any of `texts` (the words of a card the page showed). The model is not told about the card, so
 * this is the page's tidying, not an instruction to the model. If every sentence overlaps, or none does, the reply is returned unchanged.
 */
export function withoutRepeatedSentences(reply: string, texts: string[], run = 10): string {
  const theirs = new Set(texts.flatMap((t) => grams(words(t), run)));
  if (theirs.size === 0) return reply;
  const parts = reply.split(/(?<=[.!?])\s+/).filter((x) => x.trim());
  const kept = parts.filter((p) => !grams(words(p), run).some((g) => theirs.has(g)));
  return kept.length === 0 || kept.length === parts.length ? reply : kept.join(' ');
}
