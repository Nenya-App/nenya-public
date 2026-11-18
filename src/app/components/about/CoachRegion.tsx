import { ArrowLeft } from 'lucide-react';
import { REGION_REASON } from '../../../lib/coachService';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { IpExplainer } from '../../../coach/IpExplainer';

import { L } from '../../../lib/vocabulary';
// Where the coach demo is open, and why (src/lib/coachRegion.ts), with the same explanation of IP addresses that a visitor sees when it is closed.
const PLACES = 'the 50 states, Washington, D.C., Puerto Rico, Guam, the U.S. Virgin Islands, American Samoa, the Northern Mariana Islands and the U.S. Minor Outlying Islands';

export default function CoachRegion({ onBack, onOpenTerms }: { onBack: () => void; onOpenTerms?: () => void }) {
  return (
    <div className="size-full overflow-auto scroll-container bg-background">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="size-4" aria-hidden="true" /> Back
        </Button>
        <h1 className="text-3xl">Where the Coach Is Open</h1>
        <Card className="space-y-6 p-6 leading-relaxed">
          <p>
            For now, the coach demo is open only to connections our host places in the United States: {PLACES}. Everything
            else on Nenya works everywhere and sends nothing: the breathing tool, the six {L('gateways')}, and the report you can
            make from them.
          </p>

          <div className="space-y-3">
            <h2 className="text-lg">Why</h2>
            <p>
              {REGION_REASON}
            </p>
            <p>
              We are exploring a coach that runs on your own device, with nothing sent to an outside AI service. If that
              works, it could open everywhere. It is not built yet.
            </p>
          </div>

          <IpExplainer />

          <p className="text-sm text-muted-foreground">
            The Terms describe this in Section 13 (what our host sees) and Section 15 (the coach demo).
            {onOpenTerms && (
              <>
                {' '}
                <button type="button" onClick={onOpenTerms} className="underline underline-offset-2">
                  Read the Terms
                </button>
                .
              </>
            )}
          </p>
        </Card>
      </div>
    </div>
  );
}
