import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Eye, Music, Hand, Droplet, Zap, Lightbulb, Check } from 'lucide-react';
import { Gateway } from '../../App';

interface GatewaysPageProps {
  onGatewaysSelected: (gateways: Gateway[]) => void;
}

const gatewayCards = [
  {
    id: 'sight' as Gateway,
    name: 'Sight',
    icon: Eye,
    description: 'Explore through visual perception',
    tagline: 'What colors speak to your soul?',
  },
  {
    id: 'sound' as Gateway,
    name: 'Sound',
    icon: Music,
    description: 'Journey through auditory awareness',
    tagline: 'What rhythm moves within you?',
  },
  {
    id: 'touch' as Gateway,
    name: 'Touch',
    icon: Hand,
    description: 'Connect through physical sensation',
    tagline: 'What textures ground your being?',
  },
  {
    id: 'essence' as Gateway,
    name: 'Essence',
    icon: Droplet,
    description: 'Sense through scent and taste',
    tagline: 'What aromas awaken your memory?',
  },
  {
    id: 'movement' as Gateway,
    name: 'Movement',
    icon: Zap,
    description: 'Feel through kinesthetic awareness',
    tagline: 'How does your body want to move?',
  },
  {
    id: 'insight' as Gateway,
    name: 'Insight',
    icon: Lightbulb,
    description: 'Understand through inner knowing',
    tagline: 'What wisdom emerges from within?',
  },
];

export default function GatewaysPage({ onGatewaysSelected }: GatewaysPageProps) {
  const [selectedGateways, setSelectedGateways] = useState<Gateway[]>([]);

  const toggleGateway = (gatewayId: Gateway) => {
    if (selectedGateways.includes(gatewayId)) {
      setSelectedGateways(selectedGateways.filter(g => g !== gatewayId));
    } else {
      setSelectedGateways([...selectedGateways, gatewayId]);
    }
  };

  const handleContinue = () => {
    if (selectedGateways.length > 0) {
      onGatewaysSelected(selectedGateways);
    }
  };

  return (
    <div className="size-full flex flex-col overflow-auto scroll-container">
      <div className="flex-1 flex flex-col items-center px-4 sm:px-6 py-8 pt-20 md:pt-24 md:py-12">
        {/* Gateway Selection Section */}
        <div className="w-full max-w-5xl space-y-6 flex-shrink-0">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-2xl md:text-3xl lg:text-4xl">Which Sense Calls to You Today?</h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Choose <span className="text-foreground">one or more gateways</span> to begin your reflection. You can select and complete them in <span className="text-foreground">any order you wish</span>.
            </p>
          </div>

          {/* Gateway Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gatewayCards.map((gateway) => {
              const Icon = gateway.icon;
              const isSelected = selectedGateways.includes(gateway.id);
              
              return (
                <Card
                  key={gateway.id}
                  className={`p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl relative ${
                    isSelected 
                      ? 'border-nenya-accent-warm bg-nenya-accent-warm/10 shadow-lg' 
                      : 'border-border hover:border-nenya-accent-warm/50'
                  } ${
                    gateway.id === 'sight'
                      ? 'shadow-[0_0_20px_rgba(218,198,130,0.4)] dark:shadow-[0_0_25px_rgba(218,198,130,0.3)] border-nenya-gold/30'
                      : ''
                  }`}
                  onClick={() => toggleGateway(gateway.id)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`${gateway.name} gateway: ${gateway.description}. ${isSelected ? 'Selected' : 'Not selected'}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleGateway(gateway.id);
                    }
                  }}
                >
                  {/* Recommended badge for Sight gateway */}
                  {gateway.id === 'sight' && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className="bg-nenya-gold text-background px-2.5 py-1 rounded-full shadow-lg text-xs font-medium">
                        Recommended
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {/* Icon and Selection Indicator */}
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-full ${
                        isSelected 
                          ? 'bg-nenya-accent-warm text-background-elevated' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <Icon className="size-6" />
                      </div>
                      {isSelected && (
                        <div className="bg-nenya-accent-warm text-background-elevated rounded-full p-1">
                          <Check className="size-4" />
                        </div>
                      )}
                    </div>

                    {/* Text Content */}
                    <div className="space-y-2">
                      <h3 className="text-xl">{gateway.name}</h3>
                      <p className="text-sm text-muted-foreground">{gateway.description}</p>
                      <p className="text-sm italic text-nenya-accent-warm">{gateway.tagline}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Continue Button */}
          {selectedGateways.length > 0 && (
            <div className="flex justify-center pt-6">
              <Button 
                size="lg"
                onClick={handleContinue}
                className="gap-2 text-lg px-8 py-6 bg-nenya-accent-warm hover:bg-nenya-accent-secondary text-background-elevated"
              >
                Begin Journey
                {selectedGateways.length > 1 && ` (${selectedGateways.length} gateways)`}
              </Button>
            </div>
          )}
          
          {/* Footer - Mathematical Pathway Information */}
          <div className="mt-12 pt-8 border-t border-border/50 max-w-3xl mx-auto">
            <div className="space-y-4 text-center">
              <p className="text-base md:text-lg text-foreground">
                <span className="text-nenya-accent-warm">There are more potential pathways through Nenya than there are atoms in the observable universe.</span>
              </p>
              <p className="text-sm md:text-base text-muted-foreground">
                With 6.55 × 10¹⁰⁸ unique pathways through all six gateways, each journey is statistically unique. This isn't hyperbole — it's combinatorial mathematics ensuring that your privacy and sovereignty are protected not by policy, but by mathematical necessity.
              </p>
              <p className="text-sm md:text-base text-muted-foreground italic">
                Even choosing between gateways creates 720 unique orderings of the full sequence. This flexibility is a deliberate design choice: your experience, your sovereignty, your journey.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}