interface HexagonCodeDisplayProps {
  color1: string;
  color2: string;
  color1Name?: string;
  color2Name?: string;
  size?: number;
  showLabels?: boolean;
}

export function HexagonCodeDisplay({ 
  color1, 
  color2, 
  color1Name, 
  color2Name,
  size = 40,
  showLabels = true 
}: HexagonCodeDisplayProps) {
  return (
    <div className="flex items-center gap-1">
      {/* First circle */}
      <div className="flex flex-col items-center gap-1">
        <div
          className="rounded-full border-2 border-background shadow-lg transition-transform hover:scale-110"
          style={{ 
            backgroundColor: color1,
            width: size,
            height: size
          }}
        />
        {showLabels && (
          <span className="text-xs text-muted-foreground">
            {color1Name || color1.toUpperCase()}
          </span>
        )}
      </div>

      {/* Arrow */}
      <div className="text-muted-foreground">→</div>

      {/* Second circle */}
      <div className="flex flex-col items-center gap-1">
        <div
          className="rounded-full border-2 border-background shadow-lg transition-transform hover:scale-110"
          style={{ 
            backgroundColor: color2,
            width: size,
            height: size
          }}
        />
        {showLabels && (
          <span className="text-xs text-muted-foreground">
            {color2Name || color2.toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}
