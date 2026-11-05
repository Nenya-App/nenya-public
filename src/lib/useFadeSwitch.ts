import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Lets a visual setup change without snapping. While `key` stays the same, `applied` is just the latest value.
 * When `key` changes, the old setup keeps playing while it fades out (outMs), then the new one is applied and
 * fades in (inMs). Put `style` on the thing being faded. With reduced motion the change is immediate.
 */
export function useFadeSwitch<T>(value: T, key: string, outMs = 160, inMs = 260) {
  const [shown, setShown] = useState({ key, value });
  const [opacity, setOpacity] = useState(1);
  const [ms, setMs] = useState(0);
  const latest = useRef({ key, value });
  latest.current = { key, value };
  const pending = key !== shown.key;

  useEffect(() => {
    if (!pending) {
      // Changed back before the fade finished: bring the old setup back.
      setMs(inMs);
      setOpacity(1);
      return;
    }
    if (prefersReducedMotion()) {
      setShown(latest.current);
      return;
    }
    setMs(outMs);
    setOpacity(0);
    const t = setTimeout(() => {
      setShown(latest.current);
      setMs(inMs);
      setOpacity(1);
    }, outMs + 20);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, pending]);

  return {
    applied: pending ? shown.value : value,
    fade: opacity,
    style: { opacity, transition: `opacity ${ms}ms ease` } as React.CSSProperties,
  };
}
