// A drawing from src/lib/gatewayShapes.ts as a picture (PNG) for the PDF report, made in the browser from the drawing's own code. Browser only.
import type { Shape } from './gatewayShapes';

export async function shapeToPng(shape: Shape, px = 240): Promise<string> {
  const svg = shape.svg.replace(/currentColor/g, '#3b3b3b').replace('<svg ', `<svg width="${px}" height="${px}" `);
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('drawing')); img.src = url; });
    const canvas = document.createElement('canvas');
    canvas.width = px;
    canvas.height = px;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, px, px);
    ctx.drawImage(img, 0, 0, px, px);
    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
}
