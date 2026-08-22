import { useEffect, useState } from 'react';
import NenyaLogo from './NenyaLogo';

interface EagleProtocolTerminalProps {
  isActive: boolean;
}

export default function EagleProtocolTerminal({ isActive }: EagleProtocolTerminalProps) {
  const [pulseScale, setPulseScale] = useState(1);

  useEffect(() => {
    if (!isActive) return;
    
    // Pulsing logo animation
    let frame = 0;
    const animate = () => {
      frame++;
      // Gentle breathing pulse
      setPulseScale(1 + Math.sin(frame * 0.03) * 0.08);
      requestAnimationFrame(animate);
    };
    const animationId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationId);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {/* Pulsing Logo */}
      <div 
        className="transition-transform duration-300 mb-8"
        style={{
          transform: `scale(${pulseScale})`,
        }}
      >
        <NenyaLogo size={120} />
      </div>

      {/* Message */}
      <p className="text-center text-muted-foreground max-w-md px-6 leading-relaxed">
        Your well-being is what matters most.
      </p>
    </div>
  );
}
