import { useState } from 'react';
import { Button } from './ui/button';
import { TextureChooser } from './TextureChooser';
import { textureAlt, textureById, texturePath } from '../../lib/touchTextures';

interface TouchSurfaceFieldProps {
  /** "Present" or "Wish". */
  stateName: string;
  value: string | null;
  onChange: (id: string | null) => void;
  /** The Texture slider's value now (0 rough to 100 smooth). */
  slider: number;
  /** Called with a place on the Texture slider when the person asks the slider to match the surface. */
  onMatchSlider: (value: number) => void;
}

// The optional "choose a surface" part of a state card: shows the surface chosen (if any) and opens the chooser. Choosing never moves the slider; moving
// the slider to match is a separate, labelled button.
export function TouchSurfaceField({ stateName, value, onChange, slider, onMatchSlider }: TouchSurfaceFieldProps) {
  const [open, setOpen] = useState(false);
  const t = textureById(value);
  return (
    <div className="space-y-2 rounded-lg border border-border p-3">
      <div className="text-sm">Surface from pictures (optional)</div>
      {t ? (
        <div className="flex items-start gap-3">
          <img src={texturePath(t.id)} alt={textureAlt(t)} width={72} height={72} className="size-[72px] rounded-md object-cover" />
          <div className="min-w-0 flex-1 text-sm">
            <div className="font-medium">{t.title}</div>
            <div className="text-xs text-muted-foreground">{t.kind} · {t.feel}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>Change</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>Remove</Button>
              {t.smooth !== null && (
                <Button type="button" variant="ghost" size="sm" onClick={() => onMatchSlider(t.smooth as number)}>Set the Texture slider to match</Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Look through pictures of fabric, leather, bark, stone and more, as a list or a carousel, and pick the one closest to what you feel. You can skip this.</p>
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>Choose a surface</Button>
        </div>
      )}
      <TextureChooser open={open} onOpenChange={setOpen} selected={value} onChoose={onChange} slider={slider} stateName={stateName} />
    </div>
  );
}
