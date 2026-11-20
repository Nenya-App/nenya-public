// The humanity check for the coach (Cloudflare Turnstile), on the page's side. The server's side is src/lib/turnstileCheck.ts.
//
// Off unless the build has VITE_TURNSTILE_SITE_KEY. When on, Cloudflare's script is loaded only on the coach, only before
// the first message, and the widget is removed once the conversation has begun (later messages are bound by the ticket).
// In "interaction-only" appearance it stays out of sight unless Cloudflare needs the person to tick a box.
// Nothing about the check is kept on this device.

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { TURNSTILE_ACTION } from '../lib/turnstileCheck';

const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const WAIT_MS = 30_000;

interface TurnstileApi {
  render: (el: HTMLElement, options: Record<string, unknown>) => string | undefined;
  reset: (id: string) => void;
  remove: (id: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export const turnstileSiteKey = (): string => (import.meta.env?.VITE_TURNSTILE_SITE_KEY ?? '').trim();

let loading: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SCRIPT;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => {
      loading = null;
      s.remove();
      reject(new Error('turnstile-script'));
    };
    document.head.appendChild(s);
  });
  return loading;
}

export type HumanCheckState = 'off' | 'loading' | 'ready' | 'error';

export interface HumanCheck {
  /** Where the widget goes. Keep <div ref={box} /> rendered (it stays empty while the check is off). */
  box: RefObject<HTMLDivElement | null>;
  state: HumanCheckState;
  /** A single-use token for the first message, or null (no check on this build, or none came in time: the server decides). */
  take: () => Promise<string | null>;
  /** After a first message was sent (whatever the answer), so a retry gets a fresh token. */
  reset: () => void;
}

export function useHumanCheck(active: boolean, action: string = TURNSTILE_ACTION): HumanCheck {
  const siteKey = turnstileSiteKey();
  const enabled = active && siteKey !== '';
  const box = useRef<HTMLDivElement | null>(null);
  const widget = useRef<string | null>(null);
  const token = useRef<string | null>(null);
  const waiters = useRef<Array<(t: string | null) => void>>([]);
  const [state, setState] = useState<HumanCheckState>('off');

  const flush = (t: string | null) => {
    const w = waiters.current;
    waiters.current = [];
    w.forEach((f) => f(t));
  };

  useEffect(() => {
    if (!enabled) {
      setState('off');
      return;
    }
    let gone = false;
    setState('loading');
    loadScript()
      .then(() => {
        if (gone || !box.current || !window.turnstile) return;
        widget.current =
          window.turnstile.render(box.current, {
            sitekey: siteKey,
            action,
            appearance: 'interaction-only',
            'refresh-expired': 'auto',
            callback: (t: string) => {
              token.current = t;
              setState('ready');
              flush(t);
            },
            'expired-callback': () => {
              token.current = null;
            },
            'error-callback': () => {
              token.current = null;
              setState('error');
              flush(null);
            },
          }) ?? null;
      })
      .catch(() => {
        if (gone) return;
        setState('error');
        flush(null);
      });
    return () => {
      gone = true;
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current);
      widget.current = null;
      token.current = null;
      flush(null);
    };
  }, [enabled, siteKey, action]);

  const take = useCallback(async (): Promise<string | null> => {
    if (!enabled) return null;
    const t =
      token.current ??
      (await new Promise<string | null>((resolve) => {
        waiters.current.push(resolve);
        setTimeout(() => resolve(null), WAIT_MS);
      }));
    token.current = null;
    return t;
  }, [enabled]);

  const reset = useCallback(() => {
    token.current = null;
    if (widget.current && window.turnstile) window.turnstile.reset(widget.current);
  }, []);

  return { box, state, take, reset };
}
