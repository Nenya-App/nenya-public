import { texturePath } from '../../lib/touchTextures';
import { orbStyle, orbWords, type OrbShape, type OrbValues } from '../../lib/touchOrb';

// The Touch display (tray mode): the picked surface on a sphere (or a flat circle), changing as the five sliders move, and the same thing in words below it. Reduced motion: the change is
// instant. The picture is a starting point, never a measurement.
export function TouchOrb({ surfaceId, values, shape, stateName }: { surfaceId: string | null; values: OrbValues; shape: OrbShape; stateName: string }) {
  const st = orbStyle(values, surfaceId ? texturePath(surfaceId) : null, shape);
  const words = orbWords(values);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative grid size-48 place-items-center">
        <div className="absolute bottom-1.5 left-1/2 -ml-14 h-3.5 w-28 rounded-[50%] bg-black/35 motion-safe:transition motion-safe:duration-300" style={st.shadow as React.CSSProperties} aria-hidden="true" />
        <div
          role="img"
          aria-label={`The ${stateName.toLowerCase()} surface you picked, shown as a ${shape === 'sphere' ? 'sphere' : 'flat circle'}, changing as you move the sliders. The line below says the same in words.`}
          className="size-36 motion-safe:transition motion-safe:duration-300"
          style={st.orb as React.CSSProperties}
        />
      </div>
      <p className="text-center text-xs text-muted-foreground">It feels: <span role="status" aria-live="polite">{words}</span></p>
    </div>
  );
}
