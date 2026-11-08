import { useEffect, useRef, useSyncExternalStore } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { getBreathingSound, setBreathingSound, setBreathingTones, useBreathingSound, useBreathingTones, type BreathingSound } from '../../lib/deviceMemory';
import { ARRANGEMENTS } from '../../lib/breathArrangements';
import {
  announceTones,
  getAnnouncement,
  playPreview,
  startTonePlayer,
  subscribeAnnouncement,
  unlockAudio,
} from '../../lib/breathTones';
import type { BreathTiming } from '../../lib/breathClock';

// Breathing tones: one setting, three switches (near the top of the page, in the accessibility panel, on the breathing
// counter), a polite announcement, and the player. See docs/accessibility-audio-scope.md.

export const TONES_DESCRIPTION =
  'Plays a rising note for each count of an inhale and a falling note for each count of an exhale, with quiet repeated notes for holds. Off by default.';

/** Switching on is the click that lets the browser play sound: unlock it here, play one sample note, and say so. */
export function setTones(on: boolean): void {
  if (on) {
    unlockAudio();
    playPreview(getBreathingSound());
  }
  setBreathingTones(on);
  announceTones(on ? 'Breathing tones on' : 'Breathing tones off');
}

/**
 * The same switch in three places.
 *  - "skip": first in the page's reading and tab order, invisible until it has keyboard focus (the pattern of a "skip to
 *    content" link), so a screen-reader user finds it without having to look for a settings panel.
 *  - "panel": with the other settings in the accessibility panel.
 *  - "counter": a small labelled button on the breathing counter.
 */
export function BreathTonesSwitch({ variant }: { variant: 'skip' | 'panel' | 'counter' }) {
  const on = useBreathingTones();
  const describedBy = `tones-desc-${variant}`;

  if (variant === 'panel') {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label htmlFor="tones-toggle" className="cursor-pointer text-sm">
            Breathing tones
          </Label>
          <Switch id="tones-toggle" checked={on} onCheckedChange={setTones} aria-describedby={describedBy} />
        </div>
        <p id={describedBy} className="text-xs text-muted-foreground">
          {TONES_DESCRIPTION}
        </p>
      </div>
    );
  }

  if (variant === 'counter') {
    return (
      <>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label="Breathing tones"
          aria-describedby={describedBy}
          title={on ? 'Breathing tones: on' : 'Breathing tones: off'}
          onClick={() => setTones(!on)}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '2px',
            right: '26px',
            padding: '3px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            color: on ? 'rgba(232,160,32,0.95)' : 'rgba(232,160,32,0.55)',
          }}
        >
          {on ? <Volume2 size={13} aria-hidden="true" /> : <VolumeX size={13} aria-hidden="true" />}
        </button>
        <span id={describedBy} className="sr-only">
          {TONES_DESCRIPTION}
        </span>
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Breathing tones"
        aria-describedby={describedBy}
        onClick={() => setTones(!on)}
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[250] focus:rounded-md focus:border focus:border-border focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:text-foreground focus:shadow-lg"
      >
        Breathing tones: {on ? 'on. Press to turn off.' : 'off. Press to turn on.'}
      </button>
      <span id={describedBy} className="sr-only">
        {TONES_DESCRIPTION}
      </span>
    </>
  );
}

/** Which style the tones are played in. Choosing one plays a short taste of it, and says so politely. */
export function BreathToneStyle() {
  const style = useBreathingSound();
  const on = useBreathingTones();
  const current = ARRANGEMENTS.find((a) => a.id === style) ?? ARRANGEMENTS[0];
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="tones-style" className="text-sm">
          Tone style
        </Label>
        <select
          id="tones-style"
          value={style}
          aria-describedby="tones-style-desc"
          onChange={(e) => {
            const next = e.target.value as BreathingSound;
            setBreathingSound(next);
            // Choosing is a click, so the browser lets this taste play even if the tones are still off.
            playPreview(next);
            announceTones(`Tone style: ${ARRANGEMENTS.find((a) => a.id === next)?.label ?? next}`);
          }}
          className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
        >
          {ARRANGEMENTS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
      </div>
      <p id="tones-style-desc" className="text-xs text-muted-foreground">
        {current.description}
        {on ? '' : ' (Choosing a style plays a short taste, even with the tones off.)'}
      </p>
    </div>
  );
}

/** The polite live region that says "Breathing tones on" or "off". Never moves focus. */
export function TonesAnnouncer() {
  const message = useSyncExternalStore(subscribeAnnouncement, getAnnouncement, () => '');
  return (
    <div role="status" aria-live="polite" className="sr-only">
      {message}
    </div>
  );
}

/** Plays the tones while `active`. Stops when the tab is hidden, the setting is off, or the breathing stops. */
export function BreathTonesPlayer({ active, timing, cycleStart }: { active: boolean; timing: BreathTiming; cycleStart: number }) {
  const on = useBreathingTones();
  const arrangement = useBreathingSound();
  // Read by the player on every tick, so a new rhythm or style is picked up without restarting it.
  const stateRef = useRef({ timing, cycleStart, arrangement });
  stateRef.current = { timing, cycleStart, arrangement };
  useEffect(() => {
    if (!on || !active) return;
    let stop: (() => void) | null = null;
    const begin = () => {
      if (!stop && !document.hidden) stop = startTonePlayer(() => stateRef.current);
    };
    const end = () => {
      stop?.();
      stop = null;
    };
    const onVisibility = () => (document.hidden ? end() : begin());
    document.addEventListener('visibilitychange', onVisibility);
    begin();
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      end();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, active]);
  return null;
}
