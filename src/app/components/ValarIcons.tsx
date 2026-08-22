import { useTheme } from './ThemeProvider';

interface ValarIconProps {
  name: string;
  size?: number;
  className?: string;
}

export function ValarIcon({ name, size = 64, className = '' }: ValarIconProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Theme-aware colors
  const lineColor = isDark ? '#F0F0F0' : '#1A1A1A';
  const highlightGold = isDark ? '#FFD580' : '#C89D5A';
  const highlightBlue = isDark ? '#8ACBFF' : '#4A90E2';
  const highlightGreen = isDark ? '#B2FFB2' : '#3CB371';
  
  const icons: Record<string, JSX.Element> = {
    'Manwë': (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Twin spirals forming sky vortex */}
        <circle cx="32" cy="32" r="28" stroke={lineColor} strokeWidth="1.5" opacity="0.3" />
        <path d="M32 8 Q38 16 32 24 Q26 32 32 40 Q38 48 32 56" stroke={highlightBlue} strokeWidth="2" fill="none" />
        <path d="M32 8 Q26 16 32 24 Q38 32 32 40 Q26 48 32 56" stroke={highlightBlue} strokeWidth="2" fill="none" />
        <circle cx="32" cy="32" r="3" fill={highlightGold} />
      </svg>
    ),
    'Varda': (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Seven-pointed star with radiance */}
        <circle cx="32" cy="32" r="28" stroke={lineColor} strokeWidth="1.5" opacity="0.2" />
        <path d="M32 8 L34 24 L48 18 L36 28 L50 36 L36 36 L40 50 L32 38 L24 50 L28 36 L14 36 L28 28 L16 18 L30 24 Z" fill={highlightGold} stroke={lineColor} strokeWidth="1" />
        {[0, 51.4, 102.8, 154.2, 205.6, 257, 308.4].map((angle, i) => (
          <line key={i} x1="32" y1="32" x2={32 + Math.cos(angle * Math.PI / 180) * 25} y2={32 + Math.sin(angle * Math.PI / 180) * 25} stroke={highlightGold} strokeWidth="0.5" opacity="0.6" />
        ))}
      </svg>
    ),
    'Ulmo': (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Wave spiral forming an ear */}
        <circle cx="32" cy="32" r="28" stroke={lineColor} strokeWidth="1.5" opacity="0.3" />
        <path d="M10 32 Q16 24 22 32 Q28 40 34 32 Q40 24 46 32 Q52 40 58 32" stroke={highlightBlue} strokeWidth="2.5" fill="none" />
        <path d="M12 36 Q18 30 24 36 Q30 42 36 36 Q42 30 48 36 Q54 42 60 36" stroke={highlightBlue} strokeWidth="2" fill="none" opacity="0.6" />
        <circle cx="32" cy="32" r="4" fill="none" stroke={highlightBlue} strokeWidth="2" />
      </svg>
    ),
    'Aulë': (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Hammer striking anvil with sparks */}
        <circle cx="32" cy="32" r="28" stroke={lineColor} strokeWidth="1.5" opacity="0.3" />
        <rect x="20" y="36" width="24" height="8" fill={lineColor} stroke={lineColor} strokeWidth="1.5" />
        <path d="M24 24 L28 20 L36 20 L40 24 L36 32 L28 32 Z" fill={highlightGold} stroke={lineColor} strokeWidth="1.5" />
        {[16, 24, 32, 40, 48].map((x, i) => (
          <circle key={i} cx={x} cy={16 + (i % 2) * 4} r="1.5" fill={highlightGold} />
        ))}
      </svg>
    ),
    'Yavanna': (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Leaf with geometric veins */}
        <circle cx="32" cy="32" r="28" stroke={lineColor} strokeWidth="1.5" opacity="0.3" />
        <path d="M32 12 Q44 20 44 32 Q44 44 32 52 Q20 44 20 32 Q20 20 32 12 Z" fill="none" stroke={highlightGreen} strokeWidth="2" />
        <line x1="32" y1="12" x2="32" y2="52" stroke={highlightGold} strokeWidth="1.5" />
        {[18, 24, 30, 36, 42].map((y, i) => (
          <line key={i} x1="32" y1={y} x2={26 + i * 2} y2={y + 4} stroke={highlightGreen} strokeWidth="1" />
        ))}
        {[18, 24, 30, 36, 42].map((y, i) => (
          <line key={i} x1="32" y1={y} x2={38 - i * 2} y2={y + 4} stroke={highlightGreen} strokeWidth="1" />
        ))}
      </svg>
    ),
    'Nienna': (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Teardrop transforming into lotus */}
        <circle cx="32" cy="32" r="28" stroke={lineColor} strokeWidth="1.5" opacity="0.3" />
        <ellipse cx="32" cy="28" rx="8" ry="12" fill="none" stroke="#C8A2C8" strokeWidth="2" />
        <path d="M24 40 Q26 36 32 36 Q38 36 40 40" fill="none" stroke="#E6E6FA" strokeWidth="2" />
        <path d="M20 44 Q24 40 32 40 Q40 40 44 44" fill="none" stroke="#E6E6FA" strokeWidth="1.5" />
        <path d="M18 48 Q24 44 32 44 Q40 44 46 48" fill="none" stroke="#E6E6FA" strokeWidth="1" />
      </svg>
    ),
    'Oromë': (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Horn with crescent moon and arrowhead */}
        <circle cx="32" cy="32" r="28" stroke={lineColor} strokeWidth="1.5" opacity="0.3" />
        <path d="M20 40 Q24 36 28 32 Q32 28 36 24" stroke={highlightGold} strokeWidth="2.5" fill="none" />
        <path d="M36 24 L32 20 L38 18" fill={highlightGold} stroke={highlightGold} strokeWidth="1" />
        <path d="M42 32 Q44 28 44 24 Q44 20 42 16" stroke={highlightGreen} strokeWidth="2" fill="none" />
      </svg>
    ),
    'Vána': (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Spiraling flower petals / rising sun */}
        <circle cx="32" cy="32" r="28" stroke={lineColor} strokeWidth="1.5" opacity="0.3" />
        <circle cx="32" cy="32" r="6" fill="#FFB6C1" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const x = 32 + Math.cos(angle * Math.PI / 180) * 16;
          const y = 32 + Math.sin(angle * Math.PI / 180) * 16;
          return <ellipse key={i} cx={x} cy={y} rx="4" ry="8" fill="#FFB6C1" opacity="0.8" transform={`rotate(${angle} ${x} ${y})`} />;
        })}
      </svg>
    ),
    'Tulkas': (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Two interlocked gauntlets forming sunburst */}
        <circle cx="32" cy="32" r="28" stroke={lineColor} strokeWidth="1.5" opacity="0.3" />
        <rect x="20" y="28" width="10" height="12" rx="2" fill={highlightGold} stroke={lineColor} strokeWidth="1.5" />
        <rect x="34" y="28" width="10" height="12" rx="2" fill={highlightGold} stroke={lineColor} strokeWidth="1.5" />
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const x1 = 32 + Math.cos(angle * Math.PI / 180) * 10;
          const y1 = 32 + Math.sin(angle * Math.PI / 180) * 10;
          const x2 = 32 + Math.cos(angle * Math.PI / 180) * 22;
          const y2 = 32 + Math.sin(angle * Math.PI / 180) * 22;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={highlightGold} strokeWidth="2" />;
        })}
      </svg>
    ),
    'Námo (Mandos)': (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Hourglass within circle of runes */}
        <circle cx="32" cy="32" r="28" stroke={lineColor} strokeWidth="1.5" opacity="0.3" />
        <path d="M24 16 L40 16 L32 32 L40 48 L24 48 L32 32 Z" fill="none" stroke="#4B0082" strokeWidth="2" />
        <line x1="24" y1="16" x2="40" y2="16" stroke="#4B0082" strokeWidth="2" />
        <line x1="24" y1="48" x2="40" y2="48" stroke="#4B0082" strokeWidth="2" />
        {[0, 90, 180, 270].map((angle, i) => {
          const x = 32 + Math.cos(angle * Math.PI / 180) * 26;
          const y = 32 + Math.sin(angle * Math.PI / 180) * 26;
          return <text key={i} x={x} y={y} fontSize="8" fill={lineColor} textAnchor="middle">᚛</text>;
        })}
      </svg>
    ),
    'Irmo': (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Crescent within mist spiral / open eye */}
        <circle cx="32" cy="32" r="28" stroke={lineColor} strokeWidth="1.5" opacity="0.3" />
        <ellipse cx="32" cy="32" rx="18" ry="10" fill="none" stroke="#BA55D3" strokeWidth="2" />
        <circle cx="32" cy="32" r="6" fill="#483D8B" />
        <circle cx="32" cy="32" r="3" fill="#AFEEEE" />
        <path d="M14 32 Q18 28 22 32" stroke="#BA55D3" strokeWidth="1.5" fill="none" opacity="0.6" />
        <path d="M42 32 Q46 28 50 32" stroke="#BA55D3" strokeWidth="1.5" fill="none" opacity="0.6" />
      </svg>
    ),
    'Estë': (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Folded wings enclosing single spark */}
        <circle cx="32" cy="32" r="28" stroke={lineColor} strokeWidth="1.5" opacity="0.3" />
        <path d="M32 16 Q20 24 16 32 Q20 40 32 48" fill="none" stroke="#B0C4C4" strokeWidth="2" />
        <path d="M32 16 Q44 24 48 32 Q44 40 32 48" fill="none" stroke="#B0C4C4" strokeWidth="2" />
        <circle cx="32" cy="32" r="4" fill="#EED5D2" />
        <circle cx="32" cy="32" r="2" fill={highlightGold} />
      </svg>
    ),
    'Vairë': (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Interlocking threads forming Möbius knot */}
        <circle cx="32" cy="32" r="28" stroke={lineColor} strokeWidth="1.5" opacity="0.3" />
        <path d="M20 24 Q26 20 32 24 Q38 28 44 24 Q50 20 56 24" stroke={highlightGold} strokeWidth="2" fill="none" />
        <path d="M20 32 Q26 36 32 32 Q38 28 44 32 Q50 36 56 32" stroke="#C0C0C0" strokeWidth="2" fill="none" />
        <path d="M20 40 Q26 36 32 40 Q38 44 44 40 Q50 36 56 40" stroke="#9932CC" strokeWidth="2" fill="none" />
      </svg>
    ),
    'Melkor': (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Fractured crown breaking symmetry */}
        <circle cx="32" cy="32" r="28" stroke={lineColor} strokeWidth="1.5" opacity="0.3" />
        <path d="M16 36 L20 24 L24 32 L28 20 L32 28 L36 22 L40 32 L44 26 L48 36" stroke="#FF4500" strokeWidth="2" fill="none" />
        <line x1="20" y1="24" x2="18" y2="20" stroke="#FF4500" strokeWidth="2" />
        <line x1="28" y1="20" x2="28" y2="16" stroke="#FF4500" strokeWidth="2" />
        <line x1="36" y1="22" x2="38" y2="18" stroke="#FF4500" strokeWidth="2" />
        <line x1="44" y1="26" x2="46" y2="22" stroke="#FF4500" strokeWidth="2" />
        <line x1="24" y1="36" x2="26" y2="42" stroke="#CC0000" strokeWidth="1.5" opacity="0.8" />
        <line x1="40" y1="36" x2="38" y2="42" stroke="#CC0000" strokeWidth="1.5" opacity="0.8" />
      </svg>
    ),
    'Morgoth': (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Inverted sigil engulfed in shadow */}
        <circle cx="32" cy="32" r="28" stroke={lineColor} strokeWidth="1.5" opacity="0.3" />
        <path d="M48 28 L44 40 L40 32 L36 44 L32 36 L28 42 L24 32 L20 38 L16 28" stroke="#1E1E2A" strokeWidth="2.5" fill="none" />
        <path d="M48 28 L44 40 L40 32 L36 44 L32 36 L28 42 L24 32 L20 38 L16 28" stroke="#5C5C78" strokeWidth="1.5" fill="none" />
        {[22, 30, 38, 46].map((x, i) => (
          <circle key={i} cx={x} cy={44 - i * 2} r="1.5" fill="#8585A0" opacity="0.6" />
        ))}
      </svg>
    ),
    'Nessa': (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Dancing spiral motion */}
        <circle cx="32" cy="32" r="28" stroke={lineColor} strokeWidth="1.5" opacity="0.3" />
        <path d="M32 12 Q44 20 40 32 Q36 44 32 52 Q28 44 24 32 Q20 20 32 12" fill="none" stroke="#FFBF00" strokeWidth="2" />
        <circle cx="32" cy="20" r="3" fill="#FF6F61" />
        <circle cx="38" cy="28" r="3" fill="#F4A460" />
        <circle cx="34" cy="36" r="3" fill="#FF6F61" />
        <circle cx="30" cy="44" r="3" fill="#FFBF00" />
      </svg>
    ),
  };

  return (
    <div className={className} style={{ width: size, height: size }}>
      {icons[name] || icons['Manwë']}
    </div>
  );
}
