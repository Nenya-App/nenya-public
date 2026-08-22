import NenyaLogo from './NenyaLogo';
import { EmergencyExitButton } from './EmergencyExit';

interface AppFooterProps {
  onNavigateToAbout?: () => void;
  className?: string;
}

export function AppFooter({ className = '' }: AppFooterProps) {
  return (
    <footer className={`border-t border-border bg-background/95 backdrop-blur-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Emergency Exit Button (Left) */}
          <div className="flex items-center order-1 md:order-1">
            <EmergencyExitButton variant="footer" />
          </div>

          {/* Logo and tagline (Center on mobile, Left on desktop after exit button) */}
          <div className="flex items-center gap-3 order-2 md:order-2">
            <NenyaLogo size={32} />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Nenya</span>
              <span className="text-xs text-muted-foreground">A mirror for your inner world</span>
            </div>
          </div>

          {/* Copyright (Right) */}
          <div className="text-xs text-muted-foreground text-center md:text-right order-3 md:order-3">
            <p>© 2025 Nenya Project</p>
            <p>Public infrastructure for emotional literacy</p>
          </div>
        </div>

        {/* Open source + hosting attribution */}
        <div className="mt-4 pt-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-muted-foreground">
          <a
            href="https://github.com/Nenya-App/nenya-public"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors underline underline-offset-2"
          >
            Open source on GitHub (AGPL-3.0)
          </a>
          <a href="https://www.netlify.com" target="_blank" rel="noopener noreferrer" aria-label="Deploys by Netlify">
            <img src="/badges/netlify-badge.svg" alt="Deploys by Netlify" width="76" height="33" />
          </a>
        </div>
      </div>
    </footer>
  );
}
