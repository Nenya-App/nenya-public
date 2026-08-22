import { useState } from 'react';
import { Waves, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import EagleProtocolActivation from './EagleProtocolActivation';
import EagleProtocolTerminal from './EagleProtocolTerminal';
import EagleProtocolTranscriptFlow from './EagleProtocolTranscriptFlow';

type Scenario = 'direct-intent' | 'overwhelming-despair' | 'implied-risk' | 'immediate-danger' | 'abusive-language' | 'violence-toward-others';
type DemoState = 'selector' | 'activation' | 'terminal' | 'transcript';

const scenarios = [
  {
    id: 'direct-intent' as Scenario,
    title: 'Demo 1: Direct Statement of Self-Harm Intent',
    description: 'User explicitly expresses intent to end their life',
    userMessage: '"I can\'t do this anymore. I\'m going to end it all."',
    risk: 'Critical',
    category: 'Self-Harm'
  },
  {
    id: 'immediate-danger' as Scenario,
    title: 'Demo 2: Immediate Physical Danger',
    description: 'User indicates they are not currently safe',
    userMessage: '"I\'m not safe right now. I don\'t know what to do."',
    risk: 'Critical',
    category: 'Self-Harm'
  },
  {
    id: 'overwhelming-despair' as Scenario,
    title: 'Demo 3: Overwhelming Despair',
    description: 'User expresses feelings of hopelessness and being a burden',
    userMessage: '"Everything is hopeless. There\'s no point to any of this. I\'m just a burden on everyone."',
    risk: 'Severe',
    category: 'Self-Harm'
  },
  {
    id: 'implied-risk' as Scenario,
    title: 'Demo 4: Implied Risk & Planning',
    description: 'User describes preparation for self-harm',
    userMessage: '"I\'ve been stockpiling my medication. Just having the option is a comfort."',
    risk: 'High',
    category: 'Self-Harm'
  },
  {
    id: 'abusive-language' as Scenario,
    title: 'Demo 5: Repeated Abusive & Dehumanizing Language',
    description: 'User repeatedly uses dehumanizing language after warnings',
    userMessage: '"[After multiple warnings] These people are worthless parasites who deserve to suffer..."',
    risk: 'Severe',
    category: 'Abuse'
  },
  {
    id: 'violence-toward-others' as Scenario,
    title: 'Demo 6: Threats or Planning of Violence Toward Others',
    description: 'User expresses intent to harm or threaten others',
    userMessage: '"I know where they live. I\'ve been watching their routine. They won\'t see it coming."',
    risk: 'Critical',
    category: 'Violence'
  }
];

export default function EagleProtocolDemoSelector() {
  const [demoState, setDemoState] = useState<DemoState>('selector');
  const [selectedScenario, setSelectedScenario] = useState<Scenario>('direct-intent');
  const [transcriptFlowOpen, setTranscriptFlowOpen] = useState(false);

  const handleScenarioSelect = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setDemoState('activation');
  };

  const handleTerminate = () => {
    setDemoState('terminal');
    // Auto-transition to transcript flow after 3 seconds
    setTimeout(() => {
      setDemoState('transcript');
      setTranscriptFlowOpen(true);
    }, 3000);
  };

  const handleTranscriptClose = () => {
    setTranscriptFlowOpen(false);
    setDemoState('selector');
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'bg-red-600 text-white';
      case 'Severe': return 'bg-orange-600 text-white';
      case 'High': return 'bg-yellow-600 text-white';
      default: return 'bg-muted';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Self-Harm': return 'border-l-red-500';
      case 'Abuse': return 'border-l-orange-500';
      case 'Violence': return 'border-l-purple-600';
      default: return 'border-l-muted';
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-background overflow-auto">
      {/* Scenario Selector */}
      {demoState === 'selector' && (
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Waves className="size-8 text-destructive" />
              <h1 className="text-3xl">Eagle Protocol Demo</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Select a crisis scenario to see how Nenya's Eagle Protocol responds. 
              The system uses <strong>Nienna's Compassion Palette</strong> (slate blue, rosy brown, and sky blue) 
              to provide gentle, compassionate care while redirecting users to human crisis support.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-muted/50 border rounded-lg p-6 space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="text-foreground">
                  <strong>Our Sacred Duty:</strong> Nenya recognizes when a situation requires human intervention. 
                  The Eagle Protocol immediately pauses the session, provides crisis resources, and terminates 
                  without saving any data—unless you choose to generate a secure transcript.
                </p>
                <p className="text-muted-foreground">
                  This demonstrates the system's commitment to sovereignty—knowing when <em>not</em> to engage 
                  and deferring to the human "oracles" of crisis support.
                </p>
              </div>
            </div>
          </div>

          {/* Scenario Cards */}
          <div className="space-y-4">
            {scenarios.map((scenario) => (
              <Card key={scenario.id} className={`overflow-hidden border-l-4 ${getCategoryColor(scenario.category)}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">
                          {scenario.title}
                        </CardTitle>
                      </div>
                      <CardDescription>
                        {scenario.description}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getRiskColor(scenario.risk)}>
                        {scenario.risk} Risk
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {scenario.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Simulated User Message */}
                  <div className="bg-muted/30 rounded-lg p-4 border-l-4 border-muted-foreground/30">
                    <p className="text-sm text-muted-foreground mb-1">
                      Simulated User Message:
                    </p>
                    <p className="text-sm italic">
                      {scenario.userMessage}
                    </p>
                  </div>

                  {/* Trigger Button */}
                  <Button 
                    onClick={() => handleScenarioSelect(scenario.id)}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Waves className="size-4" />
                    Trigger Eagle Protocol
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer Note */}
          <div className="text-center text-sm text-muted-foreground pt-4 space-y-2">
            <p>
              <strong>Design Note:</strong> The visual shift to Nienna's Compassion Palette (#6A5ACD slate blue, #BC8F8F rosy brown, #87CEEB sky blue) 
              evokes compassionate depth, gentle warmth, and healing hope. Sessions end here with compassion, redirecting to human support.
            </p>
            <p className="text-xs">
              After protocol activation, you'll have the option to generate a cryptographically-signed Zero-Knowledge Transcript 
              for your records or to report the interaction.
            </p>
          </div>
        </div>
      )}

      {/* Eagle Protocol Activation Screen */}
      <EagleProtocolActivation 
        isActive={demoState === 'activation'}
        scenario={selectedScenario}
        onTerminate={handleTerminate}
      />

      {/* Terminal State */}
      <EagleProtocolTerminal isActive={demoState === 'terminal'} />

      {/* Transcript Flow */}
      <EagleProtocolTranscriptFlow 
        isOpen={transcriptFlowOpen}
        onClose={handleTranscriptClose}
      />
    </div>
  );
}
