// Builds the "Sensory Reflection Report" PDF that a visitor can download
// from the Gateway Review page. Styled to match the live app's own brand
// system (see src/styles/globals.css) rather than default jsPDF styling:
// the real Cinzel/Manrope/Cormorant Garamond font files (self-hosted for
// the web app already) are fetched and embedded, along with the actual
// logo mark, so the document reads as an artifact of the app itself.
import type { Gateway, GatewayData } from '../app/App';
import { NOTE_NAMES } from './audio';

// Matches the --nenya-* custom properties in src/styles/globals.css.
const COLORS = {
  goldLight: [232, 196, 168] as [number, number, number], // --nenya-gold-light #E8C4A8
  gold: [221, 184, 140] as [number, number, number], // --nenya-gold #DDB88C
  goldDark: [201, 168, 138] as [number, number, number], // --nenya-gold-dark #C9A88A
  cream: [245, 241, 237] as [number, number, number], // --background-secondary #F5F1ED
  warmBrown: [26, 21, 18] as [number, number, number], // dark-mode --background #1A1512
  ink: [74, 68, 64] as [number, number, number], // light-mode --foreground #4A4440
  textMuted: [124, 114, 106] as [number, number, number],
};

const FONT_BASE = '/pdf-assets/fonts';
const FONT_FILES = [
  { file: 'Cinzel-Bold.ttf', name: 'Cinzel', style: 'bold' },
  { file: 'Cinzel-SemiBold.ttf', name: 'CinzelSemiBold', style: 'normal' },
  { file: 'Manrope-Regular.ttf', name: 'Manrope', style: 'normal' },
  { file: 'Manrope-SemiBold.ttf', name: 'ManropeSemiBold', style: 'normal' },
  { file: 'Manrope-Bold.ttf', name: 'Manrope', style: 'bold' },
  { file: 'CormorantGaramond-Italic.ttf', name: 'Cormorant', style: 'italic' },
] as const;

type LoadedFont = { file: string; name: string; style: string; base64: string };

let fontCache: LoadedFont[] | null = null;
let logoCache: string | null = null;

async function arrayBufferToBase64(buf: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buf);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function loadFonts(): Promise<LoadedFont[]> {
  if (fontCache) return fontCache;
  fontCache = await Promise.all(
    FONT_FILES.map(async (f) => {
      const res = await fetch(`${FONT_BASE}/${f.file}`);
      const base64 = await arrayBufferToBase64(await res.arrayBuffer());
      return { ...f, base64 };
    })
  );
  return fontCache;
}

async function loadLogo(): Promise<string> {
  if (logoCache) return logoCache;
  const res = await fetch('/pdf-assets/nenya-logo.png');
  const base64 = await arrayBufferToBase64(await res.arrayBuffer());
  logoCache = `data:image/png;base64,${base64}`;
  return logoCache;
}

function registerFonts(doc: any, fonts: LoadedFont[]) {
  fonts.forEach((f) => {
    doc.addFileToVFS(f.file, f.base64);
    doc.addFont(f.file, f.name, f.style);
  });
}

// jsPDF has no letter-spacing option, and the brand's wordmarks lean on
// wide tracking -- draw character-by-character with an explicit gap.
function drawTracked(
  doc: any,
  text: string,
  x: number,
  y: number,
  opts: { align?: 'left' | 'center'; tracking?: number } = {}
) {
  const { align = 'left', tracking = 0 } = opts;
  const chars = text.split('');
  const widths = chars.map((c) => doc.getTextWidth(c));
  const total = widths.reduce((a, b) => a + b, 0) + tracking * Math.max(chars.length - 1, 0);
  let cursor = align === 'center' ? x - total / 2 : x;
  chars.forEach((c, i) => {
    doc.text(c, cursor, y);
    cursor += widths[i] + tracking;
  });
}

function hexToRgbTuple(hex: string): [number, number, number] {
  const clean = (hex || '').replace('#', '').padEnd(6, '0');
  return [parseInt(clean.slice(0, 2), 16) || 0, parseInt(clean.slice(2, 4), 16) || 0, parseInt(clean.slice(4, 6), 16) || 0];
}

function lerpColor(a: string, b: string, t: number): [number, number, number] {
  const [ar, ag, ab] = hexToRgbTuple(a);
  const [br, bg, bb] = hexToRgbTuple(b);
  return [ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t];
}

// Actual filled color chips for the sight gateway's chosen colors, rather
// than leaving them as hex text -- what someone picked in that gateway is
// the point, so it should be visible at a glance.
function drawColorSwatches(
  doc: any,
  x: number,
  y: number,
  swatches: { hex: string; label: string; caption?: string }[]
): number {
  const size = 13;
  const gap = 8;
  swatches.forEach((s, i) => {
    const sx = x + i * (size + gap);
    const [r, g, b] = hexToRgbTuple(s.hex);
    doc.setFillColor(r, g, b);
    doc.setDrawColor(...COLORS.goldDark);
    doc.setLineWidth(0.3);
    doc.roundedRect(sx, y, size, size, 1.5, 1.5, 'FD');

    doc.setFont('ManropeSemiBold', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.ink);
    doc.text(s.label, sx + size / 2, y + size + 4, { align: 'center' });

    if (s.caption) {
      doc.setFont('Manrope', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...COLORS.textMuted);
      doc.text(s.caption, sx + size / 2, y + size + 8, { align: 'center' });
    }
  });
  return size + 13;
}

// A small melodic contour chart for the sound gateway's melody: each note
// plotted by pitch height and connected in sequence, colored along the same
// gradient the in-app melody composer uses between its two anchor colors.
function drawMelodyVisualizer(
  doc: any,
  x: number,
  y: number,
  width: number,
  melody: (number | null)[],
  colorA: string,
  colorB: string
): number {
  const steps = melody.length;
  const chartHeight = 20;
  const baseY = y + chartHeight;
  const stepGap = steps > 1 ? width / (steps - 1) : 0;
  const maxIdx = NOTE_NAMES.length - 1;
  const denom = Math.max(steps - 1, 1);

  doc.setDrawColor(...COLORS.goldLight);
  doc.setLineWidth(0.2);
  doc.line(x, baseY, x + width, baseY);

  const points: ({ px: number; py: number } | null)[] = melody.map((idx, i) => {
    if (idx == null) return null;
    return { px: x + i * stepGap, py: baseY - (idx / maxIdx) * chartHeight };
  });

  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (!a || !b) continue;
    const [r, g, b2] = lerpColor(colorA, colorB, i / denom);
    doc.setDrawColor(r, g, b2);
    doc.setLineWidth(0.6);
    doc.line(a.px, a.py, b.px, b.py);
  }

  melody.forEach((idx, i) => {
    const px = x + i * stepGap;
    if (idx == null) {
      doc.setDrawColor(...COLORS.textMuted);
      doc.setLineWidth(0.2);
      doc.circle(px, baseY, 1.2, 'S');
      return;
    }
    const [r, g, b] = lerpColor(colorA, colorB, i / denom);
    const py = baseY - (idx / maxIdx) * chartHeight;
    doc.setFillColor(r, g, b);
    doc.circle(px, py, 1.6, 'F');
    doc.setFont('Manrope', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(NOTE_NAMES[idx], px, baseY + 5, { align: 'center' });
  });

  return chartHeight + 11;
}

export async function downloadNenyaPdfReport(
  gatewayData: GatewayData[],
  gatewayTitles: Record<Gateway, string>,
  formatGatewayData: (gateway: Gateway, data: any) => string[]
) {
  const { jsPDF } = await import('jspdf');
  const [fonts, logoDataUrl] = await Promise.all([loadFonts(), loadLogo()]);

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  registerFonts(doc, fonts);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 22;
  const contentWidth = pageWidth - margin * 2;
  const centerX = pageWidth / 2;

  // The logo mark isn't square -- size placements off its real aspect
  // ratio instead of assuming 1:1.
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
    doc.text('Sensory Reflection Report', pageWidth - margin, y, { align: 'right' });
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

  // Dark brown, matching the site's own background -- the logo's thin gold
  // outline is nearly invisible against a pale/gold-tinted circle, so this
  // needs real contrast rather than a tint.
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
  drawTracked(doc, 'SENSORY REFLECTION REPORT', centerX, 109, { align: 'center', tracking: 1 });

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
  const introLines = doc.splitTextToSize(
    'This report reflects a private session of self-exploration through Nenya’s six sensory gateways. It is offered as a starting point for your own reflection, or for a conversation with a therapist, spiritual counselor, or trusted guide — never as a diagnosis or a directive.',
    150
  );
  doc.text(introLines, centerX, 148, { align: 'center' });

  const timestamp = new Date().toLocaleString();
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.textMuted);
  doc.text(`Generated ${timestamp}`, centerX, pageHeight - 32, { align: 'center' });

  doc.setFont('ManropeSemiBold', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.goldDark);
  drawTracked(doc, 'PRIVACY-FIRST · USER-SOVEREIGN · OPEN & TRANSPARENT', centerX, pageHeight - 24, {
    align: 'center',
    tracking: 0.3,
  });

  // ---------------------------------------------------------------
  // Gateway sections
  // ---------------------------------------------------------------
  let y = newContentPage();

  gatewayData.forEach((gd) => {
    const dataLines = formatGatewayData(gd.gateway, gd.data);
    const hasBodyMap = gd.gateway === 'sight' && !!gd.data?.bodyMap?.imageDataUrl;
    const hasColorSwatches = gd.gateway === 'sight' && !!gd.data?.color1 && !!gd.data?.color2;
    const melody: (number | null)[] | null =
      gd.gateway === 'sound' && Array.isArray(gd.data?.melody) && gd.data.melody.some((n: number | null) => n !== null)
        ? gd.data.melody
        : null;
    const estimatedHeight =
      14 + dataLines.length * 5.6 + (hasBodyMap ? 62 : 0) + (hasColorSwatches ? 26 : 0) + (melody ? 33 : 0) + 10;

    if (y + estimatedHeight > pageHeight - 26) {
      y = newContentPage();
    }

    // Section header, a soft tinted card rather than a solid block.
    doc.setGState(doc.GState({ opacity: 0.24 }));
    doc.setFillColor(...COLORS.gold);
    doc.roundedRect(margin, y - 5, contentWidth, 11, 2, 2, 'F');
    doc.setGState(doc.GState({ opacity: 1 }));

    doc.setFont('CinzelSemiBold', 'normal');
    doc.setFontSize(11.5);
    doc.setTextColor(...COLORS.warmBrown);
    doc.text(gatewayTitles[gd.gateway], margin + 4, y + 2.5);
    y += 13;

    if (hasColorSwatches) {
      if (y + 26 > pageHeight - 26) {
        y = newContentPage();
      }
      const consumed = drawColorSwatches(doc, margin + 4, y, [
        { hex: gd.data.color1, label: 'Present', caption: gd.data.color1Name || gd.data.color1 },
        { hex: gd.data.color2, label: 'Wish', caption: gd.data.color2Name || gd.data.color2 },
      ]);
      y += consumed;
    }

    if (melody) {
      if (y + 33 > pageHeight - 26) {
        y = newContentPage();
      }
      const consumed = drawMelodyVisualizer(
        doc,
        margin + 4,
        y,
        contentWidth - 8,
        melody,
        gd.data.melodyColor1 || '#DDB88C',
        gd.data.melodyColor2 || '#C9A88A'
      );
      y += consumed;
    }

    dataLines.forEach((line) => {
      if (y > pageHeight - 26) {
        y = newContentPage();
      }
      if (line.startsWith('  ')) {
        doc.setFont('Manrope', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.textMuted);
        // Free-text fields (Description, Body sensation) can run well
        // past a single line's width -- wrap rather than let them run off
        // the page edge.
        const wrapped: string[] = doc.splitTextToSize(line.trim(), contentWidth - 12);
        wrapped.forEach((wrappedLine) => {
          if (y > pageHeight - 26) {
            y = newContentPage();
          }
          doc.text(wrappedLine, margin + 8, y);
          y += 5.6;
        });
        return;
      }
      doc.setFont('ManropeSemiBold', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.ink);
      doc.text(line, margin + 4, y);
      y += 5.6;
    });

    if (hasBodyMap) {
      if (y + 60 > pageHeight - 26) {
        y = newContentPage();
      }
      try {
        const imgW = 60;
        const imgH = 55;
        doc.setDrawColor(...COLORS.gold);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin + 4, y, imgW, imgH, 2, 2);
        doc.addImage(gd.data.bodyMap.imageDataUrl, 'JPEG', margin + 5, y + 1, imgW - 2, imgH - 2);
        y += imgH + 8;
      } catch {
        // If the captured body-map image fails to decode, skip it rather
        // than breaking the rest of the report.
      }
    }

    y += 6;
  });

  // ---------------------------------------------------------------
  // Footer stamp + page numbers on every content page (cover excluded)
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
    doc.text('Generated by Nenya · nenya.biz · Privacy-first, user-sovereign, open & transparent', margin, pageHeight - 11);
    doc.text(`${i - 1} / ${totalPages - 1}`, pageWidth - margin, pageHeight - 11, { align: 'right' });
  }

  doc.save(`nenya-sensory-report-${new Date().toISOString().split('T')[0]}.pdf`);
}
