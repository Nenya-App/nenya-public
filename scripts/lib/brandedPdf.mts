// Shared building blocks for the branded document PDFs made by scripts (the same look as the Terms PDF in src/lib/legalPdf.ts): cream pages, gold
// rules, Cinzel and Manrope, the logo, a cover, a header band and a footer. Fonts and the logo are read from public/pdf-assets; nothing is fetched.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { jsPDF } from 'jspdf';

export type RGB = [number, number, number];
export interface Page {
  doc: any; W: number; H: number; margin: number; contentW: number; bottom: number; y: number; title: string; logoAt: (h: number, cx: number, cy: number) => void;
}

export async function createBranded(repoRoot: string, outDir: string) {
  const root = resolve(repoRoot);
  mkdirSync(outDir, { recursive: true });
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (input: any) => {
    const u = String(input);
    if (u.startsWith('/pdf-assets/')) return new Response(readFileSync(join(root, 'public', u)));
    return realFetch(input);
  }) as typeof fetch;
  const { COLORS, loadFonts, loadLogo, registerFonts, drawTracked } = await import(join(root, 'src/lib/pdfCommon.ts'));
  const fonts = await loadFonts();
  const logo = await loadLogo();
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const paint = (d: Page) => { d.doc.setFillColor(...COLORS.cream); d.doc.rect(0, 0, d.W, d.H, 'F'); };
  function newPage(d: Page) {
    const { doc } = d;
    doc.addPage(); paint(d);
    d.logoAt(9, d.margin + 4.5, d.margin - 2);
    doc.setFont('Cinzel', 'bold'); doc.setFontSize(11); doc.setTextColor(...COLORS.warmBrown);
    drawTracked(doc, 'NENYA', d.margin + 13, d.margin, { tracking: 0.6 });
    doc.setFont('Manrope', 'normal'); doc.setFontSize(8); doc.setTextColor(...COLORS.textMuted);
    doc.text(d.title, d.W - d.margin, d.margin, { align: 'right' });
    doc.setDrawColor(...COLORS.gold); doc.setLineWidth(0.35); doc.line(d.margin, d.margin + 4, d.W - d.margin, d.margin + 4);
    d.y = d.margin + 14;
  }
  function start(title: string, subtitle: string, tagline: string, stamp: string): Page {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    registerFonts(doc, fonts);
    const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
    const props = doc.getImageProperties(logo);
    const aspect = props.width / props.height;
    const d: Page = { doc, W, H, margin: 22, contentW: W - 44, bottom: H - 26, y: 0, title, logoAt: (h, cx, cy) => doc.addImage(logo, 'PNG', cx - (h * aspect) / 2, cy - h / 2, h * aspect, h) };
    paint(d);
    doc.setDrawColor(...COLORS.gold); doc.setLineWidth(0.6); doc.rect(10, 10, W - 20, H - 20);
    doc.setFillColor(...COLORS.warmBrown); doc.circle(W / 2, 62, 26, 'F'); d.logoAt(34, W / 2, 62);
    doc.setFont('Cinzel', 'bold'); doc.setFontSize(30); doc.setTextColor(...COLORS.warmBrown);
    drawTracked(doc, 'NENYA', W / 2, 100, { align: 'center', tracking: 2.2 });
    doc.setFont('ManropeSemiBold', 'normal'); doc.setFontSize(10.5); doc.setTextColor(...COLORS.goldDark);
    drawTracked(doc, subtitle, W / 2, 109, { align: 'center', tracking: 1 });
    doc.setDrawColor(...COLORS.gold); doc.setLineWidth(0.3); doc.line(W / 2 - 20, 116, W / 2 + 20, 116);
    doc.setFont('Cormorant', 'italic'); doc.setFontSize(13.5); doc.setTextColor(...COLORS.ink);
    doc.text(doc.splitTextToSize(tagline, 120), W / 2, 132, { align: 'center' });
    doc.setFont('Manrope', 'normal'); doc.setFontSize(9.5); doc.setTextColor(...COLORS.textMuted);
    doc.text(doc.splitTextToSize(stamp, 130), W / 2, 156, { align: 'center' });
    doc.setFontSize(8.5); doc.text(`Prepared ${today}`, W / 2, H - 32, { align: 'center' });
    doc.setFont('ManropeSemiBold', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...COLORS.goldDark);
    drawTracked(doc, 'PRIVACY-FIRST · USER-SOVEREIGN · OPEN & TRANSPARENT', W / 2, H - 24, { align: 'center', tracking: 0.3 });
    newPage(d);
    return d;
  }
  const room = (d: Page, n: number) => { if (d.y + n > d.bottom) newPage(d); };
  function wrap(d: Page, text: string, o: { x?: number; w?: number; size: number; lh: number; font: string; style?: 'normal' | 'italic' | 'bold'; color: RGB }) {
    const x = o.x ?? d.margin + 4, w = o.w ?? d.contentW - 8;
    const setFont = () => { d.doc.setFont(o.font, o.style ?? 'normal'); d.doc.setFontSize(o.size); d.doc.setTextColor(...o.color); };
    setFont();
    (d.doc.splitTextToSize(text, w) as string[]).forEach((line) => { room(d, o.lh); setFont(); d.doc.text(line, x, d.y); d.y += o.lh; });
  }
  function band(d: Page, title: string) {
    room(d, 28);
    d.doc.setGState(d.doc.GState({ opacity: 0.24 })); d.doc.setFillColor(...COLORS.gold); d.doc.roundedRect(d.margin, d.y - 5, d.contentW, 11, 2, 2, 'F'); d.doc.setGState(d.doc.GState({ opacity: 1 }));
    d.doc.setFont('CinzelSemiBold', 'normal'); let size = 11.5; d.doc.setFontSize(size);
    while (d.doc.getTextWidth(title) > d.contentW - 10 && size > 7.5) { size -= 0.5; d.doc.setFontSize(size); }
    d.doc.setTextColor(...COLORS.warmBrown); d.doc.text(title, d.margin + 4, d.y + 2.5); d.y += 15;
  }
  function card(d: Page, text: string, o: { tint: RGB; opacity: number; size: number; font: string; style?: 'normal' | 'italic'; color: RGB; lh: number }) {
    d.doc.setFont(o.font, o.style ?? 'normal'); d.doc.setFontSize(o.size);
    const lines = d.doc.splitTextToSize(text, d.contentW - 16) as string[];
    const h = lines.length * o.lh + 7;
    if (d.y + h > d.bottom) newPage(d);
    d.doc.setGState(d.doc.GState({ opacity: o.opacity })); d.doc.setFillColor(...o.tint); d.doc.roundedRect(d.margin + 4, d.y - 3.5, d.contentW - 8, h, 2, 2, 'F'); d.doc.setGState(d.doc.GState({ opacity: 1 }));
    d.doc.setFont(o.font, o.style ?? 'normal'); d.doc.setFontSize(o.size); d.doc.setTextColor(...o.color);
    let yy = d.y + 1.5;
    lines.forEach((l) => { d.doc.text(l, d.margin + 8, yy); yy += o.lh; });
    d.y += h + 2;
  }
  function finish(d: Page, file: string, footer: string) {
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
  return { COLORS, drawTracked, start, newPage, room, wrap, band, card, finish };
}

/** Plain text from the little Markdown these drafts use: bold, italic and code markers removed; links keep their words. */
export const plain = (s: string): string => s.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/`([^`]+)`/g, '$1').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\*\*\*/g, '');
