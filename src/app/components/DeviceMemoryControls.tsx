import { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { setRemembering, useRemembering, wipeDevice } from '../../lib/deviceMemory';

// The one place a visitor decides whether this device remembers anything, and erases it.
export function DeviceMemoryControls() {
  const remembering = useRemembering();
  const [forgotten, setForgotten] = useState(false);

  return (
    <>
      <Separator />
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <Label htmlFor="remember-toggle" className="cursor-pointer text-sm leading-snug">
            Remember my settings on this device
          </Label>
          <Switch
            id="remember-toggle"
            checked={remembering}
            onCheckedChange={(on) => {
              setForgotten(false);
              setRemembering(on);
            }}
          />
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Off by default. When on, this browser keeps your theme, text size, animation and breathing choices, and that
          you agreed to the current terms, so you do not set them up each visit. It never keeps anything you write, draw,
          or choose as a session color, and none of it is sent to Nenya.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            wipeDevice({ keepOwner: true });
            setForgotten(true);
          }}
        >
          Forget everything this device remembers
        </Button>
        {forgotten && (
          <p role="status" className="text-xs text-muted-foreground">
            Cleared. Your current choices stay until you close this tab.
          </p>
        )}
      </div>
    </>
  );
}
