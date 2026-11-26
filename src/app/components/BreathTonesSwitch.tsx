import { useEffect, useRef, useSyncExternalStore } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { getBreathingSound, setBreathingSound, setBreathingTones, useBreathingSound, useBreathingTones, type BreathingSound } from '../../lib/deviceMemory';
import { ARRANGEMENTS } from '../../lib/breathArrangements';
import {
  announceTones,
  getAnnouncement,
  isTonePlayerRunning,
  playPreview,
  startTonePlayer,
  subscribeAnnouncement,
  unlockAudio,
} from '../../lib/breathTones';
import type { BreathTiming } from '../../lib/breathClock';
import { setBreathingToneVolume, useBreathingToneVolume } from '../../lib/deviceMemory';
import { isToneMuted, setToneMuted, setToneVolume, subscribeToneLevel } from '../../lib/breathTones';
import { muteAnnouncement, muteButtonText, TONES_BUTTON_HELP, TONES_BUTTON_LABEL, tonesButtonText, VOLUME_HELP, VOLUME_LABEL, volumeText } from '../../lib/breathHum';

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
            top: 0,
            right: '44px',
            width: '44px',
            height: '44px',
            padding: 0,
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            color: on ? 'rgba(232,160,32,0.95)' : 'rgba(232,160,32,0.85)',
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

/**
 * The tones' own off switch and mute, placed directly under "Stop motion" in the accessibility panel.
 * Stop motion deliberately does not silence the tones: sound is not motion, and a person who has stopped the movement may be
 * relying on the tones to follow the breath (the ring and the counter's number carry on too). So the tones get a switch of their
 * own in the same place, and the person decides. It is the same setting as the other switches (setTones), shown as a toggle button.
 */
export function BreathTonesQuickControls() {
  const on = useBreathingTones();
  const muted = useSyncExternalStore(subscribeToneLevel, isToneMuted, () => false);
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={on}
          aria-label={TONES_BUTTON_LABEL}
          aria-describedby="tones-quick-help"
          onClick={() => setTones(!on)}
          className="min-h-11 flex-1 rounded-md border-2 border-foreground px-3 text-sm font-medium text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          {tonesButtonText(on)}
        </button>
        <button
          type="button"
          aria-pressed={muted}
          disabled={!on}
          onClick={() => {
            setToneMuted(!muted);
            announceTones(muteAnnouncement(!muted));
          }}
          className="min-h-11 rounded-md border border-border px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:opacity-60"
        >
          {muteButtonText(muted)}
        </button>
      </div>
      <p id="tones-quick-help" className="text-xs text-muted-foreground">
        {TONES_BUTTON_HELP}
      </p>
    </div>
  );
}

/** How loud the tones are: a labelled slider in 5% steps, its own setting apart from the device's volume. */
export function BreathToneVolume() {
  const volume = useBreathingToneVolume();
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="tones-volume" className="text-sm">
          {VOLUME_LABEL}
        </label>
        <span className="text-xs text-muted-foreground" aria-hidden="true">
          {volumeText(volume)}
        </span>
      </div>
      <input
        id="tones-volume"
        type="range"
        min={0}
        max={100}
        step={5}
        value={volume}
        aria-valuetext={volumeText(volume)}
        aria-describedby="tones-volume-help"
        onChange={(e) => {
          const v = Number(e.target.value);
          setBreathingToneVolume(v);
          setToneVolume(v);
        }}
        className="h-6 w-full cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      />
      <p id="tones-volume-help" className="text-xs text-muted-foreground">
        {VOLUME_HELP}
      </p>
    </div>
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
            // While the tones are playing, the new style begins with the next breath (so nothing cuts in midway). When they are
            // not playing, choosing is a click, so a short taste plays even if the tones are still off.
            const label = ARRANGEMENTS.find((a) => a.id === next)?.label ?? next;
            if (isTonePlayerRunning()) {
              announceTones(`Tone style: ${label}, starting with the next breath`);
            } else {
              playPreview(next);
              announceTones(`Tone style: ${label}`);
            }
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
        {on ? ' A new style begins with the next breath.' : ' (Choosing a style plays a short taste, even with the tones off.)'}
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
  // The person's volume reaches the audio from here, which is on every page that can play the tones (BreathTonesQuickControls and
  // BreathToneVolume only change the setting). The mute is held in breathTones.ts and is not saved.
  const volume = useBreathingToneVolume();
  useEffect(() => setToneVolume(volume), [volume]);
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
    // Leaving the page (including into the back/forward cache) ends the sound too.
    window.addEventListener('pagehide', end);
    begin();
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', end);
      end();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, active]);
  return null;
}
