import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { IpExplainer } from '../../../coach/IpExplainer';

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
            else on Nenya works everywhere and sends nothing: the breathing tool, the six gateways, and the report you can
            make from them.
          </p>

          <div className="space-y-3">
            <h2 className="text-lg">Why</h2>
            <p>
              The coach&rsquo;s replies are written by an AI model that Venice AI runs for us. Venice AI&rsquo;s terms say its
              service is intended for people located in the United States, and our own terms promise to respect theirs.
              So, until there is another way to run the coach, it stays closed elsewhere.
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
