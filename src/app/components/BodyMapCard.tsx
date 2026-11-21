import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { User } from 'lucide-react';
import { gaveText, lensName, pickupAnnouncement, pickupDiff } from '../../lib/bodyMapBrush';
import type { LensAdded, LensId } from '../../lib/lensState';
import type { BodyMapData } from './BodyMapAvatar';

// The body map as a shared card in the lens tray (owner, 2026-11-18): it sits beside the six lens cards, not inside one, and picks up each lens the first time it is added to the report.
// What a lens gives it (colors from Sight, a surface from Touch) becomes a brush on the map. A lens taken out of the report gives its brushes up; marks already painted stay.
interface Props {
  added: LensAdded[];
  mapData: BodyMapData;
  /** The lenses already announced as picked up (kept by the app so the tray announces a lens once, not every time the tray opens). */
  seen: LensId[];
  onSeen: (seen: LensId[]) => void;
  onOpen: () => void;
}

export function BodyMapCard({ added, mapData, seen, onSeen, onOpen }: Props) {
  const { fresh, seen: now } = pickupDiff(seen, added);
  const [said, setSaid] = useState('');
  const freshKey = fresh.join(',');
  useEffect(() => {
    // The polite message is put into an already-present region a moment after the card shows, so a screen reader reads it (a region that arrives with its text is often skipped).
    if (!fresh.length) { onSeen(now); return; }
    const t = setTimeout(() => { setSaid(pickupAnnouncement(fresh, added)); onSeen(now); }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freshKey, now.join(',')]);

  const placed = mapData.placements.length, strokes = mapData.strokes?.length ?? 0;
  const mapText = placed || strokes || mapData.pins?.length
    ? `On the map now: ${[placed ? `${placed} ${placed === 1 ? 'place' : 'places'} colored` : '', strokes ? `${strokes} paintbrush ${strokes === 1 ? 'stroke' : 'strokes'}` : '', mapData.pins?.length ? `${mapData.pins.length} ${mapData.pins.length === 1 ? 'pin' : 'pins'}` : ''].filter(Boolean).join(', ')}.`
    : 'Nothing on the map yet.';

  return (
    <Card className="p-4 sm:p-6 space-y-3 border-dashed border-nenya-accent-warm" data-body-map-card aria-labelledby="bm-card-title">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-full bg-muted text-muted-foreground"><User className="size-5" aria-hidden /></div>
        <h2 id="bm-card-title" className="text-xl">Body map</h2>
      </div>
      <p className="text-sm text-muted-foreground">One map for your whole report, not part of any one lens. It picks up each lens the first time you add it, and paints with the colors and surfaces they give. Optional.</p>
      {now.length === 0 ? (
        <p className="text-sm" data-bm-picked="none">No lens picked up yet. Add Sight (two colors) or Touch (a surface) to your report and they become paints. Any color from the picker works at any time.</p>
      ) : (
        <div>
          <p className="text-sm font-medium">Picked up so far</p>
          <ul className="text-sm list-disc pl-5" data-bm-picked={now.join(',')}>
            {now.map((l) => (
              <li key={l}>{lensName(l)}: {gaveText(l, added)}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-sm" data-bm-map>{mapText}</p>
      <p role="status" aria-live="polite" className="text-sm font-medium" data-bm-live>{said}</p>
      <Button size="sm" className="min-h-11" onClick={onOpen} aria-describedby="bm-card-title">Open the body map</Button>
    </Card>
  );
}
