// The "make your own" guides, shown in About as "The Smithy" (docs/smithy-guides-scope.md). The Markdown files in docs/smithy/ are the only source.
// This file reads one (a small, fixed set of formats; anything else is refused), holds the rules every guide must keep, and writes the text of the generated
// data file (scripts/build-smithy.mts). Pure: no files, no network, nothing kept.

export type Inline = { t: 'text' | 'code' | 'bold'; s: string } | { t: 'link'; s: string; href: string };
export type Block =
  | { k: 'h'; level: 2 | 3; text: Inline[] }
  | { k: 'p'; text: Inline[] }
  | { k: 'list'; ordered: boolean; items: Inline[][] }
  | { k: 'code'; lang: string; code: string }
  | { k: 'table'; head: Inline[][]; rows: Inline[][][] };
export interface Guide { number: number; slug: string; title: string; summary: string; status: 'draft' | 'approved'; files: string[]; blocks: Block[] }

export const REPO_BLOB = 'https://github.com/Nenya-App/nenya-public/blob/main/';
const REPO_PATH = '/Nenya-App/nenya-public';
const PLAIN_HOSTS = ['nodejs.org', 'www.gnu.org'];
const MAX_GRADE = 9.5;
const CLAIMS = /\b(heal|heals|healing|calm|calms|calming|stress relief|proven|anonymous|trauma-informed)\b/i;

const KEYS = ['number', 'slug', 'title', 'summary', 'status', 'files'] as const;
const INLINE = /`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+(?:\([^)\s]*\))?)\)/g;

function inline(s: string, line: number): Inline[] {
  const out: Inline[] = [];
  const plain = (t: string) => {
    if (!t) return;
    if (/<[a-zA-Z!/]/.test(t)) throw new Error(`line ${line}: raw HTML is not allowed outside code`);
    if (/&(#\d+|[a-zA-Z]+);/.test(t)) throw new Error(`line ${line}: write the character itself, not an HTML entity`);
    if (/(^|[\s(])([_*])(?=\S)[^_*]*[^\s_*]\2(?=$|[\s).,!?:;])/.test(t)) throw new Error(`line ${line}: italics are not supported`);
    out.push({ t: 'text', s: t });
  };
  let at = 0;
  for (const m of s.matchAll(INLINE)) {
    plain(s.slice(at, m.index));
    if (m[1] !== undefined) out.push({ t: 'code', s: m[1] });
    else if (m[2] !== undefined) {
      if (m[2].includes('](')) throw new Error(`line ${line}: put a link outside the bold marks`);
      out.push({ t: 'bold', s: m[2] });
    }
    else out.push({ t: 'link', s: m[3]!.replace(/`/g, ''), href: m[4]! });
    at = m.index! + m[0].length;
  }
  plain(s.slice(at));
  return out;
}

const cells = (row: string): string[] => {
  const inner = row.trim().replace(/^\|/, '').replace(/\|$/, '');
  const out: string[] = [''];
  let code = false;
  for (const c of inner) {
    if (c === '`') code = !code;
    if (c === '|' && !code) out.push('');
    else out[out.length - 1] += c;
  }
  return out.map((x) => x.trim());
};

export function parseGuide(md: string): Guide {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  if (lines[0] !== '---') throw new Error('line 1: the front block must start with ---');
  const meta: Record<string, string> = {};
  let i = 1;
  for (; i < lines.length && lines[i] !== '---'; i++) {
    const m = /^([a-z]+): (.+)$/.exec(lines[i]!);
    if (!m || !(KEYS as readonly string[]).includes(m[1]!)) throw new Error(`line ${i + 1}: not a front block key`);
    meta[m[1]!] = m[2]!.trim();
  }
  if (i >= lines.length) throw new Error('line 1: the front block is not closed');
  for (const k of KEYS) if (!meta[k]) throw new Error(`front block: "${k}" is missing`);
  const number = Number(meta.number);
  if (!Number.isInteger(number) || number < 1 || number > 99) throw new Error('front block: number must be a whole number from 1');
  if (!/^[a-z0-9-]+$/.test(meta.slug!)) throw new Error('front block: slug may hold only small letters, digits and hyphens');
  if (meta.status !== 'draft' && meta.status !== 'approved') throw new Error('front block: status must be draft or approved');

  const blocks: Block[] = [];
  const startsBlock = (l: string) => /^(```|#|\||- |\d+\. )/.test(l);
  i++;
  while (i < lines.length) {
    const line = lines[i]!;
    const n = i + 1;
    if (!line.trim()) { i++; continue; }
    if (line.startsWith('>') || line.startsWith('~~~') || /^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) throw new Error(`line ${n}: quotes, ~~~ blocks and divider lines are not supported`);
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const body: string[] = [];
      for (i++; i < lines.length && lines[i] !== '```'; i++) body.push(lines[i]!);
      if (i >= lines.length) throw new Error(`line ${n}: the code block is not closed`);
      blocks.push({ k: 'code', lang, code: body.join('\n') });
      i++;
      continue;
    }
    if (line.startsWith('#')) {
      const m = /^(##|###) (.+)$/.exec(line);
      if (!m) throw new Error(`line ${n}: only ## and ### headings are allowed`);
      blocks.push({ k: 'h', level: m[1]!.length as 2 | 3, text: inline(m[2]!, n) });
      i++;
      continue;
    }
    if (line.startsWith('|')) {
      const rows: string[] = [];
      for (; i < lines.length && lines[i]!.startsWith('|'); i++) rows.push(lines[i]!);
      if (rows.length < 2 || !cells(rows[1]!).every((c) => /^:?-+:?$/.test(c))) throw new Error(`line ${n}: a table needs a heading row and a --- row`);
      const head = cells(rows[0]!).map((c) => inline(c, n));
      const body = rows.slice(2).map((r) => cells(r).map((c) => inline(c, n)));
      if (body.some((r) => r.length !== head.length)) throw new Error(`line ${n}: every table row needs ${head.length} cells`);
      blocks.push({ k: 'table', head, rows: body });
      continue;
    }
    const item = /^(- |\d+\. )(.*)$/.exec(line);
    if (item) {
      const ordered = item[1] !== '- ';
      if (ordered && item[1] !== '1. ') throw new Error(`line ${n}: a numbered list must start at 1`);
      const items: string[] = [];
      for (; i < lines.length; i++) {
        const l = lines[i]!;
        const next = (ordered ? /^\d+\. (.*)$/ : /^- (.*)$/).exec(l);
        if (next) items.push(next[1]!);
        else if (/^ {2,}\S/.test(l) && !/^\s*(- |\d+\. |```)/.test(l)) items[items.length - 1] += ' ' + l.trim();
        else if (/^\s+(- |\d+\. |```)/.test(l)) throw new Error(`line ${i + 1}: lists and code cannot sit inside a list item`);
        else break;
      }
      if (i < lines.length && lines[i]!.trim() && !startsBlock(lines[i]!)) throw new Error(`line ${i + 1}: leave a blank line after a list, or indent the line to continue the item`);
      blocks.push({ k: 'list', ordered, items: items.map((t) => inline(t, n)) });
      continue;
    }
    if (/^\s/.test(line)) throw new Error(`line ${n}: indented text is not allowed here`);
    const para: string[] = [];
    for (; i < lines.length && lines[i]!.trim() && !startsBlock(lines[i]!); i++) para.push(lines[i]!.trim());
    blocks.push({ k: 'p', text: inline(para.join(' '), n) });
  }
  return { number, slug: meta.slug!, title: meta.title!, summary: meta.summary!, status: meta.status, files: meta.files!.split(',').map((f) => f.trim()).filter(Boolean), blocks };
}

/** The prose pieces of a guide (headings, paragraphs, list items, table cells), each as its list of inline parts. Code blocks are left out. */
function prose(g: Guide): Inline[][] {
  return g.blocks.flatMap((b) => (b.k === 'h' || b.k === 'p' ? [b.text] : b.k === 'list' ? b.items : b.k === 'table' ? [...b.head, ...b.rows.flat()] : []));
}
const said = (parts: Inline[]) => parts.filter((p) => p.t !== 'code').map((p) => p.s).join('');

const syllables = (word: string): number => {
  const w = word.toLowerCase().replace(/e$/, '');
  return Math.max(1, (w.match(/[aeiouy]+/g) ?? []).length);
};

/** Flesch-Kincaid grade of the prose. Inline code (file names, commands) and code blocks are not counted. */
export function readingGrade(g: Guide): number {
  let words = 0, sentences = 0, sounds = 0;
  for (const parts of prose(g)) {
    const text = said(parts);
    for (const s of text.split(/[.!?]+(?:\s|$)/)) {
      const w = s.match(/[A-Za-z][A-Za-z'’]*/g) ?? [];
      if (!w.length) continue;
      sentences++;
      words += w.length;
      for (const x of w) sounds += syllables(x);
    }
  }
  if (!words) return 0;
  return Math.round((0.39 * (words / sentences) + 11.8 * (sounds / words) - 15.59) * 10) / 10;
}

function linkAllowed(href: string): boolean {
  let u: URL;
  try { u = new URL(href); } catch { return false; }
  if (u.protocol !== 'https:' || u.username || u.port) return false;
  if (PLAIN_HOSTS.includes(u.hostname)) return true;
  return u.hostname === 'github.com' && (u.pathname === REPO_PATH || u.pathname.startsWith(REPO_PATH + '/'));
}

export function guideProblems(g: Guide, fileExists: (repoPath: string) => boolean): string[] {
  const out: string[] = [];
  for (const f of g.files) if (!fileExists(f)) out.push(`names a file that does not exist: ${f}`);

  const all = [...prose(g)];
  const written = all.flat().map((p) => p.s).join('\n') + '\n' + g.blocks.map((b) => (b.k === 'code' ? b.code : '')).join('\n');
  for (const p of all.flat()) {
    if (p.t !== 'link') continue;
    if (!linkAllowed(p.href)) { out.push(`link not allowed: ${p.href}`); continue; }
    if (p.href.startsWith(REPO_BLOB)) {
      const path = decodeURIComponent(p.href.slice(REPO_BLOB.length).split(/[#?]/)[0]!).replace(/\/$/, '');
      if (!fileExists(path)) out.push(`link to a file that does not exist: ${path}`);
      else if (!written.includes(path)) out.push(`link without its path written as text: ${path}`);
    }
  }

  const commands = [...g.blocks.flatMap((b) => (b.k === 'code' ? b.code.split('\n') : [])), ...all.flat().filter((p) => p.t === 'code').map((p) => p.s)];
  for (const c of commands) {
    if (c.includes('http.server') && !c.includes('--bind 127.0.0.1')) out.push(`server command open to the network (add --bind 127.0.0.1): ${c.trim()}`);
    if (/--host\b/.test(c)) out.push(`server command open to the network (remove --host): ${c.trim()}`);
  }

  for (const text of [g.title, g.summary, ...all.map(said)]) {
    const m = CLAIMS.exec(text);
    if (m) out.push(`claim word "${m[1]}" in: ${text.slice(0, 60)}`);
    if (/\btherapy\b/i.test(text.replace(/\bnot therapy\b/gi, ''))) out.push(`claim word "therapy" (write "not therapy") in: ${text.slice(0, 60)}`);
  }

  const grade = readingGrade(g);
  if (grade > MAX_GRADE) out.push(`reading grade ${grade} is above ${MAX_GRADE}`);
  return out;
}

/** The text of src/lib/smithyData.ts for these guides. Only approved guides are ever passed in. */
export function smithyDataSource(guides: Guide[]): string {
  const sorted = [...guides].sort((a, b) => a.number - b.number);
  return `// GENERATED by scripts/build-smithy.mts from docs/smithy/. Only guides the owner approved. Do not edit by hand: run \`npm run smithy\`.\nimport type { Guide } from './smithyGuide.ts';\n\nexport const SMITHY_GUIDES: Guide[] = ${JSON.stringify(sorted, null, 2)};\n`;
}
