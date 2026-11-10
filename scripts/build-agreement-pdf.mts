// Builds the branded PDFs of the draft contributor agreement (docs/drafts/contributor-agreement-draft.md): the full draft, and the "in plain words"
// summary as its own one-page snippet.      node scripts/build-agreement-pdf.mts [outDir]    (default: ~/Downloads/Nenya-Contributor-Agreement)
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { createBranded, plain } from './lib/brandedPdf.mts';

const root = resolve(import.meta.dirname, '..');
const outDir = process.argv[2] ?? join(homedir(), 'Downloads', 'Nenya-Contributor-Agreement');
const B = await createBranded(root, outDir);
const { COLORS } = B;
const md = readFileSync(join(root, 'docs/drafts/contributor-agreement-draft.md'), 'utf8').split('\n');

// split into sections by "## "
const sections: { heading: string; lines: string[] }[] = [{ heading: '', lines: [] }];
for (const line of md.slice(1)) {
  if (line.startsWith('## ')) sections.push({ heading: line.slice(3).trim(), lines: [] });
  else sections[sections.length - 1].lines.push(line);
}

function renderBlock(d: any, lines: string[]) {
  let para: string[] = [];
  const flush = () => { if (para.length) { B.wrap(d, plain(para.join(' ')), { size: 9.5, lh: 5.2, font: 'Manrope', color: COLORS.textMuted }); d.y += 2.5; para = []; } };
  let quote: string[] = [];
  const flushQuote = () => { if (quote.length) { B.card(d, plain(quote.join('\n').replace(/\n\n+/g, '\n\n')), { tint: COLORS.gold, opacity: 0.2, size: 9.3, font: 'Manrope', color: COLORS.warmBrown, lh: 5 }); d.y += 1; quote = []; } };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith('>')) { flush(); const t = line.replace(/^>\s?/, ''); if (t.trim() === '') { if (quote.length && quote[quote.length - 1] !== '') quote.push(''); } else quote.push(t); continue; }
    flushQuote();
    if (line.trim() === '') { flush(); continue; }
    const bullet = line.match(/^(?:-|\d+\.)\s+(.*)$/);
    if (bullet) {
      flush();
      const marker = /^\d/.test(line) ? line.match(/^(\d+\.)/)![1] : '•';
      B.room(d, 6);
      d.doc.setFont('Manrope', 'normal'); d.doc.setFontSize(9.5); d.doc.setTextColor(...COLORS.goldDark); d.doc.text(marker, d.margin + 6, d.y);
      B.wrap(d, plain(bullet[1]), { x: d.margin + 12, w: d.contentW - 16, size: 9.5, lh: 5.2, font: 'Manrope', color: COLORS.textMuted });
      d.y += 1.5;
      continue;
    }
    para.push(line.trim());
  }
  flush(); flushQuote();
}

// ── the full draft
{
  const d = B.start('Contributor agreement · draft', 'CONTRIBUTOR AGREEMENT · DRAFT', 'Open, shareable, and in keeping with what Nenya stands for.', 'DRAFT · not in force · not legal advice · one clause is still open');
  sections.forEach((s, idx) => {
    if (idx === 0) {
      const status = s.lines.filter((l) => l.startsWith('Status:') || l.startsWith('**One clause')).map((l) => plain(l));
      status.forEach((t, i) => { B.card(d, t, { tint: i === 0 ? COLORS.gold : [221, 160, 120], opacity: i === 0 ? 0.2 : 0.2, size: 9, font: 'Manrope', color: COLORS.warmBrown, lh: 4.9 }); d.y += 2; });
      return;
    }
    B.band(d, plain(s.heading));
    renderBlock(d, s.lines);
    d.y += 3;
  });
  B.finish(d, 'Nenya-Contributor-Agreement-DRAFT.pdf', 'nenya.biz · contributor agreement · draft, not in force');
}

// ── the plain-words snippet: one page
{
  const plainSec = sections.find((s) => s.heading.startsWith('In plain words'))!;
  const d = B.start('In plain words · draft', 'CONTRIBUTING TO NENYA', 'What it means to give your work to an open project.', 'DRAFT · not in force · not legal advice');
  B.band(d, 'In plain words');
  renderBlock(d, plainSec.lines);
  d.y += 4;
  B.card(d, 'This is a draft summary of a draft agreement. Nothing here applies to anyone yet, and it has not had a legal review. If you would like to contribute, a translation or anything else, write to info@nenya.biz and tell us what you have in mind: no contributor agreement is in force today, and we will not promise terms that are not yet in place.', { tint: COLORS.gold, opacity: 0.2, size: 9, font: 'Cormorant', style: 'italic', color: COLORS.warmBrown, lh: 4.9 });
  B.finish(d, 'Nenya-Contributing-In-Plain-Words-DRAFT.pdf', 'nenya.biz · contributing · draft');
}
