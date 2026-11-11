// Agreeing to the Terms, as the page does it: ask the site to sign a terms receipt (src/lib/termsReceipt.ts, via /api/terms-agree), then hold it for the visit (deviceMemory.ts). If the site cannot sign (offline, or
// no signing key), the agreement is still held as an unsigned note on this device for the visit, and nothing signed will say the person agreed. Nothing here sends an address or an identifier.
import { holdTermsRecord, getTermsRecord } from './deviceMemory.ts';
import { LEGAL_EFFECTIVE_DATE } from './legalDocument.ts';

/** Records the agreement for the visit. Returns once it is held; the signing request never blocks the page for long. */
export async function agreeToTerms(fetchImpl: typeof fetch = fetch): Promise<void> {
  holdTermsRecord({ terms: LEGAL_EFFECTIVE_DATE, at: new Date().toISOString() }); // held at once, so a reload does not ask again
  try {
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), 6000) : null;
    const res = await fetchImpl('/api/terms-agree', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}', cache: 'no-store', ...(ctrl ? { signal: ctrl.signal } : {}) });
    if (timer) clearTimeout(timer);
    if (!res.ok) return;
    const j = (await res.json()) as { receipt?: { terms?: string } };
    if (j.receipt && j.receipt.terms === LEGAL_EFFECTIVE_DATE) holdTermsRecord({ terms: LEGAL_EFFECTIVE_DATE, at: new Date().toISOString(), receipt: j.receipt });
  } catch {
    /* no signed receipt this time; the unsigned note stands */
  }
}

/** The signed receipt to send with a request that will sign something, or undefined. */
export const termsReceiptForRequest = (): unknown => getTermsRecord()?.receipt;
