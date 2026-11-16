// Which service runs the coach's model, as the PAGES say it (the server's own setting is COACH_PROVIDER, src/lib/coachProvider.ts). Build-time, like the other
// switches: VITE_COACH_PROVIDER=workers-ai on the same site and build as COACH_PROVIDER=workers-ai. Venice unless set. Only the wording that names the service
// and what it does with the words changes; the Terms and the site's pre-written answers follow the same switch (docs/drafts/terms-workers-ai-draft.md).

export const onWorkersAi = (): boolean => import.meta.env?.VITE_COACH_PROVIDER === 'workers-ai';

export const COACH_SERVICE = onWorkersAi()
  ? {
      name: 'Cloudflare',
      /** "…to <service>, which writes the replies" */
      runs: 'Cloudflare’s Workers AI service, which runs the model that writes the replies',
      termsUrl: 'https://www.cloudflare.com/website-terms/',
      privacyUrl: 'https://www.cloudflare.com/privacypolicy/',
    }
  : {
      name: 'Venice AI',
      runs: 'Venice AI, which writes the replies',
      termsUrl: 'https://venice.ai/legal/tos',
      privacyUrl: 'https://venice.ai/legal/privacy-policy',
    };

/** Why the coach is US-only, in a clause that follows "…people located in the United States" style sentences. */
export const REGION_REASON = onWorkersAi()
  ? 'For now the coach is open only in the United States, while we work out what offering it elsewhere would require.'
  : 'Venice AI, which runs the model, says its service is intended for people located in the United States. Our own terms promise to respect theirs, so until we have a way to offer the coach elsewhere, it is closed outside the US.';
