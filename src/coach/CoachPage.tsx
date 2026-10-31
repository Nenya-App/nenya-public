import { useState } from 'react';
import SessionKeyPicker from './SessionKeyPicker';
import CoachDemo from './CoachDemo';

// The standalone /coach address: pick your session key (two colors and the
// melody they make) first, then the conversation.
export default function CoachPage() {
  const [colors, setColors] = useState<{ color1: string; color2: string } | null>(null);

  if (!colors) {
    return (
      <SessionKeyPicker
        onComplete={setColors}
        onBack={() => {
          window.location.href = '/';
        }}
      />
    );
  }
  return <CoachDemo colors={colors} onBack={() => setColors(null)} />;
}
