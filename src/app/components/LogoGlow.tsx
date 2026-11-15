import { useEffect, useRef, useState } from 'react';
import { useTheme } from './ThemeProvider';
import { GLOW_COLORS, GLOW_RADII, GLOW_SPREAD, GLOW_STRENGTH, MAX_GLOW_RADIUS, bakeGlow } from '../../lib/glowBake';
import { GEM_CENTRE, GEM_ENGINE, GEM_TO_PETALS, SPRITE_CELL, drawGemSilhouette, frameOrigin, loadGemSprite, loadImage, type GemEngine } from '../../lib/gemSprite';
import { liveGemSupported } from '../../lib/gemRenderer';

interface LogoGlowProps {
  /** The logo's size (the same `size` NenyaLogo takes). */
  size: number;
  /** Orbit view: petals layer plus the gem's silhouette. Otherwise the flat logo. */
  orbit: boolean;
  /** URL of the image whose alpha the glow is cast from (petals layer, or the flat logo). */
  maskSrc: string;
  /** With the live gem, the stone's outline is drawn as a hexagon, so the sprite is never downloaded just for the glow. */
  gemEngine?: GemEngine;
}

/** Room left around the logo for the glow: three times the largest blur radius. */
const MARGIN = 3 * MAX_GLOW_RADIUS;

function alphaOf(ctx: CanvasRenderingContext2D, w: number, h: number): Float32Array {
  const d = ctx.getImageData(0, 0, w, h).data;
  const a = new Float32Array(w * h);
  for (let i = 0; i < a.length; i++) a[i] = d[i * 4 + 3] / 255;
  return a;
}

/**
 * The logo's gold glow as two ready-made images (resting and hovered), computed once per size, theme and
 * pixel density. Replaces a CSS `filter: drop-shadow()` chain, which Safari fails to draw on an element
 * whose contents are animated or blended. Never computed per frame.
 */
export default function LogoGlow({ size, orbit, maskSrc, gemEngine = GEM_ENGINE }: LogoGlowProps) {
  const { theme } = useTheme();
  const restRef = useRef<HTMLCanvasElement>(null);
  const hoverRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  const contentSide = size * (orbit ? 0.765 : 0.85);
  const side = Math.ceil(contentSide + MARGIN * 2);

  useEffect(() => {
    let cancelled = false;
    const rest = restRef.current;
    const hover = hoverRef.current;
    if (!rest || !hover) return;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    const W = Math.round(side * scale);

    const run = async () => {
      const hexOnly = orbit && gemEngine === 'live' && liveGemSupported();
      const [mask, sprite] = await Promise.all([loadImage(maskSrc), orbit && !hexOnly ? loadGemSprite() : Promise.resolve(null)]);
      if (cancelled) return;
      const work = document.createElement('canvas');
      work.width = work.height = W;
      const ctx = work.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // The content's alpha: the petals (or the flat logo), with the gem's hexagon merged in by max.
      const cs = Math.round(contentSide * scale);
      const o = Math.round((W - cs) / 2);
      ctx.clearRect(0, 0, W, W);
      ctx.drawImage(mask, o, o, cs, cs);
      const alpha = alphaOf(ctx, W, W);
      if (sprite || hexOnly) {
        const gs = Math.round(contentSide * GEM_TO_PETALS * scale);
        const gx = Math.round(W / 2 + (GEM_CENTRE.x - 0.5) * cs - gs / 2);
        const gy = Math.round(W / 2 + (GEM_CENTRE.y - 0.5) * cs - gs / 2);
        ctx.clearRect(0, 0, W, W);
        if (sprite) {
          const [sx, sy] = frameOrigin(0);
          ctx.drawImage(sprite, sx, sy, SPRITE_CELL, SPRITE_CELL, gx, gy, gs, gs);
        } else {
          drawGemSilhouette(ctx, gx, gy, gs);
        }
        const gem = alphaOf(ctx, W, W);
        for (let i = 0; i < alpha.length; i++) if (gem[i] > alpha[i]) alpha[i] = gem[i];
      }

      const put = (canvas: HTMLCanvasElement, radii: readonly number[]) => {
        canvas.width = canvas.height = W;
        const bytes = bakeGlow(alpha, W, W, radii.map((r) => r * GLOW_SPREAD), scale, GLOW_COLORS, GLOW_STRENGTH);
        canvas.getContext('2d')?.putImageData(new ImageData(bytes, W, W), 0, 0);
      };
      put(rest, GLOW_RADII[theme === 'dark' ? 'dark' : 'light']);
      // Yield between the two bakes so the page stays responsive.
      await new Promise((r) => setTimeout(r, 0));
      if (cancelled) return;
      put(hover, GLOW_RADII[theme === 'dark' ? 'darkHover' : 'lightHover']);
      if (!cancelled) setReady(true);
    };

    // After first paint, so the glow never delays the page.
    const t = setTimeout(() => {
      run().catch(() => {
        /* no glow image: the logo still draws */
      });
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [side, contentSide, orbit, maskSrc, theme, gemEngine]);

  const place: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: side,
    height: side,
    transform: 'translate(-50%,-50%)',
    zIndex: 9,
    pointerEvents: 'none',
    opacity: ready ? undefined : 0,
  };

  return (
    <>
      <canvas ref={restRef} aria-hidden="true" className="nenya-glow-rest" style={place} />
      <canvas ref={hoverRef} aria-hidden="true" className="nenya-glow-hover" style={place} />
    </>
  );
}
