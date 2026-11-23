import { ArrowLeft } from 'lucide-react';
import { REGION_REASON } from '../../../lib/coachService';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { IpExplainer } from '../../../coach/IpExplainer';
import { AboutPageLink } from '../AboutPageLink';
import { ReferenceList, type AboutReference } from './AboutReferences';

const REFS: AboutReference[] = [
  {"n": 1, "text": "Richter P; Wohlfart F; Vallina-Rodriguez N; Allman M; Bush R; Feldmann A; et al. (2016). A Multi-perspective Analysis of Carrier-Grade NAT Deployment. Proceedings of the 2016 Internet Measurement Conference.", "href": "https://doi.org/10.1145/2987443.2987474", "linkLabel": "Free full text"},
  {"n": 2, "text": "Padmanabhan R; Dhamdhere A; Aben E; claffy k; Spring N (2016). Reasons Dynamic Addresses Change. Proceedings of the 2016 Internet Measurement Conference.", "href": "https://doi.org/10.1145/2987443.2987461", "linkLabel": "Publisher page (may need payment)"},
  {"n": 3, "text": "Poese I; Uhlig S; Kaafar M; Donnet B; Gueye B (2011). IP geolocation databases. ACM SIGCOMM Computer Communication Review.", "href": "https://doi.org/10.1145/1971162.1971171", "linkLabel": "Free full text"},
  {"n": 4, "text": "Netlify (2026). Functions API: context object. docs.netlify.com. Read 22 November 2026.", "href": "https://docs.netlify.com/build/functions/api/", "linkLabel": "Web page"},
  {"n": 5, "text": "Komosny D; Voznak M; Ur Rehman S (2017). Location Accuracy of Commercial IP Address Geolocation Databases. Information Technology and Control.", "href": "https://doi.org/10.5755/j01.itc.46.3.14451", "linkLabel": "Free full text"},
  {"n": 6, "text": "Apple (2026). About iCloud Private Relay. support.apple.com. Read 22 November 2026.", "href": "https://support.apple.com/en-us/102602", "linkLabel": "Web page"},
];

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
            else on Nenya works everywhere and does not send what you write. That includes the breathing tool, the six lenses, and the report you can
            make from them. The site counts visits to each part as plain daily totals. A few optional buttons ask an outside service (for example about a colour). The Terms list them.
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

          <IpExplainer cited />

          <p className="text-sm text-muted-foreground">
            The Terms describe this in Section 13 (what our host sees) and Section 15 (the coach demo).
            {onOpenTerms && (
              <>
                {' '}
                <AboutPageLink page="terms" onOpen={onOpenTerms} className="underline underline-offset-2" />
              </>
            )}
          </p>
        </Card>
        <Card className="p-6">
          <ReferenceList pageId="coach-region" items={REFS} />
        </Card>
      </div>
    </div>
  );
}
