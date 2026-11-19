// Layout helpers for the PDF report, kept apart so they can be tested without the PDF library.

/** Where the swatches go and how tall the block is, so a caller can break the page first. Long captions (a person's own name for a color) are set beside their swatch, one swatch to a row, and wrapped in full; short ones sit under it. */
export function swatchBlock(doc: any, swatches: { caption?: string }[], contentWidth = 140): { rows: boolean; height: number; wrapped: string[][] } {
  const size = 13;
  const long = swatches.length <= 3 && swatches.some((s) => (s.caption ?? '').length > 14);
  if (long) {
    doc.setFont('Manrope', 'normal');
    doc.setFontSize(8);
    const wrapped = swatches.map((s) => (s.caption ? (doc.splitTextToSize(s.caption, contentWidth - size - 8) as string[]) : []));
    return { rows: true, wrapped, height: wrapped.reduce((h, w) => h + Math.max(size, w.length * 3.8 + 2) + 4, 0) + 2 };
  }
  doc.setFont('Manrope', 'normal');
  doc.setFontSize(6.5);
  const wrapped = swatches.map((s) => (s.caption ? (doc.splitTextToSize(s.caption, size + 8 - 1) as string[]) : []));
  return { rows: false, wrapped, height: size + 13 + Math.max(0, ...wrapped.map((w) => (w.length - 1) * 3)) };
}

