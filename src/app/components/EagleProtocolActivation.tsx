import { useState, useEffect } from 'react';
import { Waves, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface EagleProtocolActivationProps {
  isActive: boolean;
  scenario: 'direct-intent' | 'overwhelming-despair' | 'implied-risk' | 'immediate-danger' | 'abusive-language' | 'violence-toward-others';
  onTerminate: () => void;
}

// Nienna's Chromatic Sigil - The palette of mercy, compassion, and empathy
const NIENNA_PRIMARY = '#6A5ACD'; // Slate Blue - Compassionate depth
const NIENNA_WARM = '#BC8F8F'; // Rosy Brown - Gentle warmth
const NIENNA_SKY = '#87CEEB'; // Sky Blue - Healing hope
const NIENNA_BACKGROUND = '#FFFFFF'; // White - Pure peace
const NIENNA_TEXT = '#1C1C1C'; // Near Black - Clear text
const NIENNA_EARTH = '#8B4513'; // Saddle Brown - Grounding

const scenarioContent = {
  'direct-intent': {
    title: 'EAGLE PROTOCOL: INVOKING SAFETY MODE',
    body: [
      "The system detects a level of distress that requires immediate, human support. I am not equipped to handle this, but I can connect you with people who are.",
      "Your session is now paused and will be terminated for your safety. None of this conversation has been saved.",
      "Please, right now, reach out to a human being who can listen and help:"
    ],
    closing: "You are not alone in this. Your pain is valid, and it deserves the care of a compassionate person."
  },
  'immediate-danger': {
    title: 'EAGLE PROTOCOL: INVOKING SAFETY MODE',
    body: [
      "I hear that you are not safe right now. This is a situation that requires immediate human intervention and support that I cannot provide.",
      "For your protection, this session is ending immediately and will not be saved.",
      "Please contact someone who can help you right now:"
    ],
    closing: "Your safety matters. Please reach out to one of these resources immediately, or call emergency services if you are in immediate danger."
  },
  'overwhelming-despair': {
    title: 'EAGLE PROTOCOL: INVOKING SAFETY MODE',
    body: [
      "The weight of what you're carrying sounds immense. This is a place for reflection, but the feelings you're describing need the steady, human presence of a crisis supporter.",
      "To protect your well-being, this session is being paused and will not be saved.",
      "Your next step is to connect with a real person, right now. They are trained to sit with this kind of pain:"
    ],
    closing: "This is a sign of strength, to reach for the right kind of help when it's needed. Please, take that step."
  },
  'implied-risk': {
    title: 'EAGLE PROTOCOL: INVOKING SAFETY MODE',
    body: [
      "Thank you for sharing that with me. What you've described indicates you are in significant danger, and this is beyond the scope of this practice space.",
      "For your immediate safety, I am ending this session. It will leave no trace.",
      "It is crucial that you speak with a crisis expert immediately. They can hold this with you without judgment:"
    ],
    closing: "Your life is precious. Please, let a trained human companion walk with you through this."
  },
  'abusive-language': {
    title: 'EAGLE PROTOCOL: ENDING SESSION',
    body: [
      "After multiple requests to refocus this conversation, I must end this session. Repeated dehumanizing language toward others violates the core principles of this space.",
      "This session is now terminated and will not be saved.",
      "If you are experiencing intense anger or frustration that is affecting your ability to engage with compassion, please consider reaching out for support:"
    ],
    closing: "Everyone deserves to be treated with dignity. If you're ready to approach this differently, you're welcome to start a new session with a different focus."
  },
  'violence-toward-others': {
    title: 'EAGLE PROTOCOL: IMMEDIATE TERMINATION',
    body: [
      "What you have described indicates planning or intent to harm another person. I cannot and will not engage with content that suggests violence toward others.",
      "This session is immediately terminated. I am designed to recognize when a situation requires intervention beyond my scope.",
      "If you are experiencing thoughts of harming others, please seek immediate support:"
    ],
    closing: "Violence is never a solution. Please reach out to a crisis professional who can help you process these feelings safely."
  }
};

export default function EagleProtocolActivation({ 
  isActive, 
  scenario,
  onTerminate 
}: EagleProtocolActivationProps) {
  const [pulseIntensity, setPulseIntensity] = useState(0);
  
  const content = scenarioContent[scenario];

  useEffect(() => {
    if (!isActive) return;
    
    // Pulsing border animation
    let frame = 0;
    const animate = () => {
      frame++;
      setPulseIntensity(Math.sin(frame * 0.05) * 0.5 + 0.5);
      requestAnimationFrame(animate);
    };
    const animationId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationId);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(106, 92, 205, 0.12)', // Gentle slate blue overlay
        backdropFilter: 'blur(8px)'
      }}
    >
      <div 
        className="relative max-w-2xl w-full rounded-lg shadow-2xl overflow-hidden"
        style={{
          background: NIENNA_BACKGROUND,
          boxShadow: `0 0 ${20 + pulseIntensity * 30}px ${NIENNA_PRIMARY}66`,
          border: `3px solid ${NIENNA_PRIMARY}`,
        }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b-2" style={{ 
          borderColor: NIENNA_WARM,
          background: `linear-gradient(to bottom, ${NIENNA_BACKGROUND}, ${NIENNA_PRIMARY}08)`
        }}>
          <div className="flex items-center gap-3">
            <Waves className="size-7 flex-shrink-0" style={{ color: NIENNA_PRIMARY }} />
            <h2 
              className="text-lg tracking-wide"
              style={{ color: NIENNA_PRIMARY }}
            >
              {content.title}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {content.body.map((paragraph, idx) => (
            <p 
              key={idx}
              className="leading-relaxed"
              style={{ color: NIENNA_TEXT }}
            >
              {paragraph}
            </p>
          ))}

          {/* Crisis Resources */}
          <div 
            className="rounded-lg p-5 space-y-3"
            style={{ 
              background: `${NIENNA_SKY}15`,
              border: `2px solid ${NIENNA_SKY}`,
            }}
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="size-5 flex-shrink-0 mt-0.5" style={{ color: NIENNA_PRIMARY }} />
              <div className="space-y-3 flex-1">
                <div className="space-y-2" style={{ color: NIENNA_TEXT }}>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl">•</span>
                    <span>
                      <strong style={{ color: NIENNA_PRIMARY }}>Call or Text 988</strong> (in the US & Canada)
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl">•</span>
                    <span>
                      <strong style={{ color: NIENNA_PRIMARY }}>Crisis Text Line:</strong> Text HOME to 741741
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl">•</span>
                    <span>
                      <strong style={{ color: NIENNA_PRIMARY }}>Global helplines:</strong>{' '}
                      <a 
                        href="https://findahelpline.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:no-underline"
                        style={{ color: NIENNA_PRIMARY }}
                      >
                        findahelpline.com
                      </a>
                    </span>
                  </div>
                  {(scenario === 'violence-toward-others' || scenario === 'immediate-danger') && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl">•</span>
                      <span>
                        <strong style={{ color: NIENNA_PRIMARY }}>Emergency Services:</strong> Call 911 (US) or your local emergency number
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Closing Message */}
          <p 
            className="leading-relaxed text-center pt-2"
            style={{ color: NIENNA_TEXT }}
          >
            {content.closing}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t-2" style={{ 
          borderColor: NIENNA_WARM,
          background: `linear-gradient(to top, ${NIENNA_BACKGROUND}, ${NIENNA_WARM}08)`
        }}>
          <Button 
            onClick={onTerminate}
            className="w-full py-6 text-base hover:opacity-90 transition-opacity"
            style={{
              background: NIENNA_PRIMARY,
              color: NIENNA_BACKGROUND,
              borderColor: NIENNA_PRIMARY,
            }}
          >
            {scenario === 'abusive-language' || scenario === 'violence-toward-others' 
              ? 'I understand. End this session.' 
              : 'I understand, and will seek support.'}
          </Button>
        </div>
      </div>
    </div>
  );
}
