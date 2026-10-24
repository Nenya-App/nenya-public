// Shared building blocks for Nenya's branded PDFs (the sensory report and
// the downloadable Terms & Privacy document): palette, self-hosted fonts,
// logo, and tracked-text drawing.

// Matches the --nenya-* custom properties in src/styles/globals.css.
export const COLORS = {
  goldLight: [232, 196, 168] as [number, number, number], // --nenya-gold-light #E8C4A8
  gold: [221, 184, 140] as [number, number, number], // --nenya-gold #DDB88C
  goldDark: [201, 168, 138] as [number, number, number], // --nenya-gold-dark #C9A88A
  cream: [245, 241, 237] as [number, number, number], // --background-secondary #F5F1ED
  warmBrown: [26, 21, 18] as [number, number, number], // dark-mode --background #1A1512
  ink: [74, 68, 64] as [number, number, number], // light-mode --foreground #4A4440
  textMuted: [124, 114, 106] as [number, number, number],
};

export const FONT_BASE = '/pdf-assets/fonts';
export const FONT_FILES = [
  { file: 'Cinzel-Bold.ttf', name: 'Cinzel', style: 'bold' },
  { file: 'Cinzel-SemiBold.ttf', name: 'CinzelSemiBold', style: 'normal' },
  { file: 'Manrope-Regular.ttf', name: 'Manrope', style: 'normal' },
  { file: 'Manrope-SemiBold.ttf', name: 'ManropeSemiBold', style: 'normal' },
  { file: 'Manrope-Bold.ttf', name: 'Manrope', style: 'bold' },
  { file: 'CormorantGaramond-Italic.ttf', name: 'Cormorant', style: 'italic' },
] as const;

export type LoadedFont = { file: string; name: string; style: string; base64: string };

let fontCache: LoadedFont[] | null = null;
let logoCache: string | null = null;

export async function arrayBufferToBase64(buf: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buf);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export async function loadFonts(): Promise<LoadedFont[]> {
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

export async function loadLogo(): Promise<string> {
  if (logoCache) return logoCache;
  const res = await fetch('/pdf-assets/nenya-logo.png');
  const base64 = await arrayBufferToBase64(await res.arrayBuffer());
  logoCache = `data:image/png;base64,${base64}`;
  return logoCache;
}

export function registerFonts(doc: any, fonts: LoadedFont[]) {
  fonts.forEach((f) => {
    doc.addFileToVFS(f.file, f.base64);
    doc.addFont(f.file, f.name, f.style);
  });
}

// jsPDF has no letter-spacing option, and the brand's wordmarks lean on
// wide tracking -- draw character-by-character with an explicit gap.
export function drawTracked(
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
