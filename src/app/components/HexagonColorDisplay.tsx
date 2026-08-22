import { useIsMobile } from './useIsMobile';

interface HexagonColorDisplayProps {
  color1: string;
  color2: string;
  size?: 'sm' | 'md' | 'lg';
  showBorder?: boolean;
  className?: string;
}

export function HexagonColorDisplay({ 
  color1, 
  color2, 
  size = 'md', 
  showBorder = true,
  className = '' 
}: HexagonColorDisplayProps) {
  const isMobile = useIsMobile();
  
  // Circle sizes
  const sizeConfig = {
    sm: { 
      size: isMobile ? 20 : 24
    },
    md: { 
      size: isMobile ? 24 : 32
    },
    lg: { 
      size: isMobile ? 32 : 48
    }
  };
  
  const circleSize = sizeConfig[size].size;
  const borderClass = showBorder ? 'ring-1 ring-nenya-gold/30' : '';

  const CircleShape = ({ color }: { color: string }) => (
    <div
      className={`transition-all duration-200 rounded-full ${borderClass}`}
      style={{
        width: `${circleSize}px`,
        height: `${circleSize}px`,
        backgroundColor: color,
      }}
    />
  );

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <CircleShape color={color1} />
      <CircleShape color={color2} />
    </div>
  );
}

interface HexagonCodeDisplayProps {
  color1: string;
  color2: string;
  color1Name?: string;
  color2Name?: string;
  color1Random?: boolean;
  color2Random?: boolean;
  skippedReflection?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

export function HexagonCodeDisplay({
  color1,
  color2,
  color1Name,
  color2Name,
  color1Random,
  color2Random,
  skippedReflection,
  size = 'md',
  showLabels = true,
  className = ''
}: HexagonCodeDisplayProps) {
  const userHexCode = `${color1}.${color2}`;
  
  return (
    <div className={`flex items-center gap-2 md:gap-3 ${className}`}>
      <HexagonColorDisplay color1={color1} color2={color2} size={size} />
      <div className="flex flex-col items-start">
        <code className="text-sm bg-gradient-to-r from-nenya-gold-dark to-nenya-gold bg-clip-text text-transparent font-semibold">
          {userHexCode}
        </code>
        {showLabels && !skippedReflection && (color1Name || color2Name || color1Random || color2Random) && (
          <span className="text-xs text-muted-foreground">
            {color1Random ? 'Random' : (color1Name || color1)} → {color2Random ? 'Random' : (color2Name || color2)}
          </span>
        )}
        {showLabels && skippedReflection && (
          <span className="text-xs text-muted-foreground italic">
            Random colors
          </span>
        )}
      </div>
    </div>
  );
}