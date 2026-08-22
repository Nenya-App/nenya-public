import { useState, useEffect } from 'react';

export interface BreathingTechnique {
  ih: number;
  hi: number;
  ex: number;
  ho: number;
}

interface Preset extends BreathingTechnique {
  lb: string;
  desc: string;
}

const PRESETS: Preset[] = [
  { ih: 5000, hi: 0, ex: 5000, ho: 0, lb: '5·5', desc: 'Resonance — HRV coherence' },
  { ih: 4000, hi: 0, ex: 6000, ho: 0, lb: '4·6', desc: 'Calming — extended exhale' },
  { ih: 4000, hi: 0, ex: 8000, ho: 0, lb: '4·8', desc: 'Deep calm — sleep onset' },
  { ih: 3000, hi: 0, ex: 3000, ho: 0, lb: '3·3', desc: 'Energising — activation' },
  { ih: 4000, hi: 4000, ex: 4000, ho: 4000, lb: 'Box', desc: 'Box — focus and reset' },
  { ih: 4000, hi: 7000, ex: 8000, ho: 0, lb: '4-7-8', desc: '4-7-8 — anxiety and sleep' },
];

interface BreathingCounterProps {
  enabled: boolean;
  show: boolean;
  ih?: number;
  hi?: number;
  ex?: number;
  ho?: number;
  onTechniqueChange?: (technique: BreathingTechnique) => void;
}

export function BreathingCounter({
  enabled,
  show,
  ih: IH = 5000,
  hi: HI = 0,
  ex: EX = 5000,
  ho: HO = 0,
  onTechniqueChange,
}: BreathingCounterProps) {
  const [count, setCount] = useState(1);
  const [phase, setPhase] = useState<'i' | 'h' | 'e'>('i');

  useEffect(() => {
    if (!enabled || !show) return;
    const start = Date.now();
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
  }, [enabled, show, IH, HI, EX, HO]);

  if (!enabled || !show) return null;

  const isEntryPulse = count === 1;
  const pulseAnim = isEntryPulse ? 'bcd' : 'bcs';
  const phaseLabel = phase === 'i' ? 'inhale' : phase === 'e' ? 'exhale' : 'hold';

  return (
    <div
      style={{
        position: 'fixed',
        top: '8.5rem',
        right: '1rem',
        zIndex: 39,
        background: 'rgba(13,19,33,0.88)',
        border: '1px solid rgba(232,160,32,0.3)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        width: '178px',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '10px 14px 8px' }}>
        <div
          style={{
            fontSize: '8px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(232,160,32,0.45)',
            fontFamily: "'Manrope',sans-serif",
            marginBottom: '4px',
          }}
        >
          breathe
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <div
            key={count + phase}
            style={{
              fontFamily: "'Cinzel',serif",
              fontSize: '2rem',
              fontWeight: 400,
              color: 'rgba(232,160,32,0.92)',
              lineHeight: 1,
              animation: `${pulseAnim} 0.45s ease-out`,
            }}
          >
            {count}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: 'rgba(232,160,32,0.55)',
              fontFamily: "'Manrope',sans-serif",
              letterSpacing: '0.08em',
            }}
          >
            {phaseLabel}
          </div>
        </div>
      </div>
      <div style={{ height: '1px', background: 'rgba(232,160,32,0.12)', margin: '0 14px' }} />
      <div style={{ padding: '6px 0 8px' }}>
        {PRESETS.map((preset) => {
          const active = preset.ih === IH && (preset.hi || 0) === HI && preset.ex === EX && (preset.ho || 0) === HO;
          return (
            <button
              key={preset.lb}
              onClick={() => onTechniqueChange && onTechniqueChange({ ih: preset.ih, hi: preset.hi || 0, ex: preset.ex, ho: preset.ho || 0 })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '5px 14px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                touchAction: 'manipulation',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: active ? 'rgba(232,160,32,0.9)' : 'rgba(232,160,32,0.2)',
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span
                    style={{
                      fontFamily: "'Manrope',sans-serif",
                      fontSize: '11px',
                      color: active ? 'rgba(232,160,32,0.92)' : 'rgba(232,160,32,0.55)',
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {preset.lb}
                  </span>
                  <span style={{ fontSize: '9px', color: 'rgba(232,160,32,0.35)', fontFamily: "'Manrope',sans-serif" }}>
                    {preset.lb === 'Box' ? '4·4·4·4' : preset.lb === '4-7-8' ? 'no hold-out' : ''}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '9px',
                    color: active ? 'rgba(232,160,32,0.5)' : 'rgba(232,160,32,0.3)',
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
    </div>
  );
}
