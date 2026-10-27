import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, GripHorizontal, Minus, Square, X } from 'lucide-react';

import { PRESETS, type BreathingTechnique } from '../../lib/breathingPresets';

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
  /** Freezes the count/phase at its current value. Expects the caller to
   *  shift cycleStart forward by the paused duration on resume. */
  paused?: boolean;
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
  paused = false,
  minimized = false,
  onMinimizedChange,
}: BreathingCounterProps) {
  const [count, setCount] = useState(1);
  const [phase, setPhase] = useState<'i' | 'h' | 'e'>('i');
  // Fully collapsed: just the word "breathe", no numbers or pattern list.
  // Plain view state, so it resets whenever the counter remounts.
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!enabled || !show || paused) return;
    const start = cycleStart ?? Date.now();
    const interval = setInterval(() => {
      const cycle = IH + HI + EX + HO;
      const d = (Date.now() - start) % cycle;
      const ph: 'i' | 'h' | 'e' = d < IH ? 'i' : d < IH + HI ? 'h' : d < IH + HI + EX ? 'e' : 'h';
      const cn =
        ph === 'i'
          ? Math.floor(d / 1000)
          : ph === 'e'
          ? Math.round(EX / 1000) - Math.floor((d - IH - HI) / 1000) - 1
          : d < IH + HI
          ? Math.floor((d - IH) / 1000)
          : Math.floor((d - IH - HI - EX) / 1000);
      setCount(cn);
      setPhase(ph);
    }, 80);
    return () => clearInterval(interval);
  }, [enabled, show, IH, HI, EX, HO, cycleStart, paused]);

  if (!enabled || !show) return null;

  const isEntryPulse = count === 1;
  const pulseAnim = isEntryPulse ? 'bcd' : 'bcs';
  const phaseLabel = phase === 'i' ? 'inhale' : phase === 'e' ? 'exhale' : 'hold';

  return (
    <motion.div
      id={id}
      drag
      dragMomentum={false}
      dragElastic={0.06}
      whileDrag={{ scale: 1.03, boxShadow: '0 8px 32px rgba(0,0,0,0.55)' }}
      style={{
        position: 'fixed',
        top: 'calc(8.5rem + env(safe-area-inset-top))',
        right: '1rem',
        zIndex: 39,
        background: 'rgba(13,19,33,0.92)',
        border: '1px solid rgba(232,160,32,0.35)',
        borderRadius: '14px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        width: collapsed ? '132px' : '212px',
        overflow: 'hidden',
      }}
    >
      {/* Drag handle, with the minimize/maximize toggle in the corner */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          padding: '4px 0 0',
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
              top: '2px',
              left: '4px',
              padding: '3px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              color: 'rgba(232,160,32,0.55)',
            }}
          >
            <X size={13} />
          </button>
        )}
        {!collapsed && onMinimizedChange && (
          <button
            onClick={() => onMinimizedChange(!minimized)}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label={minimized ? 'Maximize breathing counter' : 'Minimize breathing counter'}
            title={minimized ? 'Maximize' : 'Minimize'}
            style={{
              position: 'absolute',
              top: '2px',
              right: '4px',
              padding: '3px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              color: 'rgba(232,160,32,0.55)',
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
            color: 'rgba(232,160,32,0.7)',
            fontFamily: "'Manrope',sans-serif",
          }}
        >
          breathe
          <ChevronDown size={12} />
        </button>
      ) : (
      <div style={{ padding: '4px 16px 10px' }}>
        <div
          style={{
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(232,160,32,0.55)',
            fontFamily: "'Manrope',sans-serif",
            marginBottom: '5px',
          }}
        >
          breathe
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <div
            key={count + phase}
            style={{
              fontFamily: "'Cinzel',serif",
              fontSize: '2.75rem',
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
              fontSize: '14px',
              color: 'rgba(232,160,32,0.7)',
              fontFamily: "'Manrope',sans-serif",
              letterSpacing: '0.08em',
            }}
          >
            {phaseLabel}
          </div>
        </div>
      </div>
      )}
      {!collapsed && !minimized && (
        <>
          <div style={{ height: '1px', background: 'rgba(232,160,32,0.14)', margin: '0 16px' }} />
          <div style={{ padding: '6px 0 10px' }}>
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
                  <span style={{ fontSize: '10px', color: 'rgba(232,160,32,0.4)', fontFamily: "'Manrope',sans-serif" }}>
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
          </div>
        </>
      )}
    </motion.div>
  );
}
