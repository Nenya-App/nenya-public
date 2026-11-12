import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '../app/components/ThemeProvider';
import { MotionProvider, preloadMotion } from '../app/components/MotionProvider';
import NenyaLogo from '../app/components/NenyaLogo';
import '../styles/index.css';

// ?round=22 rounds the corners of a plain background (a percentage of the box). ?light=1 darkens the drawing for use on light backgrounds (the strokes are made for a dark ground). ?size=1024 (pixels, the logo's box), ?bg=%23rrggbb (a plain background; transparent if absent), ?orbs=1 (the orbit view), ?glow=1 (the gold glow). Hold the stone still by running the
// browser with reduced motion, so every export shows the same cut.
preloadMotion();
const q = new URLSearchParams(window.location.search);
const size = Math.max(16, Math.min(4096, Number(q.get('size')) || 1024));
const bg = q.get('bg') || 'transparent';
// ?box=512 draws the logo centred in a square box of that size; ?w=1200&h=630 in a rectangle. Otherwise the box is the logo's own size.
const boxW = Math.max(16, Math.min(8192, Number(q.get('w')) || Number(q.get('box')) || size));
const boxH = Math.max(16, Math.min(8192, Number(q.get('h')) || Number(q.get('box')) || size));
document.documentElement.style.background = bg;
document.body.style.background = bg;
// ?s=<the bench's settings, as JSON>: the gem's light, cut, quality, finish and orbits, exactly as the /bench/ page's "Copy settings" gives them. Without it the site's defaults are drawn.
const gem = (() => {
  try {
    return JSON.parse(q.get('s') || '{}') as Record<string, Record<string, unknown> | undefined>;
  } catch {
    return {};
  }
})();
// ?vivid=1 makes the orbs bright and steady and lets more of their color wheel through the stone, so the static picture of the gem is as colorful as the old one (the live gem on the site keeps its own, subtler look).
const vivid = q.get('vivid') === '1';
// ?flat=1: the flat logo (petals, bezel, the live gem) with no outer ring. The site's flat logo is a baked picture with the old gem in it, so the static flat assets are drawn this way instead; the orbs under the stone give it its color.
const flat = q.get('flat') === '1';
createRoot(document.getElementById('root')!).render(
  <MotionProvider>
    <ThemeProvider defaultTheme="dark">
      <div style={{ width: boxW, height: boxH, background: bg, borderRadius: q.get('round') ? `${Number(q.get('round'))}%` : undefined, filter: q.get('light') === '1' ? 'brightness(0.55) saturate(1.35)' : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <NenyaLogo size={size} showValarOrbit={q.get('orbs') === '1' || flat} glow={q.get('glow') === '1'} breathingEnabled={q.get('breathe') === '1'}
          liveGem={{ light: (vivid || flat) ? { below: 1.2, saturation: 1.6, ...gem.light } : gem.light, cut: gem.cut, quality: gem.quality, kaleidoscope: { ...gem.kaleidoscope, on: false, depth: 0 } } as never}
          gemLook={((vivid || flat) ? { fieldAlpha: 0.7, ...gem.finish } : gem.finish) as never}
          innerOrbit={((vivid || flat) ? { ...gem.inner, opacityLow: 0.95, opacityHigh: 0.95, pulse: 0 } : gem.inner) as never}
          outerOrbit={(flat ? { ...gem.outer, show: false } : gem.outer) as never}
        />
      </div>
    </ThemeProvider>
  </MotionProvider>,
);
