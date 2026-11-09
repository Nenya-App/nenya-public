// Builds the branded PDFs (and an editable Markdown copy) from the draft pre-written answers in docs/drafts/answers/answers.mts.
// Same look as the Terms PDF (src/lib/legalPdf.ts): cream pages, gold rules, Cinzel and Manrope, the logo, a cover, a header band, a footer.
//
//   node scripts/build-answers-pdf.mts [outDir]        (default: ~/Downloads/Nenya-Answers)
//
// It writes: 1 About Nenya (draft, with notes for the owner), 2 The coach (draft, with notes), Quick Cards (clean: only the short answers),
// Review Notes (internal: what needs a decision, where the pages disagree, the tutorial map), and Nenya-Answers.md (everything, to edit).
// Fonts and the logo are read from public/pdf-assets; nothing is fetched from the network.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { jsPDF } from 'jspdf';
import { ANSWERS, DISCREPANCIES, PART_TITLES, TUTORIAL_MAP, type Answer, type Part } from '../docs/drafts/answers/answers.mts';

const root = resolve(import.meta.dirname, '..');
// pdfCommon fetches its fonts and logo from the site's own paths; serve them from disk instead.
const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: any) => {
  const u = String(input);
  if (u.startsWith('/pdf-assets/')) return new Response(readFileSync(join(root, 'public', u)));
  return realFetch(input);
}) as typeof fetch;
const { COLORS, loadFonts, loadLogo, registerFonts, drawTracked } = await import('../src/lib/pdfCommon.ts');

const outDir = process.argv[2] ?? join(homedir(), 'Downloads', 'Nenya-Answers');
mkdirSync(outDir, { recursive: true });
const fonts = await loadFonts();
const logo = await loadLogo();

// About section ids to their titles, from the menu itself.
const menu = readFileSync(join(root, 'src/app/components/about/AboutMenu.tsx'), 'utf8');
const pageTitle = new Map<string, string>([...menu.matchAll(/id: '([a-z-]+)',\s*title: '((?:[^'\\]|\\.)*)'/g)].map((m) => [m[1], m[2].replace(/\\'/g, '’')]));
const STATUS: Record<Answer['status'], { label: string; tint: [number, number, number] }> = {
  ready: { label: 'CHECKED AGAINST ITS SOURCES · WORDING IS YOURS', tint: [150, 170, 140] },
  owner: { label: 'NEEDS YOUR DECISION', tint: [221, 184, 140] },
  pending: { label: 'HOLD · DESCRIBES SOMETHING NOT LIVE YET', tint: [190, 140, 130] },
};

interface Doc {
  doc: any; W: number; H: number; margin: number; contentW: number; bottom: number; y: number;
}
const MONTH = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

function start(title: string, subtitle: string, tagline: string, stamp: string): Doc {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  registerFonts(doc, fonts);
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
  const d: Doc = { doc, W, H, margin: 22, contentW: W - 44, bottom: H - 26, y: 0 };
  const logoProps = doc.getImageProperties(logo);
  const aspect = logoProps.width / logoProps.height;
  (d as any).logoAt = (h: number, cx: number, cy: number) => doc.addImage(logo, 'PNG', cx - (h * aspect) / 2, cy - h / 2, h * aspect, h);
  (d as any).title = title; (d as any).stamp = stamp;
  // cover
  paint(d);
  doc.setDrawColor(...COLORS.gold); doc.setLineWidth(0.6); doc.rect(10, 10, W - 20, H - 20);
  doc.setFillColor(...COLORS.warmBrown); doc.circle(W / 2, 62, 26, 'F');
  (d as any).logoAt(34, W / 2, 62);
  doc.setFont('Cinzel', 'bold'); doc.setFontSize(30); doc.setTextColor(...COLORS.warmBrown);
  drawTracked(doc, 'NENYA', W / 2, 100, { align: 'center', tracking: 2.2 });
  doc.setFont('ManropeSemiBold', 'normal'); doc.setFontSize(10.5); doc.setTextColor(...COLORS.goldDark);
  drawTracked(doc, subtitle, W / 2, 109, { align: 'center', tracking: 1 });
  doc.setDrawColor(...COLORS.gold); doc.setLineWidth(0.3); doc.line(W / 2 - 20, 116, W / 2 + 20, 116);
  doc.setFont('Cormorant', 'italic'); doc.setFontSize(13.5); doc.setTextColor(...COLORS.ink);
  doc.text(doc.splitTextToSize(tagline, 120), W / 2, 132, { align: 'center' });
  doc.setFont('Manrope', 'normal'); doc.setFontSize(9.5); doc.setTextColor(...COLORS.textMuted);
  doc.text(stamp, W / 2, 156, { align: 'center' });
  doc.setFontSize(8.5); doc.text(`Prepared ${MONTH}`, W / 2, H - 32, { align: 'center' });
  doc.setFont('ManropeSemiBold', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...COLORS.goldDark);
  drawTracked(doc, 'PRIVACY-FIRST · USER-SOVEREIGN · OPEN & TRANSPARENT', W / 2, H - 24, { align: 'center', tracking: 0.3 });
  newPage(d);
  return d;
}
function paint(d: Doc) { d.doc.setFillColor(...COLORS.cream); d.doc.rect(0, 0, d.W, d.H, 'F'); }
function newPage(d: Doc) {
  const { doc } = d;
  doc.addPage(); paint(d);
  (d as any).logoAt(9, d.margin + 4.5, d.margin - 2);
  doc.setFont('Cinzel', 'bold'); doc.setFontSize(11); doc.setTextColor(...COLORS.warmBrown);
  drawTracked(doc, 'NENYA', d.margin + 13, d.margin, { tracking: 0.6 });
  doc.setFont('Manrope', 'normal'); doc.setFontSize(8); doc.setTextColor(...COLORS.textMuted);
  doc.text((d as any).title, d.W - d.margin, d.margin, { align: 'right' });
  doc.setDrawColor(...COLORS.gold); doc.setLineWidth(0.35); doc.line(d.margin, d.margin + 4, d.W - d.margin, d.margin + 4);
  d.y = d.margin + 14;
}
const room = (d: Doc, n: number) => { if (d.y + n > d.bottom) newPage(d); };
type RGB = [number, number, number];
function wrap(d: Doc, text: string, o: { x: number; w: number; size: number; lh: number; font: string; style?: 'normal' | 'italic' | 'bold'; color: RGB }) {
  d.doc.setFont(o.font, o.style ?? 'normal'); d.doc.setFontSize(o.size); d.doc.setTextColor(...o.color);
  (d.doc.splitTextToSize(text, o.w) as string[]).forEach((line) => { room(d, o.lh); d.doc.text(line, o.x, d.y); d.y += o.lh; });
}
function label(d: Doc, text: string, color: RGB = COLORS.goldDark) {
  room(d, 7); d.doc.setFont('ManropeSemiBold', 'normal'); d.doc.setFontSize(7.2); d.doc.setTextColor(...color);
  drawTracked(d.doc, text, d.margin + 4, d.y, { tracking: 0.5 }); d.y += 5;
}
function partHeader(d: Doc, title: string, blurb: string) {
  room(d, 36);
  d.doc.setGState(d.doc.GState({ opacity: 0.24 })); d.doc.setFillColor(...COLORS.gold); d.doc.roundedRect(d.margin, d.y - 5, d.contentW, 11, 2, 2, 'F'); d.doc.setGState(d.doc.GState({ opacity: 1 }));
  d.doc.setFont('CinzelSemiBold', 'normal'); d.doc.setFontSize(11.5); d.doc.setTextColor(...COLORS.warmBrown); d.doc.text(title, d.margin + 4, d.y + 2.5); d.y += 15;
  wrap(d, blurb, { x: d.margin + 4, w: d.contentW - 8, size: 9.5, lh: 5.2, font: 'Manrope', color: COLORS.textMuted }); d.y += 5;
}
/** A tinted card around a block of text: drawn after measuring, so the card fits the words. */
function card(d: Doc, text: string, o: { tint: RGB; opacity: number; size: number; font: string; style?: 'normal' | 'italic'; color: RGB; lh: number }) {
  d.doc.setFont(o.font, o.style ?? 'normal'); d.doc.setFontSize(o.size);
  const lines = d.doc.splitTextToSize(text, d.contentW - 16) as string[];
  const h = lines.length * o.lh + 7;
  room(d, Math.min(h, 60));
  if (d.y + h > d.bottom) newPage(d);
  d.doc.setGState(d.doc.GState({ opacity: o.opacity })); d.doc.setFillColor(...o.tint); d.doc.roundedRect(d.margin + 4, d.y - 3.5, d.contentW - 8, h, 2, 2, 'F'); d.doc.setGState(d.doc.GState({ opacity: 1 }));
  d.doc.setFont(o.font, o.style ?? 'normal'); d.doc.setFontSize(o.size); d.doc.setTextColor(...o.color);
  let yy = d.y + 1.5;
  lines.forEach((l) => { d.doc.text(l, d.margin + 8, yy); yy += o.lh; });
  d.y += h + 2;
}
function finish(d: Doc, file: string, footer: string) {
  const { doc } = d, n = doc.getNumberOfPages();
  for (let i = 2; i <= n; i++) {
    doc.setPage(i);
    doc.setDrawColor(...COLORS.gold); doc.setLineWidth(0.3); doc.line(d.margin, d.H - 16, d.W - d.margin, d.H - 16);
    doc.setFont('Manrope', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...COLORS.textMuted);
    doc.text(footer, d.margin, d.H - 11); doc.text(`${i - 1} / ${n - 1}`, d.W - d.margin, d.H - 11, { align: 'right' });
  }
  writeFileSync(join(outDir, file), Buffer.from(doc.output('arraybuffer')));
  console.log('wrote', file, `(${n} pages)`);
}
const ABOUT_NAMES: Record<string, string> = { Structure: 'Our Structure', PrivacyPromise: 'Our Privacy Promise', NamePhilosophy: 'Our Name & Philosophy', NVCMethod: 'Our NVC+ Method', ContactUs: 'Contact Us', AboutTheFounder: 'About the Designer', SupportUs: 'Support Us', VeniceChat: 'Chat with Nenya’s AI on Venice', AboutMenu: 'the About menu' };
/** A plain name for a source file, for a reader who does not read code. */
function sourceName(file: string): string {
  const m = file.match(/about\/([A-Za-z]+)\.tsx$/);
  if (m) return `About page: ${ABOUT_NAMES[m[1]] ?? m[1]}`;
  const known: Record<string, string> = {
    'src/lib/legalDocument.ts': 'Terms of Use & Privacy Policy',
    'netlify/functions/coach.mts': 'the coach’s instructions (code)',
    'src/lib/hostility.ts': 'the hostile-turn note (code)',
    'src/lib/personaChecks.ts': 'the persona checks (code)',
    'src/coach/FlagNotice.tsx': 'the safety notice (code)',
    'docs/versioning.md': 'versioning notes',
    'docs/translation-scope.md': 'the translation scope',
    'docs/coach-ai-directed-abuse-scope.md': 'the abuse-aimed-at-the-coach scope',
    'docs/brand/alt-text.md': 'the alt-text file',
    'docs/accessibility-audit-checklist.md': 'the accessibility audit checklist',
    'index.html': 'the site (code)',
  };
  return known[file] ?? file;
}
const readMore = (a: Answer) => a.links.map((l) => `${l.page ? pageTitle.get(l.page) ?? l.page : l.label}${l.href ? ` (${l.href.replace('https://', '')})` : ''}`).join('  ·  ');

// ───────────────── 1 and 2: the full answers (drafts, with the owner's notes)
function fullAnswers(part: Part, file: string, number: number) {
  const list = ANSWERS.filter((a) => a.part === part);
  const d = start(`${PART_TITLES[part].title} · draft`, `ANSWERS · PART ${number}`, part === 'nenya' ? 'Written once, so the coach, the pages and the tutorials all say the same true thing.' : 'What the coach says about itself, in its own voice: plain, honest, and steady.', `DRAFT for review · ${list.length} answers`);
  partHeader(d, PART_TITLES[part].title, PART_TITLES[part].blurb);
  wrap(d, 'How to read this. Each answer has a short version (the card that would sit under a reply, so the coach never improvises these) and a full version (for a page or a tutorial). Under each is where to read more, where it would slot into the tutorials, and what it was checked against. A band shows whether it needs a decision from you.', { x: d.margin + 4, w: d.contentW - 8, size: 9, lh: 5, font: 'Cormorant', style: 'italic', color: COLORS.ink });
  d.y += 6;
  list.forEach((a, i) => {
    room(d, 44);
    d.doc.setFont('ManropeSemiBold', 'normal'); d.doc.setFontSize(10.5); d.doc.setTextColor(...COLORS.ink); d.doc.text(`${i + 1}. ${a.title}`, d.margin + 4, d.y); d.y += 5.5;
    d.doc.setFont('Manrope', 'normal'); d.doc.setFontSize(7.2); d.doc.setTextColor(...STATUS[a.status].tint.map((c) => Math.round(c * 0.7)) as RGB);
    drawTracked(d.doc, STATUS[a.status].label, d.margin + 4, d.y, { tracking: 0.4 }); d.y += 6;
    label(d, 'THE SHORT ANSWER');
    card(d, a.short, { tint: COLORS.gold, opacity: 0.2, size: 9.5, font: 'Manrope', color: COLORS.warmBrown, lh: 5.1 });
    d.y += 2; label(d, 'IN FULL');
    a.full.forEach((p) => { wrap(d, p, { x: d.margin + 4, w: d.contentW - 8, size: 9.5, lh: 5.2, font: 'Manrope', color: COLORS.textMuted }); d.y += 2.4; });
    label(d, 'READ MORE');
    wrap(d, readMore(a), { x: d.margin + 4, w: d.contentW - 8, size: 8.8, lh: 4.8, font: 'Manrope', color: COLORS.ink }); d.y += 1.5;
    label(d, 'WHERE THIS SLOTS IN');
    wrap(d, a.tutorial, { x: d.margin + 4, w: d.contentW - 8, size: 9, lh: 4.9, font: 'Cormorant', style: 'italic', color: COLORS.ink }); d.y += 1.5;
    label(d, 'ASKED, FOR EXAMPLE');
    wrap(d, a.asked.map((q) => `“${q}”`).join('   '), { x: d.margin + 4, w: d.contentW - 8, size: 8.4, lh: 4.6, font: 'Manrope', color: COLORS.textMuted }); d.y += 1.5;
    label(d, 'CHECKED AGAINST');
    wrap(d, [...new Set(a.checks.map((c) => sourceName(c.file)))].join('  ·  '), { x: d.margin + 4, w: d.contentW - 8, size: 8.4, lh: 4.6, font: 'Manrope', color: COLORS.textMuted }); d.y += 2;
    if (a.ownerNote) {
      label(d, 'FOR YOU', [150, 90, 60]);
      card(d, a.ownerNote, { tint: [221, 160, 120], opacity: 0.16, size: 8.6, font: 'Manrope', color: COLORS.warmBrown, lh: 4.7 });
    }
    d.y += 6;
    d.doc.setDrawColor(...COLORS.gold); d.doc.setLineWidth(0.2); room(d, 4); d.doc.line(d.margin + 20, d.y - 3, d.W - d.margin - 20, d.y - 3); d.y += 4;
  });
  finish(d, file, 'nenya.biz · draft answers');
}
fullAnswers('nenya', 'Nenya-Answers-1-About-Nenya.pdf', 1);
fullAnswers('coach', 'Nenya-Answers-2-The-Coach.pdf', 2);

// ───────────────── Quick cards: only the short answers, clean (no notes), for scanning and for the cards beneath replies
{
  const d = start('Quick answers', 'QUICK CARDS', 'The short answers, in the words the cards beneath a reply would use.', `${ANSWERS.length} cards · draft wording`);
  (['nenya', 'coach'] as Part[]).forEach((part) => {
    partHeader(d, PART_TITLES[part].title, PART_TITLES[part].blurb);
    ANSWERS.filter((a) => a.part === part).forEach((a) => {
      room(d, 34);
      d.doc.setFont('ManropeSemiBold', 'normal'); d.doc.setFontSize(10); d.doc.setTextColor(...COLORS.ink); d.doc.text(a.title, d.margin + 4, d.y); d.y += 5;
      card(d, a.short, { tint: COLORS.gold, opacity: 0.2, size: 9.5, font: 'Manrope', color: COLORS.warmBrown, lh: 5.1 });
      wrap(d, `Read more: ${readMore(a)}`, { x: d.margin + 4, w: d.contentW - 8, size: 8.2, lh: 4.4, font: 'Manrope', color: COLORS.textMuted }); d.y += 4;
    });
    d.y += 4;
  });
  finish(d, 'Nenya-Answers-Quick-Cards.pdf', 'nenya.biz · quick answers · draft');
}

// ───────────────── Review notes: internal, for the owner
{
  const d = start('Review notes · internal', 'REVIEW NOTES', 'What needs your decision, where the pages disagree, and how the answers become tutorials.', 'Internal · not for publication');
  partHeader(d, 'What needs you, in order', 'Answers marked "needs your decision" or "hold". Each says what only you can settle.');
  const needs = ANSWERS.filter((a) => a.status !== 'ready');
  needs.forEach((a) => {
    room(d, 24);
    d.doc.setFont('ManropeSemiBold', 'normal'); d.doc.setFontSize(10); d.doc.setTextColor(...COLORS.ink); d.doc.text(`${a.title}  (${a.status === 'pending' ? 'hold' : 'decision'})`, d.margin + 4, d.y); d.y += 5;
    card(d, a.ownerNote ?? '', { tint: [221, 160, 120], opacity: 0.16, size: 8.8, font: 'Manrope', color: COLORS.warmBrown, lh: 4.8 });
    d.y += 3;
  });
  partHeader(d, 'Where the pages disagree', 'Found while checking each answer against the About pages and the Terms. None is changed yet; the answers follow the Terms.');
  DISCREPANCIES.forEach((x, i) => {
    room(d, 36);
    d.doc.setFont('ManropeSemiBold', 'normal'); d.doc.setFontSize(10); d.doc.setTextColor(...COLORS.ink); d.doc.text(`${i + 1}. ${x.where}`, d.margin + 4, d.y); d.y += 5.5;
    wrap(d, `It says: ${x.says}`, { x: d.margin + 4, w: d.contentW - 8, size: 9, lh: 4.9, font: 'Manrope', color: COLORS.textMuted });
    wrap(d, `But: ${x.but}`, { x: d.margin + 4, w: d.contentW - 8, size: 9, lh: 4.9, font: 'Manrope', color: COLORS.textMuted });
    wrap(d, `Suggested: ${x.suggest}`, { x: d.margin + 4, w: d.contentW - 8, size: 9, lh: 4.9, font: 'Manrope', color: COLORS.ink });
    d.y += 4;
  });
  partHeader(d, 'How these become tutorials', 'The answers are written once. A lesson draws on answers by id and adds nothing new, so the facts cannot drift between the coach, the pages, and the tutorials. The existing PII Scrubbing Tutorial is the format to follow.');
  TUTORIAL_MAP.forEach((t) => {
    room(d, 18);
    d.doc.setFont('ManropeSemiBold', 'normal'); d.doc.setFontSize(10); d.doc.setTextColor(...COLORS.ink); d.doc.text(`${t.lesson}: ${t.title}`, d.margin + 4, d.y); d.y += 5;
    wrap(d, t.uses.map((u) => ANSWERS.find((a) => a.id === u)?.title ?? u).join('  ·  '), { x: d.margin + 4, w: d.contentW - 8, size: 8.8, lh: 4.7, font: 'Manrope', color: COLORS.textMuted }); d.y += 3.5;
  });
  finish(d, 'Nenya-Answers-Review-Notes.pdf', 'nenya.biz · review notes · internal');
}

// ───────────────── the editable copy
{
  const L: string[] = ['# Nenya: pre-written answers (draft, ' + MONTH + ')', '', 'Source of truth: `docs/drafts/answers/answers.mts`. This file is generated; edit the words there (or tell me what to change). Status: ready = checked against its sources; decision = needs you; hold = describes something not live.', ''];
  (['nenya', 'coach'] as Part[]).forEach((part) => {
    L.push(`## ${PART_TITLES[part].title}`, '', PART_TITLES[part].blurb, '');
    ANSWERS.filter((a) => a.part === part).forEach((a) => {
      L.push(`### ${a.title}  \`${a.id}\`  (${a.status === 'ready' ? 'ready' : a.status === 'owner' ? 'decision' : 'hold'})`, '', `**Short:** ${a.short}`, '', ...a.full.flatMap((p) => [p, '']), `*Read more:* ${readMore(a)}`, '', `*Slots into:* ${a.tutorial}`, '', `*Asked, for example:* ${a.asked.map((q) => `“${q}”`).join(', ')}`, '');
      if (a.ownerNote) L.push(`> **For you:** ${a.ownerNote}`, '');
    });
  });
  L.push('## Where the pages disagree', '', ...DISCREPANCIES.flatMap((x, i) => [`${i + 1}. **${x.where}** says ${x.says}. But ${x.but} *Suggested:* ${x.suggest}`, '']));
  L.push('## Tutorial map', '', ...TUTORIAL_MAP.map((t) => `- **${t.lesson}** (${t.title}): ${t.uses.join(', ')}`), '');
  writeFileSync(join(outDir, 'Nenya-Answers.md'), L.join('\n'));
  console.log('wrote Nenya-Answers.md');
}
