import { useMemo, useState } from 'react';
import { waveOf, wavePath, type WaveInput } from '../../lib/soundWave';

// The picture of the melody's sound wave that the Pitch and Volume sliders edit (tray). Each note is a real piece of its wave; higher notes show more cycles; the Pitch slider moves them all, Volume sets the
// height, the first timbre word shapes it. The words twin says the same. A slow scan line shows where the melody is as it plays across the picture; it stands still under reduced motion and can be paused (WCAG 2.2.2).
const CSS = `@keyframes soundScan { from { transform: translateX(0); } to { transform: translateX(var(--w)); } }
.sound-scan { animation: soundScan 6s linear infinite; }
.sound-wave-paused .sound-scan { animation: none; }
@media (prefers-reduced-motion: reduce) { .sound-scan { animation: none; } }`;

export function SoundWave({ input, stateName }: { input: WaveInput; stateName: string }) {
  const [paused, setPaused] = useState(false);
  const W = 320, H = 110;
  const wave = useMemo(() => waveOf(input), [input.freqs.join(','), input.pitch, input.volume, input.timbre]);
  return (
    <div className={`space-y-2 ${paused ? 'sound-wave-paused' : ''}`}>
      <style>{CSS}</style>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`The sound wave of your melody for your ${stateName.toLowerCase()} state. The line below says the same in words.`} className="w-full max-w-md rounded-md border border-border text-foreground" focusable="false">
        <line x1="0" x2={W} y1={H / 2} y2={H / 2} stroke="currentColor" strokeOpacity="0.2" />
        {wave.noteSpans.map(([a], i) => i > 0 && <line key={i} x1={(wave.points[a][0] * W).toFixed(1)} x2={(wave.points[a][0] * W).toFixed(1)} y1="0" y2={H} stroke="currentColor" strokeOpacity="0.12" strokeDasharray="2 3" />)}
        <path d={wavePath(wave, W, H)} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <g style={{ ['--w' as string]: `${W}px` }}><line className="sound-scan" x1="0" x2="0" y1="0" y2={H} stroke="currentColor" strokeOpacity="0.5" /></g>
      </svg>
      <p className="text-xs text-muted-foreground" role="status" aria-live="polite">{wave.label}</p>
      {wave.points.length > 0 && <button type="button" onClick={() => setPaused((p) => !p)} aria-pressed={paused} className="min-h-11 text-xs underline underline-offset-4 text-muted-foreground">{paused ? 'Play the scan line' : 'Pause the scan line'}</button>}
    </div>
  );
}
