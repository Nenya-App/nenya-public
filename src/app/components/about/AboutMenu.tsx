import { ArrowLeft, Sparkles, Palette, MessageSquare, Shield, Building2, FileText, Users, Network, Play, Heart, Scroll, Eye, Waves, Crown, Hexagon, User, MessageCircle, Mail, Wind } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';
import nenyaLogo from 'figma:asset/97ae39e7ed6444a186091920628ca9206a54a124.png';
import { AppFooter } from '../AppFooter';

interface AboutMenuProps {
  onBack: () => void;
  onRestartDemo?: () => void;
  onNavigateToSection: (section: string) => void;
}

export default function AboutMenu({ onBack, onRestartDemo, onNavigateToSection }: AboutMenuProps) {
  const menuItems = [
    {
      id: 'mellonamin',
      title: 'Mellonamin: Welcome Letter',
      description: 'The philosophy and practice behind Nenya',
      icon: Scroll,
    },
    {
      id: 'about-founder',
      title: 'About the Designer',
      description: 'Estëlle\'s journey from lived experience to necessary alchemy',
      icon: User,
    },
    {
      id: 'contact-us',
      title: 'Contact Us',
      description: 'Get in touch for inquiries, partnerships, and support',
      icon: Mail,
    },
    {
      id: 'evolved-leader',
      title: 'Evolved Leadership',
      description: 'The co-evolutionary imperative and the trillion-dollar case for intervention',
      icon: Users,
    },
    {
      id: 'bio-social-design',
      title: 'Our Bio-Social Design',
      description: 'Built on evolutionary biology and social neuroscience',
      icon: Network,
    },
    {
      id: 'name-philosophy',
      title: 'Our Name & Philosophy',
      description: 'The meaning of "Nenya" and our Anti-Palantír vision',
      icon: Sparkles,
    },
    {
      id: 'power-of-color',
      title: 'The Power of Color',
      description: 'Why we use color-based identity instead of usernames',
      icon: Palette,
    },
    {
      id: 'six-gateways',
      title: 'The Six Gateways',
      description: 'Multi-sensory pathways to emotional intelligence',
      icon: Eye,
    },
    {
      id: 'breathing-tool',
      title: 'About the Breathing Tool',
      description: 'The resonance breathing technique behind the pulsing logo',
      icon: Wind,
    },
    {
      id: 'pantheon-of-needs',
      title: 'The Pantheon of Needs',
      description: 'Re-sanctifying your inner world through mythic archetypes',
      icon: Crown,
    },
    {
      id: 'nvc-method',
      title: 'Our NVC+ Method',
      description: 'Nonviolent Communication with systemic context',
      icon: MessageSquare,
    },
    {
      id: 'privacy-promise',
      title: 'Our Privacy Promise',
      description: 'Rejecting surveillance capitalism',
      icon: Shield,
    },
    {
      id: 'pii-scrubbing',
      title: 'PII Scrubbing Tutorial',
      description: 'Interactive demo of automatic privacy protection',
      icon: Shield,
    },
    {
      id: 'eagle-protocol',
      title: 'Eagle Protocol Demo',
      description: 'Interactive demo of our crisis safety system',
      icon: Waves,
    },
    {
      id: 'venice-chat',
      title: 'AI Chat Demo (Venice)',
      description: 'External AI conversation partner (not fully integrated)',
      icon: MessageCircle,
    },
    {
      id: 'structure',
      title: 'Our Structure',
      description: 'Mission-locked for the public good',
      icon: Building2,
    },
    {
      id: 'support-us',
      title: 'Support Us',
      description: 'Support free, non-extractive contemplative technology — fiscally sponsored by Fractured Atlas',
      icon: Heart,
    },
    {
      id: 'terms',
      title: 'Terms of Use',
      description: 'Key principles and agreements',
      icon: FileText,
    },
  ];

  return (
    <div className="flex size-full flex-col bg-background relative">
      {/* Watermark Logo Background */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.015] z-0"
        style={{
          backgroundImage: `url(${nenyaLogo})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '50%',
        }}
      />
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 md:px-6 py-3 md:py-4 relative z-10 flex-wrap gap-2">
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="shrink-0"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-base md:text-2xl">About Nenya</h1>
        </div>
        <div className="flex items-center gap-2">
          {onRestartDemo && (
            <Button
              variant="outline"
              onClick={onRestartDemo}
              className="gap-2 border-nenya-accent-primary/40 hover:border-nenya-accent-warm hover:bg-nenya-accent-warm/10 hover:text-nenya-accent-warm text-sm md:text-base"
              size="sm"
            >
              <Play className="size-3 md:size-4" />
              <span className="hidden sm:inline">Start Demo</span>
              <span className="sm:hidden">Demo</span>
            </Button>
          )}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="flex-1 overflow-auto p-6 relative z-10 scroll-container">
        <div className="mx-auto max-w-3xl grid gap-4 sm:grid-cols-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.id}
                className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
                onClick={() => onNavigateToSection(item.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Icon className="size-5 text-primary shrink-0" />
                    <span>{item.title}</span>
                  </CardTitle>
                  <CardDescription className="pt-2">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <AppFooter />
      </div>
    </div>
  );
}