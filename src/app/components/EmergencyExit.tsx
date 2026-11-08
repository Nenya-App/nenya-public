import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, ArrowUpRight, X, Info } from 'lucide-react';
import { Button } from './ui/button';
import { leaveNow } from '../../lib/emergencyExit';

interface EmergencyExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeaving?: () => void;
}

// Earthy emergency exit color - brown-orange-red
const EMERGENCY_COLOR = '#B85C3C'; // Earthy terracotta/rust color
const EMERGENCY_YELLOW = '#FFDB58';

// Nienna's Chromatic Sigil - The palette of mercy, compassion, and empathy
const NIENNA_PRIMARY = '#6A5ACD'; // Slate Blue - Compassionate depth
const NIENNA_WARM = '#BC8F8F'; // Rosy Brown - Gentle warmth

function EmergencyExitModal({ isOpen, onClose, onLeaving }: EmergencyExitModalProps) {

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

  const handleProceed = () => leaveNow(onLeaving);

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
                  Emergency Exit
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
              <strong>What happens:</strong>
            </p>
            <p className="text-xs leading-relaxed">
              Your session is purged, anything Nenya saved on this device is erased, and you are redirected instantly.
              Nothing is kept for you to come back to, so if you want a copy of a coach conversation, download it
              before you leave.
            </p>
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
                <strong className="text-foreground">9-8-8 Suicide Crisis Helpline:</strong>
                <div className="text-muted-foreground">Call or text 9-8-8 (Canada)</div>
              </div>
              <div>
                <strong className="text-foreground">Kids Help Phone:</strong>
                <div className="text-muted-foreground">Call 1-800-668-6868 or text CONNECT to 686868 (Canada)</div>
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
                <strong className="text-foreground">Other countries:</strong>
                <div className="text-muted-foreground">findahelpline.com or iasp.info/resources/Crisis_Centres</div>
              </div>
            </div>
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

        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

interface EmergencyExitButtonProps {
  variant?: 'header' | 'footer';
  className?: string;
  onEmergencyExit?: () => void;
}

export function EmergencyExitButton({ 
  variant = 'header', 
  className = '',
  onEmergencyExit
}: EmergencyExitButtonProps) {
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  const isHeader = variant === 'header';

  const handleEmergencyExit = () => leaveNow(onEmergencyExit);

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
        onLeaving={onEmergencyExit}
      />
    </div>
  );
}

// A copy of the Exit button pinned to the top corner, above every overlay. The header's own button is out of reach while
// the loading screen, the first-visit panel (rhythm choice and terms), the tour offer or the tour is up, so the page
// shows this one in those moments. It comes first in the page so that keyboard and screen-reader users meet it first.
export function EmergencyExitDock({ show, onEmergencyExit }: { show: boolean; onEmergencyExit?: () => void }) {
  if (!show) return null;
  return (
    <div
      className="fixed right-2 z-[300]"
      style={{ top: 'calc(0.5rem + env(safe-area-inset-top))' }}
      role="region"
      aria-label="Emergency exit"
    >
      <EmergencyExitButton variant="header" onEmergencyExit={onEmergencyExit} />
    </div>
  );
}
