import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { forgetMeAndRestart, setRemembering, useRemembering } from '../../lib/deviceMemory';

// The one place a visitor decides whether this device remembers anything, and erases it.
export function DeviceMemoryControls() {
  const remembering = useRemembering();

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
            onCheckedChange={setRemembering}
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
          onClick={() => forgetMeAndRestart()}
        >
          Forget me
        </Button>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Erases what this device has saved: your settings and your agreement to the terms. Because the agreement is gone, it
          also takes you back to the start of the page, where the terms are shown again, and what you have entered in this visit
          is cleared too, so save your PDF first if you want it. Nothing is sent to Nenya. There is also a Forget me link at the
          bottom of every page.
        </p>
      </div>
    </>
  );
}

// The same erase, as a small link for the page footer, so it does not depend on opening the settings window.
export function ForgetMeLink() {
  return (
    <button
      type="button"
      className="underline underline-offset-2 transition-colors hover:text-foreground"
      title="Erase what this device has saved (your settings and your agreement to the terms) and go back to the start, where the terms are shown again"
      onClick={() => forgetMeAndRestart()}
    >
      Forget me
    </button>
  );
}
