import { useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { PlainEnglish } from './PlainEnglish';

// What a person sees after pressing Decline (docs/terms-first-entry-scope.md): a popout inside the Terms panel, with no address of its own. Nothing here is counted, sent
// or stored by our code: no request, no event, no cookie, no device memory, not even "declined". Closing the tab is the exit. The words are honest about the host: it keeps
// ordinary connection logs, as every host does, so this never claims "no tracking at all".
// Escape does not mean agree: it closes the popout and returns to the Terms, where nothing has been agreed.
export function DeclinePopout({ onReadTerms, onReadFullTerms }: { onReadTerms: () => void; onReadFullTerms: () => void }) {
  const first = useRef<HTMLHeadingElement>(null);
  useEffect(() => { first.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onReadTerms(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onReadTerms]);
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="decline-title" className="fixed inset-0 z-[1000] flex items-center justify-center bg-background/95 p-4">
      <div className="max-h-full w-full max-w-2xl space-y-6 overflow-auto rounded-lg border border-border bg-background p-6">
        <h2 id="decline-title" ref={first} tabIndex={-1} className="text-2xl">You have not agreed, and that is fine.</h2>
        <p>We do not count or keep anything about you here. Our web host keeps ordinary connection logs, as any website&rsquo;s host does. You can close this tab now, or read on.</p>
        <PlainEnglish headingLevel={3} />
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={onReadFullTerms}>Read the full Terms</Button>
          <Button onClick={onReadTerms}>Read the Terms again</Button>
        </div>
      </div>
    </div>
  );
}
