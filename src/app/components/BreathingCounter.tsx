import { useState, useEffect, useRef, useCallback } from 'react';
import { breathCounter, breathPhaseProgress } from '../../lib/breathClock';
import * as m from 'motion/react-m';
import { ChevronDown, GripHorizontal, Minus, Square, X } from 'lucide-react';

import { PRESETS, type BreathingTechnique } from '../../lib/breathingPresets';
import { BreathTonesSwitch } from './BreathTonesSwitch';
import { setBreathingPanel } from '../../lib/breathingPanel';

interface BreathingCounterProps {
  enabled: boolean;
  show: boolean;
  ih?: number;
  hi?: number;
  ex?: number;
  ho?: number;
  onTechniqueChange?: (technique: BreathingTechnique) => void;
  id?: string;
  /** Shared clock anchor (ms epoch) so this stays in phase with the
   *  breathing pulse animation instead of timing itself independently. */
  cycleStart?: number;
  /** Controlled: when true, only the drag handle and the counter itself
   *  show -- the technique picker below is hidden. Defaults to false
   *  (maximized) if omitted, since not every caller needs the collapse. */
  minimized?: boolean;
  onMinimizedChange?: (minimized: boolean) => void;
}

export function BreathingCounter({
  enabled,
  show,
  ih: IH = 5000,
  hi: HI = 0,
  ex: EX = 5000,
  ho: HO = 0,
  onTechniqueChange,
  id,
  cycleStart,
  minimized = false,
  onMinimizedChange,
}: BreathingCounterProps) {
  const [count, setCount] = useState(1);
  const [phase, setPhase] = useState<'i' | 'h' | 'e'>('i');
  // How far through the current phase, from the same clock reading as the number.
  const [progress, setProgress] = useState(0);
  // Fully collapsed: just the word "breathe", no numbers or pattern list.
  // Plain view state, so it resets whenever the counter remounts.
  const [collapsed, setCollapsed] = useState(false);
  // Set while the counter is being dragged, so letting go does not count as a click on the circle.
  const dragged = useRef(false);
  // A press inside the list of paces scrolls it and must not drag the whole counter. The drag listens on the element
  // itself, so this has to be a native listener (React's own handlers run too late to stop it).
  const keepPressInList = useCallback((el: HTMLDivElement | null) => {
    el?.addEventListener('pointerdown', (e) => e.stopPropagation());
  }, []);

  useEffect(() => {
    if (!enabled || !show) return;
    const start = cycleStart ?? Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const timing = { ih: IH, hi: HI, ex: EX, ho: HO };
      const { count: cn, phase: ph } = breathCounter(elapsed, timing);
      setCount(cn);
      setPhase(ph);
      setProgress(breathPhaseProgress(elapsed, timing));
    }, 80);
    return () => clearInterval(interval);
  }, [enabled, show, IH, HI, EX, HO, cycleStart]);

  if (!enabled || !show) return null;

  // The stronger pulse marks the very start of a breath (inhale, count 1), not every time the number 1 appears.
  const isEntryPulse = count === 1 && phase === 'i';
  const pulseAnim = isEntryPulse ? 'bcd' : 'bcs';
  const phaseLabel = phase === 'i' ? 'inhale' : phase === 'e' ? 'exhale' : 'hold';

  // A click on the circle itself opens and closes the list of paces (owner, 2026-11-26), the same as the small button in the corner.
  const toggleList = () => {
    if (dragged.current) return;
    if (onMinimizedChange) onMinimizedChange(!minimized);
  };

  return (
    <m.div
      id={id}
      drag
      onDragStart={() => { dragged.current = true; }}
      onPointerDownCapture={() => { dragged.current = false; }}
      dragMomentum={false}
      dragElastic={0.06}
      whileDrag={{ scale: 1.03, boxShadow: '0 8px 32px rgba(0,0,0,0.55)' }}
      style={{
        position: 'fixed',
        // Bottom left by default: the top right sat under the header over the page, bottom right is the quick-navigation
        // buttons and bottom centre is the scroll cue. It can still be dragged anywhere.
        bottom: 'calc(1rem + env(safe-area-inset-bottom))',
        left: '1rem',
        zIndex: 39,
        background: 'rgba(13,19,33,0.92)',
        border: '1px solid rgba(232,160,32,0.35)',
        borderRadius: '14px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        // About three quarters of the earlier size (owner, 2026-11-26); full width only when the list of paces is open.
        width: collapsed ? '112px' : minimized ? '160px' : '212px',
      }}
    >
      {/* Drag handle, with the minimize/maximize toggle in the corner */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          // Open, the row holds three 44px buttons (one left, two right) with the drag handle between them.
          ...(collapsed ? { padding: '4px 0 0' } : { alignItems: 'center', height: '44px', padding: '0 88px 0 44px' }),
          cursor: 'grab',
          touchAction: 'none',
        }}
      >
        <GripHorizontal size={14} color="rgba(232,160,32,0.4)" />
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Collapse breathing counter to just the word breathe"
            title="Collapse"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '44px',
              height: '44px',
              padding: 0,
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              color: 'rgba(232,160,32,0.85)',
            }}
          >
            <X size={13} />
          </button>
        )}
        {!collapsed && <BreathTonesSwitch variant="counter" />}
        {!collapsed && onMinimizedChange && (
          <button
            onClick={() => onMinimizedChange(!minimized)}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label={minimized ? 'Maximize breathing counter' : 'Minimize breathing counter'}
            title={minimized ? 'Maximize' : 'Minimize'}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '44px',
              height: '44px',
              padding: 0,
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              color: 'rgba(232,160,32,0.85)',
            }}
          >
            {minimized ? <Square size={11} /> : <Minus size={13} />}
          </button>
        )}
      </div>
      {collapsed ? (
        <button
          onClick={() => setCollapsed(false)}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Show breathing counter"
          title="Show counter"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            width: '100%',
            padding: '2px 12px 9px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(232,160,32,0.9)',
            fontFamily: "'Manrope',sans-serif",
          }}
        >
          breathe
          <ChevronDown size={12} />
        </button>
      ) : (
      <div
        {...(onMinimizedChange
          ? {
              role: 'button',
              tabIndex: 0,
              'aria-expanded': !minimized,
              'aria-label': minimized ? 'Show the breathing paces' : 'Hide the breathing paces',
              onClick: toggleList,
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  dragged.current = false;
                  toggleList();
                }
              },
            }
          : {})}
        style={{ padding: '2px 12px 8px', cursor: onMinimizedChange ? 'pointer' : undefined }}
      >
        {/* The number and word change every second, so they are hidden from screen readers (which would otherwise meet a
            different number each time they looked); the breathing tones and the controls are what they use instead. */}
        <span className="sr-only">Breathing counter, a circle that shows the count and the phase. Use the breathing tones switch to follow the breath by sound.</span>
        <div aria-hidden="true">
        <div
          style={{
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(232,160,32,0.85)',
            fontFamily: "'Manrope',sans-serif",
            marginBottom: '3px',
          }}
        >
          breathe
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="bc-circle" style={{ position: 'relative', width: '84px', height: '84px' }}>
            {/* The circle: a faint full ring, an arc that fills across the current phase, and a disc behind the number.
                With reduced motion the arc is hidden and the circle, number and word stay. */}
            <svg viewBox="0 0 112 112" width="84" height="84" style={{ position: 'absolute', inset: 0 }}>
              <circle cx="56" cy="56" r="52" fill="rgba(232,160,32,0.08)" stroke="rgba(232,160,32,0.55)" strokeWidth="2" />
              <circle
                className="bc-arc"
                cx="56"
                cy="56"
                r="52"
                fill="none"
                stroke="rgba(232,160,32,0.96)"
                strokeWidth="4"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={100}
                strokeDashoffset={100 - Math.max(0.01, Math.min(1, progress)) * 100}
                transform="rotate(-90 56 56)"
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div
                key={count + phase}
                className="bc-digit"
                style={{
                  fontFamily: "'Cinzel',serif",
                  fontSize: '2.1rem',
                  fontWeight: 400,
                  color: 'rgba(232,160,32,0.96)',
                  lineHeight: 1,
                  animation: `${pulseAnim} 0.45s ease-out`,
                }}
              >
                {count}
              </div>
              <div
                style={{
                  marginTop: '2px',
                  fontSize: '12px',
                  color: 'rgba(232,160,32,0.9)',
                  fontFamily: "'Manrope',sans-serif",
                  letterSpacing: '0.08em',
                }}
              >
                {phaseLabel}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
      )}
      {!collapsed && !minimized && (
        <>
          <div style={{ height: '1px', background: 'rgba(232,160,32,0.14)', margin: '0 16px' }} />
          {/* On a short screen the list scrolls by itself, so the circle and the corner buttons stay in view below the site
              header. 6rem is the header (5rem) and the gap under the counter; 162px is everything above the list. */}
          <div ref={keepPressInList} style={{ padding: '6px 0 10px', maxHeight: 'max(120px, calc(100dvh - 6rem - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 162px))', overflowY: 'auto', touchAction: 'pan-y', cursor: 'auto' }}>
            {PRESETS.map((preset) => {
          const active = preset.ih === IH && (preset.hi || 0) === HI && preset.ex === EX && (preset.ho || 0) === HO;
          return (
            <button
              key={preset.lb}
              onClick={() => onTechniqueChange && onTechniqueChange({ ih: preset.ih, hi: preset.hi || 0, ex: preset.ex, ho: preset.ho || 0 })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '6px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                touchAction: 'manipulation',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: active ? 'rgba(232,160,32,0.95)' : 'rgba(232,160,32,0.25)',
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span
                    style={{
                      fontFamily: "'Manrope',sans-serif",
                      fontSize: '13px',
                      color: active ? 'rgba(232,160,32,0.96)' : 'rgba(232,160,32,0.65)',
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {preset.lb}
                  </span>
                  <span style={{ fontSize: '10px', color: 'rgba(232,160,32,0.75)', fontFamily: "'Manrope',sans-serif" }}>
                    {preset.lb === 'Box' ? '4·4·4·4' : preset.lb === '4-7-8' ? 'no hold-out' : ''}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: active ? 'rgba(232,160,32,0.6)' : 'rgba(232,160,32,0.35)',
                    fontFamily: "'Manrope',sans-serif",
                    lineHeight: 1.3,
                    marginTop: '1px',
                  }}
                >
                  {preset.desc}
                </div>
              </div>
            </button>
              );
            })}
            {!PRESETS.some((p) => p.ih === IH && (p.hi || 0) === HI && p.ex === EX && (p.ho || 0) === HO) && (
              <div style={{ padding: '6px 16px', fontFamily: "'Manrope',sans-serif", fontSize: '13px', color: 'rgba(232,160,32,0.96)', fontWeight: 600 }}>
                Your own pace: {IH / 1000}·{HI / 1000}·{EX / 1000}·{HO / 1000}
              </div>
            )}
            {/* A custom pace is set in the settings panel, near its top; this opens it (owner, 2026-11-26). */}
            <button
              type="button"
              onClick={() => {
                if (onMinimizedChange) onMinimizedChange(true);
                setBreathingPanel(true);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              style={{
                display: 'block',
                width: '100%',
                minHeight: '44px',
                padding: '6px 16px',
                background: 'none',
                border: 'none',
                borderTop: '1px solid rgba(232,160,32,0.14)',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: "'Manrope',sans-serif",
              }}
            >
              <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgba(232,160,32,0.96)', textDecoration: 'underline' }}>Set Custom</span>
              <span style={{ display: 'block', fontSize: '12px', color: 'rgba(232,160,32,0.9)', lineHeight: 1.4 }}>Opens the settings panel. Your own pace is near the top.</span>
            </button>
          </div>
        </>
      )}
    </m.div>
  );
}
