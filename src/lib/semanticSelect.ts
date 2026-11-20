// Choosing which module or card applies by MEANING, not phrases (docs/small-model-detection-scope.md). A small sentence-embedding model turns the person's latest message and
// each topic's one-sentence public description into vectors; the topics whose vectors are closest (above a conservative threshold) are the candidates. This file is the
// pure part: vectors, similarity, ranking, and a plain word-overlap stand-in used by the tests and as the floor in the bake-off. The ONNX model itself is a separate piece,
// chosen by the bake-off and loaded like the screening model (pinned file hashes, our own server, fail open). It adds a signal to the phrase matcher and never decides alone.

export interface Embedder {
  /** One unit-length vector for each text. */
  embed(texts: string[]): Promise<number[][]>;
}

export interface Topic {
  id: string;
  kind: 'lens' | 'move' | 'safety' | 'resource' | 'card' | 'learn';
  /** One plain, public sentence. */
  description: string;
}

export interface Candidate { id: string; score: number }

/** Cosine similarity of two vectors of the same length (0 when either is empty or all zeros). */
export function cosine(a: number[], b: number[]): number {
  if (a.length === 0 || a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return na === 0 || nb === 0 ? 0 : dot / Math.sqrt(na * nb);
}

/** The topics ranked by similarity to the message vector, best first. */
export function rank(messageVec: number[], topicVecs: Record<string, number[]>): Candidate[] {
  return Object.entries(topicVecs).map(([id, v]) => ({ id, score: cosine(messageVec, v) })).sort((x, y) => y.score - x.score || x.id.localeCompare(y.id));
}

/** Up to `max` candidates at or above `threshold`. */
export const pick = (ranked: Candidate[], threshold: number, max = 3): Candidate[] => ranked.filter((c) => c.score >= threshold).slice(0, max);

/** Vectors for every topic, computed once. */
export async function topicVectors(embedder: Embedder, topics: Topic[]): Promise<Record<string, number[]>> {
  const vecs = await embedder.embed(topics.map((t) => t.description));
  return Object.fromEntries(topics.map((t, i) => [t.id, vecs[i]]));
}

/** The candidates for one message. */
export async function selectTopics(message: string, topics: Topic[], embedder: Embedder, opts: { threshold: number; max?: number; vectors?: Record<string, number[]> }): Promise<Candidate[]> {
  const vectors = opts.vectors ?? (await topicVectors(embedder, topics));
  const [mv] = await embedder.embed([message]);
  return pick(rank(mv, vectors), opts.threshold, opts.max ?? 3);
}

// ── The stand-in: hashed bag of words with a short stop list and crude stemming. No model, no network. It is only a floor to beat (and a way to test the plumbing).
const STOP = new Set('a an the and or but if then of to in on at for from with by as is are was were be been am i me my mine we our you your it its this that these those so just very really not no do does did have has had can could would should will about into over than too also what when where how why who'.split(' '));
const stem = (w: string): string => w.replace(/(?:ing|ed|es|s|ly)$/, '');
const DIM = 512;
const hash = (s: string): number => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) % DIM; };

export function lexicalEmbed(text: string): number[] {
  const v = new Array<number>(DIM).fill(0);
  const ws = text.toLowerCase().replace(/[^\p{L}\p{N}'\s]/gu, ' ').split(/\s+/).filter((w) => w && !STOP.has(w) && w.length > 1).map(stem);
  for (const w of ws) v[hash(w)] += 1;
  const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
  return n === 0 ? v : v.map((x) => x / n);
}

export const lexicalEmbedder: Embedder = { async embed(texts) { return texts.map(lexicalEmbed); } };
