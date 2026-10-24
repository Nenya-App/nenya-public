// Downloadable PDF of the Terms of Use & Privacy Policy, styled to match
// the Sensory Reflection Report (same palette, fonts, cover, header band,
// and footer). Content comes from legalDocument.ts so it always matches
// what's shown on screen.
import { COLORS, loadFonts, loadLogo, registerFonts, drawTracked } from './pdfCommon';
import {
  LEGAL_TITLE,
  LEGAL_EFFECTIVE_DATE,
  LEGAL_INTRO,
  LEGAL_CLOSING,
  LEGAL_PARTS,
} from './legalDocument';

export async function downloadLegalPdf() {
  const { jsPDF } = await import('jspdf');
  const [fonts, logoDataUrl] = await Promise.all([loadFonts(), loadLogo()]);

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  registerFonts(doc, fonts);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 22;
  const contentWidth = pageWidth - margin * 2;
  const centerX = pageWidth / 2;
  const bottomLimit = pageHeight - 26;

  const logoProps = doc.getImageProperties(logoDataUrl);
  const logoAspect = logoProps.width / logoProps.height;
  const logoAt = (targetHeight: number, cx: number, cy: number) => {
    const h = targetHeight;
    const w = h * logoAspect;
    doc.addImage(logoDataUrl, 'PNG', cx - w / 2, cy - h / 2, w, h);
  };

  const paintBackground = () => {
    doc.setFillColor(...COLORS.cream);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  };

  const drawHeaderBand = (y: number) => {
    logoAt(9, margin + 4.5, y - 2);
    doc.setFont('Cinzel', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.warmBrown);
    drawTracked(doc, 'NENYA', margin + 13, y, { tracking: 0.6 });
    doc.setFont('Manrope', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(LEGAL_TITLE, pageWidth - margin, y, { align: 'right' });
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.35);
    doc.line(margin, y + 4, pageWidth - margin, y + 4);
  };

  const newContentPage = () => {
    doc.addPage();
    paintBackground();
    drawHeaderBand(margin);
    return margin + 14;
  };

  // ---------------------------------------------------------------
  // Cover page
  // ---------------------------------------------------------------
  paintBackground();
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.6);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  doc.setFillColor(...COLORS.warmBrown);
  doc.circle(centerX, 62, 26, 'F');
  logoAt(34, centerX, 62);

  doc.setFont('Cinzel', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(...COLORS.warmBrown);
  drawTracked(doc, 'NENYA', centerX, 100, { align: 'center', tracking: 2.2 });

  doc.setFont('ManropeSemiBold', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(...COLORS.goldDark);
  drawTracked(doc, 'TERMS OF USE & PRIVACY POLICY', centerX, 109, { align: 'center', tracking: 1 });

  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.3);
  doc.line(centerX - 20, 116, centerX + 20, 116);

  doc.setFont('Cormorant', 'italic');
  doc.setFontSize(13.5);
  doc.setTextColor(...COLORS.ink);
  doc.text('A mirror for your own thoughts, not a source of answers.', centerX, 132, { align: 'center' });

  doc.setFont('Manrope', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.textMuted);
  doc.text(`Effective ${LEGAL_EFFECTIVE_DATE}`, centerX, 148, { align: 'center' });

  doc.setFontSize(8.5);
  doc.text(`Downloaded ${new Date().toLocaleDateString()}`, centerX, pageHeight - 32, { align: 'center' });

  doc.setFont('ManropeSemiBold', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.goldDark);
  drawTracked(doc, 'PRIVACY-FIRST · USER-SOVEREIGN · OPEN & TRANSPARENT', centerX, pageHeight - 24, {
    align: 'center',
    tracking: 0.3,
  });

  // ---------------------------------------------------------------
  // Body
  // ---------------------------------------------------------------
  let y = newContentPage();

  const ensureSpace = (needed: number) => {
    if (y + needed > bottomLimit) y = newContentPage();
  };

  const writeWrapped = (
    text: string,
    opts: { x: number; width: number; size: number; lineHeight: number; font: string; style?: 'normal' | 'italic'; color: [number, number, number] }
  ) => {
    doc.setFont(opts.font, opts.style ?? 'normal');
    doc.setFontSize(opts.size);
    doc.setTextColor(...opts.color);
    const lines: string[] = doc.splitTextToSize(text, opts.width);
    lines.forEach((line) => {
      ensureSpace(opts.lineHeight);
      doc.text(line, opts.x, y);
      y += opts.lineHeight;
    });
  };

  writeWrapped(LEGAL_INTRO, {
    x: margin,
    width: contentWidth,
    size: 10,
    lineHeight: 5.4,
    font: 'Manrope',
    color: COLORS.textMuted,
  });
  y += 6;

  LEGAL_PARTS.forEach((part) => {
    ensureSpace(24);

    // Part header: a soft tinted card, as in the report's gateway sections.
    doc.setGState(doc.GState({ opacity: 0.24 }));
    doc.setFillColor(...COLORS.gold);
    doc.roundedRect(margin, y - 5, contentWidth, 11, 2, 2, 'F');
    doc.setGState(doc.GState({ opacity: 1 }));
    doc.setFont('CinzelSemiBold', 'normal');
    doc.setFontSize(11.5);
    doc.setTextColor(...COLORS.warmBrown);
    doc.text(part.title, margin + 4, y + 2.5);
    y += 15;

    part.sections.forEach((section) => {
      // Keep a heading with at least its first couple of lines.
      ensureSpace(22);

      doc.setFont('ManropeSemiBold', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(...COLORS.ink);
      doc.text(`${section.number}. ${section.heading}`, margin + 4, y);
      y += 6;

      section.paragraphs.forEach((p) => {
        writeWrapped(p, {
          x: margin + 4,
          width: contentWidth - 8,
          size: 9.5,
          lineHeight: 5.2,
          font: 'Manrope',
          color: COLORS.textMuted,
        });
        y += 2.5;
      });

      section.bullets?.forEach((b) => {
        ensureSpace(6);
        doc.setFont('Manrope', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(...COLORS.goldDark);
        doc.text('•', margin + 6, y);
        writeWrapped(b, {
          x: margin + 11,
          width: contentWidth - 15,
          size: 9.5,
          lineHeight: 5.2,
          font: 'Manrope',
          color: COLORS.textMuted,
        });
        y += 1.5;
      });

      y += 4;
    });

    y += 4;
  });

  // Closing acknowledgement
  ensureSpace(20);
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;
  writeWrapped(LEGAL_CLOSING, {
    x: margin + 4,
    width: contentWidth - 8,
    size: 11,
    lineHeight: 6,
    font: 'Cormorant',
    style: 'italic',
    color: COLORS.ink,
  });

  // ---------------------------------------------------------------
  // Footer stamp + page numbers (cover excluded)
  // ---------------------------------------------------------------
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);
    doc.setFont('Manrope', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(`nenya.biz · Effective ${LEGAL_EFFECTIVE_DATE}`, margin, pageHeight - 11);
    doc.text(`${i - 1} / ${totalPages - 1}`, pageWidth - margin, pageHeight - 11, { align: 'right' });
  }

  doc.save('nenya-terms-and-privacy-policy.pdf');
}
