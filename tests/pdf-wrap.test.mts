// The PDF report wraps what it writes (owner's comment sheet, 2026-11-18): a long line (the path of movement) no longer runs off the page, and the captions under the Sight swatches are set in full.
import { readFileSync } from 'node:fs';
import { swatchBlock } from '../src/lib/pdfLayout.ts';
import { ok } from './helpers.mts';

// A stand-in for jsPDF's text measuring: 1.9 mm a character, wrapped on spaces to the width given.
const doc: any = {
  setFont() {}, setFontSize() {},
  splitTextToSize(text: string, width: number): string[] {
    const per = Math.max(1, Math.floor(width / 1.9)), out: string[] = []; let line = '';
    for (const w of text.split(' ')) { if ((line + ' ' + w).trim().length > per && line) { out.push(line); line = w; } else line = (line + ' ' + w).trim(); }
    if (line) out.push(line); return out;
  },
};
const long = 'Intensity slider should increase or decrease the brightness of the glow.';
const b = swatchBlock(doc, [{ caption: long }, { caption: 'Blue' }]);
ok('a long caption puts the swatches in rows, with the caption beside the swatch and wrapped in full (every word kept)', b.rows && b.wrapped[0].join(' ') === long && b.wrapped[0].length >= 2);
ok('no line of a caption is wider than the room beside its swatch', b.wrapped[0].every((l) => l.length * 1.9 <= 140 - 13 - 8 + 1));
const short = swatchBlock(doc, [{ caption: 'Blue' }, { caption: 'Gold' }]);
ok('short captions stay under their swatch', !short.rows && short.height >= 26);
const five = swatchBlock(doc, Array.from({ length: 5 }, (_, i) => ({ caption: `Colour name number ${i} that is long` })));
ok('a palette of five keeps its columns and shows every line of every name', !five.rows && five.wrapped.every((w, i) => w.join(' ') === `Colour name number ${i} that is long`));
ok('the block height grows with the wrapped lines, so the page can break before it', swatchBlock(doc, [{ caption: long.repeat(3) }]).height > swatchBlock(doc, [{ caption: long }]).height);
const src = readFileSync('src/lib/nenyaPdfReport.ts', 'utf8');
ok('every top-level report line is wrapped to the page, in both places they are written', (src.match(/const wrappedTop: string\[\] = doc\.splitTextToSize\(line, contentWidth - 8\);/g) ?? []).length === 2 && !/doc\.text\(line, margin \+ 4, y\);/.test(src));
ok('the swatch captions are no longer cut to three lines', !/\.slice\(0, 3\)/.test(src.slice(src.indexOf('function drawColorSwatches'), src.indexOf('function drawColorSwatches') + 3000)));
