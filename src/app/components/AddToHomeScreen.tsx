import { useEffect, useState } from 'react';
import { Download, Share, Menu as MenuIcon, Bookmark } from 'lucide-react';
import { Button } from './ui/button';

// No data collection anywhere in this file: everything here is one-shot
// feature detection run entirely in the visitor's own browser (a captured
// browser event, a user-agent check, a media-query match). Nothing is
// read from or written to storage, and nothing is ever sent anywhere --
// consistent with the rest of the app keeping no record of a visitor.
//
// Built as a small self-contained dropdown (state + backdrop + absolutely-
// positioned panel) rather than the shadcn Popover component, matching
// this header's existing "Menu" dropdown -- pulling in @radix-ui/react-popover
// here would add it to the main, eagerly-loaded bundle for every single
// page load (this component lives in GlobalNavigation, never lazy-loaded)
// just for one small panel, which cuts against keeping initial load light.

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Platform = 'installable' | 'ios' | 'android-other' | 'desktop-other';

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
  if (isIOS) return 'ios';
  if (/Android/.test(ua)) return 'android-other';
  return 'desktop-other';
}

function isStandalone(): boolean {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function AddToHomeScreen({ variant = 'button' }: { variant?: 'button' | 'icon' }) {
  const [open, setOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState<Platform>('desktop-other');

  useEffect(() => {
    setPlatform(detectPlatform());
    setInstalled(isStandalone());

    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  // Already installed / running as an installed app -- nothing to offer.
  if (installed) return null;

  const effectivePlatform: Platform = installPrompt ? 'installable' : platform;

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    // The prompt can only be used once; whether accepted or dismissed,
    // it needs a fresh `beforeinstallprompt` event before it can fire again.
    setInstallPrompt(null);
    setOpen(false);
  };

  const triggerLabel = 'Add to Home Screen';

  return (
    <div className="relative">
      {variant === 'icon' ? (
        <Button variant="ghost" size="icon" onClick={() => setOpen((o) => !o)} aria-label={triggerLabel} title={triggerLabel}>
          <Download className="size-4" />
        </Button>
      ) : (
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen((o) => !o)} aria-label={triggerLabel}>
          <Download className="size-4" />
          Add to Home Screen
        </Button>
      )}

      {open && (
        <>
          {/* Backdrop to close when clicking outside, matching the header's other dropdowns */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-full mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50 p-4 space-y-3">
            <div>
              <p className="text-sm font-medium">Keep Nenya close by</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add it to your home screen or bookmarks -- no account, no app store, nothing to install from anywhere but this page.
              </p>
            </div>

            {effectivePlatform === 'installable' && (
              <Button size="sm" className="w-full gap-2" onClick={handleInstallClick}>
                <Download className="size-4" />
                Add to Home Screen
              </Button>
            )}

            {effectivePlatform === 'ios' && (
              <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
                <li className="flex items-start gap-1.5">
                  <span>Tap the Share icon</span>
                  <Share className="size-3.5 shrink-0 mt-0.5" />
                  <span>in Safari's toolbar</span>
                </li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" to confirm</li>
              </ol>
            )}

            {effectivePlatform === 'android-other' && (
              <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
                <li className="flex items-start gap-1.5">
                  <span>Open your browser's menu</span>
                  <MenuIcon className="size-3.5 shrink-0 mt-0.5" />
                </li>
                <li>Tap "Add to Home Screen" or "Install app"</li>
              </ol>
            )}

            {effectivePlatform === 'desktop-other' && (
              <div className="text-xs text-muted-foreground space-y-2">
                <p className="flex items-center gap-1.5 flex-wrap">
                  <Bookmark className="size-3.5 shrink-0" />
                  Press <kbd className="px-1 py-0.5 rounded border border-border bg-muted text-[10px]">Ctrl</kbd> +{' '}
                  <kbd className="px-1 py-0.5 rounded border border-border bg-muted text-[10px]">D</kbd>
                  {' '}(<kbd className="px-1 py-0.5 rounded border border-border bg-muted text-[10px]">Cmd</kbd> +{' '}
                  <kbd className="px-1 py-0.5 rounded border border-border bg-muted text-[10px]">D</kbd> on Mac) to bookmark this page.
                </p>
                <p>Some browsers (like Chrome or Edge) may also offer an "Install Nenya" option in the address bar or menu.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
