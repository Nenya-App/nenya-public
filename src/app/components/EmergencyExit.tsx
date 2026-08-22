import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, ArrowUpRight, X, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface EmergencyExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInitiateEagleProtocol?: () => void;
}

// Earthy emergency exit color - brown-orange-red
const EMERGENCY_COLOR = '#B85C3C'; // Earthy terracotta/rust color
const EMERGENCY_YELLOW = '#FFDB58';

// Nienna's Chromatic Sigil - The palette of mercy, compassion, and empathy
const NIENNA_PRIMARY = '#6A5ACD'; // Slate Blue - Compassionate depth
const NIENNA_WARM = '#BC8F8F'; // Rosy Brown - Gentle warmth

function EmergencyExitModal({ isOpen, onClose, onInitiateEagleProtocol }: EmergencyExitModalProps) {
  const [passcode, setPasscode] = useState('');
  const [passcodeSaved, setPasscodeSaved] = useState(false);

  // Handle Escape key and prevent body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    // Prevent background scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  const handleProceed = () => {
    // Save passcode to sessionStorage if provided
    if (passcode.trim()) {
      try {
        sessionStorage.setItem('nenya_emergency_restore_key', passcode);
        setPasscodeSaved(true);
      } catch (e) {
        console.error('Failed to save passcode to sessionStorage', e);
      }
    }

    // Initiate Eagle Protocol (cryptographic transcript preparation in background)
    if (onInitiateEagleProtocol) {
      onInitiateEagleProtocol();
    }

    // Clear all visible history
    try {
      localStorage.removeItem('nenya_session_data');
      sessionStorage.clear();
    } catch (e) {
      console.error('Failed to clear session data', e);
    }

    // Redirect immediately to Wikipedia - Rings of Power (Nenya) article
    // Using replace() instead of href to prevent back button navigation
    window.location.replace('https://en.wikipedia.org/wiki/Rings_of_Power#Nenya');
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      {/* Dark overlay */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal box */}
      <div 
        className="relative z-10 bg-background-elevated border-2 rounded-2xl shadow-2xl max-w-md w-full my-auto overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{
          borderColor: NIENNA_PRIMARY,
          maxHeight: 'calc(100vh - 2rem)'
        }}
      >
        {/* Scrollable content wrapper */}
        <div className="overflow-y-auto scroll-smooth p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 flex-1">
                <div className="relative flex-shrink-0">
                  <AlertTriangle className="size-5 sm:size-6" style={{ color: '#CC0000' }} />
                  <ArrowUpRight className="size-3 absolute -top-1 -right-1" style={{ color: '#FFDB58' }} />
                </div>
                <h2 className="text-base sm:text-lg" style={{ color: NIENNA_PRIMARY }}>
                  Eagle Protocol: Emergency Exit
                </h2>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1 hover:bg-muted rounded-full transition-colors"
                aria-label="Close dialog"
              >
                <X className="size-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          </div>

          {/* Body text */}
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            This action will <strong className="text-foreground">instantly close the application</strong> and redirect your browser to Wikipedia (Rings of Power article).
          </p>
          
          <div 
            className="rounded-lg p-3 sm:p-4 space-y-2 border-2"
            style={{
              background: `${NIENNA_PRIMARY}08`,
              borderColor: `${NIENNA_PRIMARY}40`
            }}
          >
            <p className="text-foreground text-xs sm:text-sm">
              <strong>Dual-Purpose Safety Feature:</strong>
            </p>
            <ul className="space-y-1 ml-3 sm:ml-4 list-disc text-xs">
              <li><strong>Phase 1 (Immediate):</strong> Your session is purged and you are redirected instantly</li>
              <li><strong>Phase 2 (Background):</strong> A cryptographically-signed transcript is prepared on-device for optional reporting when you return</li>
            </ul>
          </div>

          <div 
            className="rounded-lg p-3 sm:p-4 space-y-2 border"
            style={{
              background: `${NIENNA_WARM}08`,
              borderColor: `${NIENNA_WARM}60`
            }}
          >
            <p className="text-foreground text-xs">
              <strong>Interface Disguise Feature:</strong>
            </p>
            <p className="text-xs leading-relaxed">
              In the full version, this would completely close the app and require pre-authorization permissions to either open a browser or simulate a browser as a 'decoy' page. The app can be disguised to appear as something innocuous like a text messaging interface, word processing document, or notes app—whatever you've configured for your interface disguise mode.
            </p>
          </div>

            <p>
              <strong style={{ color: NIENNA_WARM }}>Optional:</strong> To access the prepared report later, enter your unique Passcode below. This saves an encrypted restoration key to local cache only.
            </p>
          </div>

          {/* Emergency Contact Information */}
          <div 
            className="rounded-lg p-3 sm:p-4 space-y-3 border-2"
            style={{
              background: '#CC000008',
              borderColor: '#CC000030'
            }}
          >
            <p className="text-foreground text-xs sm:text-sm">
              <strong>Crisis Support Resources:</strong>
            </p>
            <div className="space-y-2 text-xs">
              <div>
                <strong className="text-foreground">National Suicide Prevention Lifeline:</strong>
                <div className="text-muted-foreground">Call or text 988 (US)</div>
              </div>
              <div>
                <strong className="text-foreground">Crisis Text Line:</strong>
                <div className="text-muted-foreground">Text HOME to 741741 (US)</div>
              </div>
              <div>
                <strong className="text-foreground">National Domestic Violence Hotline:</strong>
                <div className="text-muted-foreground">Call 1-800-799-7233 (US)</div>
              </div>
              <div>
                <strong className="text-foreground">International Association for Suicide Prevention:</strong>
                <div className="text-muted-foreground">iasp.info/resources/Crisis_Centres</div>
              </div>
            </div>
          </div>

          {/* Passcode input */}
          <div className="space-y-2">
            <Label htmlFor="emergency-passcode">
              Session Passcode (Hex Code/Personal Key)
            </Label>
            <Input
              id="emergency-passcode"
              type="text"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Optional: Enter your hex code or personal key"
              className="bg-input-background"
            />
            <p className="text-xs text-muted-foreground">
              This is a demo text entry field for your personal restoration key
            </p>
            {passcodeSaved && (
              <p className="text-xs" style={{ color: NIENNA_PRIMARY }}>
                ✓ Passcode Secured
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={handleProceed}
              className="w-full font-semibold hover:opacity-90"
              style={{
                background: '#CC0000',
                color: '#FFDB58',
                borderColor: '#CC0000'
              }}
              size="lg"
            >
              <ArrowUpRight className="size-4 mr-2" />
              EMERGENCY EXIT NOW
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Cancel / Return to Reflection
            </Button>
          </div>

          {/* Additional context */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              <strong style={{ color: NIENNA_PRIMARY }}>The Eagle Protocol:</strong> Named after the Eagles of Manwë who serve as divine intervention ("deus ex machina") in Tolkien's mythology, this feature provides both immediate safety escape and verified accountability mechanisms. Part of Nenya's comprehensive interface disguise system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

interface EmergencyExitButtonProps {
  variant?: 'header' | 'footer';
  className?: string;
  onInitiateEagleProtocol?: () => void;
  onEmergencyExit?: () => void;
}

export function EmergencyExitButton({ 
  variant = 'header', 
  className = '',
  onInitiateEagleProtocol,
  onEmergencyExit
}: EmergencyExitButtonProps) {
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  const isHeader = variant === 'header';

  const handleEmergencyExit = () => {
    // Notify parent that emergency exit is happening (to disable beforeunload warning)
    if (onEmergencyExit) {
      onEmergencyExit();
    }
    
    // Clear all visible history
    try {
      localStorage.removeItem('nenya_session_data');
      sessionStorage.clear();
    } catch (e) {
      console.error('Failed to clear session data', e);
    }

    // Redirect immediately to Wikipedia - Rings of Power (Nenya) article
    // Using replace() instead of href to prevent back button navigation
    window.location.replace('https://en.wikipedia.org/wiki/Rings_of_Power#Nenya');
  };

  return (
    <div className="flex items-center gap-1.5">
      <Button
        onClick={handleEmergencyExit}
        className={`
          ${isHeader ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
          font-semibold rounded-full
          border shadow-sm hover:shadow-md
          transition-all duration-200
          ${className}
        `}
        style={{
          background: EMERGENCY_COLOR,
          color: EMERGENCY_YELLOW,
          borderColor: EMERGENCY_COLOR
        }}
        aria-label="Emergency exit - Instant redirect to Wikipedia"
      >
        <ArrowUpRight className={`${isHeader ? 'size-3' : 'size-4'} mr-1.5`} />
        {isHeader ? 'Exit' : 'Emergency Exit'}
      </Button>

      <Button
        onClick={() => setInfoModalOpen(true)}
        className={`
          ${isHeader ? 'p-1 size-6' : 'p-1.5 size-7'}
          rounded-full
          border shadow-sm hover:shadow-md
          transition-all duration-200
        `}
        style={{
          background: EMERGENCY_COLOR,
          color: EMERGENCY_YELLOW,
          borderColor: EMERGENCY_COLOR
        }}
        aria-label="Emergency exit information"
      >
        <Info className={`${isHeader ? 'size-3' : 'size-4'}`} />
      </Button>

      <EmergencyExitModal 
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        onInitiateEagleProtocol={onInitiateEagleProtocol}
      />
    </div>
  );
}