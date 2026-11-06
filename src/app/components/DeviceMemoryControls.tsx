import { useEffect, useRef, useState } from 'react';
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
        <ForgetMeControl variant="button" />
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
  return <ForgetMeControl variant="link" />;
}

/** The question shown before anything is erased. Cancel is first, so a stray Enter or tap does nothing. Escape cancels. */
export function ForgetMeConfirmPanel({ onCancel, onConfirm, compact = false }: { onCancel: () => void; onConfirm: () => void; compact?: boolean }) {
  return (
    <div
      role="group"
      aria-label="Confirm Forget me"
      className={compact ? 'inline-flex flex-wrap items-center gap-2' : 'space-y-2 rounded-md border bg-card p-3'}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCancel();
      }}
    >
      <p className={compact ? 'text-xs' : 'text-xs leading-relaxed'}>
        <strong>Are you sure?</strong>{' '}
        {compact
          ? 'This erases what this device saved and starts over, and what you entered is cleared.'
          : 'This erases what this device has saved, takes you back to the start where you will be asked to agree to the terms again, and clears what you have entered in this visit.'}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          data-forget-cancel
          className="rounded-md border px-3 py-1 text-xs transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="rounded-md border border-destructive px-3 py-1 text-xs text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={onConfirm}
        >
          Yes, forget me
        </button>
      </div>
    </div>
  );
}

// One control with two steps: the trigger, then the question. Focus moves to Cancel when the question appears and back to the
// trigger when it is dismissed.
function ForgetMeControl({ variant }: { variant: 'button' | 'link' }) {
  const [asking, setAsking] = useState(false);
  const box = useRef<HTMLSpanElement>(null);
  const wasAsking = useRef(false);

  useEffect(() => {
    if (asking) box.current?.querySelector<HTMLElement>('[data-forget-cancel]')?.focus();
    else if (wasAsking.current) box.current?.querySelector<HTMLElement>('[data-forget-trigger]')?.focus();
    wasAsking.current = asking;
  }, [asking]);

  const panel = <ForgetMeConfirmPanel compact={variant === 'link'} onCancel={() => setAsking(false)} onConfirm={() => forgetMeAndRestart()} />;
  if (variant === 'link') {
    return (
      <span ref={box} className="inline-flex items-center gap-2">
        {asking ? (
          panel
        ) : (
          <button
            type="button"
            data-forget-trigger
            className="underline underline-offset-2 transition-colors hover:text-foreground"
            title="Erase what this device has saved (your settings and your agreement to the terms) and go back to the start, where the terms are shown again"
            onClick={() => setAsking(true)}
          >
            Forget me
          </button>
        )}
      </span>
    );
  }
  return (
    <span ref={box} className="block">
      {asking ? (
        panel
      ) : (
        <Button data-forget-trigger variant="outline" size="sm" className="w-full" onClick={() => setAsking(true)}>
          Forget me
        </Button>
      )}
    </span>
  );
}
