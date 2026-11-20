import { forwardRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { valarColors } from './ValarBreathingLogo';
import { describePlainly } from '../../lib/colorNames';
import { shapeById } from '../../lib/gatewayShapes';
import { customLine, type CustomLens } from '../../lib/customLens';

// A custom lens in the text list (the equal alternative to its leaf in the ring), and where picking its leaf up lands. For this visit only: the text is shown as plain text, never added to a report.
interface Props { lens: CustomLens; opened: boolean; onOpen: () => void; onRemove: () => void }

export const CustomLensCard = forwardRef<HTMLHeadingElement, Props>(function CustomLensCard({ lens, opened, onOpen, onRemove }, ref) {
  const v = valarColors[lens.color], hex = v?.vector[0] ?? '#888888';
  const shape = lens.pattern ? shapeById(lens.pattern) : undefined;
  return (
    <Card className="p-4 sm:p-6 h-full space-y-3 border-border">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="inline-block size-8 shrink-0 rounded-full border border-foreground" style={{ background: hex }} />
        <h2 className="text-xl" tabIndex={-1} ref={ref}>{lens.name}</h2>
      </div>
      <p className="text-sm text-muted-foreground">{customLine(lens)}</p>
      <p className="text-sm">Your own lens, for this visit only. Colour: {v?.name}, {describePlainly(hex)}.</p>
      <p className="text-sm" data-lens-status={opened ? 'examined' : 'not-opened'}>{opened ? 'Picked up' : 'Not opened'}</p>
      {opened && shape && (
        <figure className="space-y-1">
          <span className="block size-24 text-foreground" role="img" aria-label={shape.alt} dangerouslySetInnerHTML={{ __html: shape.svg }} />
          <figcaption className="text-sm">Pattern: {shape.label}</figcaption>
        </figure>
      )}
      {opened && !shape && <p className="text-sm text-muted-foreground">There is no Pattern linked. Nothing you wrote here is added to your report or sent anywhere.</p>}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" className="min-h-11" onClick={onOpen} aria-label={`Open ${lens.name}`}>Open</Button>
        <Button size="sm" variant="outline" className="min-h-11" onClick={onRemove} aria-label={`Remove ${lens.name}`}>Remove</Button>
      </div>
    </Card>
  );
});
