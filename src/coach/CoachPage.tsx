import { useState } from 'react';
import InterfaceColorSelection from '../app/components/pages/InterfaceColorSelection';
import CoachDemo from './CoachDemo';

// The standalone /coach address: pick your two colors first (the same step the
// site uses before its session screen), then the conversation.
export default function CoachPage() {
  const [colors, setColors] = useState<{ color1: string; color2: string } | null>(null);

  if (!colors) {
    return (
      <InterfaceColorSelection
        onComplete={(c) => setColors({ color1: c.color1, color2: c.color2 })}
        onBack={() => {
          window.location.href = '/';
        }}
      />
    );
  }
  return <CoachDemo colors={colors} onBack={() => setColors(null)} />;
}
