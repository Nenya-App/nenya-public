import { useState } from 'react';
import { Download } from 'lucide-react';

// The PDF builder (and jsPDF behind it) is only fetched when this is
// clicked, so it adds nothing to the initial load.
export function DownloadLegalPdfButton({ className = '' }: { className?: string }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    try {
      const { downloadLegalPdf } = await import('../../lib/legalPdf');
      await downloadLegalPdf();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={`inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors disabled:opacity-60 ${className}`}
    >
      <Download className="size-3.5" />
      {busy ? 'Preparing PDF…' : failed ? 'Download failed, try again' : 'Download as PDF'}
    </button>
  );
}
