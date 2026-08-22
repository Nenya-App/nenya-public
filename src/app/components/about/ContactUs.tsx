import React from 'react';
import { ArrowLeft, Mail, MessageSquare, HelpCircle, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import NenyaLogo from '../NenyaLogo';
import { BloomInstant, BloomOnScroll } from '../BloomOnScroll';
import { ReturnToTop } from '../ReturnToTop';
import { AppFooter } from '../AppFooter';

interface ContactUsProps {
  onBack: () => void;
}

export default function ContactUs({ onBack }: ContactUsProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const contactReasons = [
    {
      icon: HelpCircle,
      title: 'General Inquiries',
      description: 'Questions about how Nenya works or how to use the platform'
    },
    {
      icon: Users,
      title: 'Partnership Opportunities',
      description: 'Interested in collaborating or bringing Nenya to your organization'
    },
    {
      icon: MessageSquare,
      title: 'Feedback & Suggestions',
      description: 'Share your thoughts on how we can improve the platform'
    },
    {
      icon: Mail,
      title: 'Media & Press',
      description: 'Press inquiries and media requests'
    }
  ];

  return (
    <div ref={scrollContainerRef} className="size-full overflow-auto scroll-container bg-background">
      <div className="border-b border-border bg-background px-6 py-4 sticky top-0 z-10 backdrop-blur-sm">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="size-4" />
          Back to About
        </Button>
      </div>

      <div className="w-full">
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
          {/* Header */}
          <BloomInstant className="text-center space-y-6">
            <div className="flex justify-center">
              <NenyaLogo size={100} />
            </div>
            <h1 className="text-4xl">
              Contact Us
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're here to answer your questions and support your journey with Nenya.
            </p>
          </BloomInstant>

          {/* Main Contact Card */}
          <BloomOnScroll>
            <Card className="p-8 border-nenya-accent-primary/30 bg-gradient-to-br from-background to-background-secondary">
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="size-20 rounded-full bg-nenya-accent-primary/10 flex items-center justify-center ring-2 ring-nenya-accent-primary/20">
                    <Mail className="size-10 text-nenya-accent-warm" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl mb-2">Get in Touch</h2>
                  <p className="text-muted-foreground mb-6">
                    For general inquiries, partnership opportunities, and platform support
                  </p>
                  <a
                    href="mailto:info@nenya.biz"
                    className="inline-flex items-center gap-3 text-xl text-nenya-accent-warm hover:text-nenya-accent-primary transition-colors"
                  >
                    <Mail className="size-6" />
                    info@nenya.biz
                  </a>
                </div>
              </div>
            </Card>
          </BloomOnScroll>

          {/* Contact Reasons Grid */}
          <BloomOnScroll>
            <div className="space-y-6">
              <h3 className="text-2xl text-center">How Can We Help?</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {contactReasons.map((reason, index) => {
                  const Icon = reason.icon;
                  return (
                    <Card key={index} className="p-5 border-nenya-accent-primary/20">
                      <div className="flex items-start gap-4">
                        <div className="size-10 rounded-full bg-nenya-accent-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="size-5 text-nenya-accent-warm" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold">{reason.title}</h4>
                          <p className="text-sm text-muted-foreground">{reason.description}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </BloomOnScroll>

          {/* Response Time Notice */}
          <BloomOnScroll>
            <div className="bg-muted/50 dark:bg-muted/30 p-6 rounded-lg">
              <p className="text-sm text-center text-muted-foreground">
                <strong className="text-foreground">Response Time:</strong> We aim to respond to all inquiries within 2-3 business days. For urgent matters related to the Eagle Protocol or safety concerns, please use the in-app emergency resources.
              </p>
            </div>
          </BloomOnScroll>

          {/* Additional Contact Options */}
          <BloomOnScroll>
            <Card className="p-6 border-nenya-accent-secondary/30">
              <div className="space-y-4">
                <h3 className="text-xl">Connect with the Founder</h3>
                <p className="text-sm text-muted-foreground">
                  For specific questions about the project's vision, philosophy, or potential collaborations, you can reach out directly to Estëlle, our founder and steward.
                </p>
                <a
                  href="mailto:estelle@nenya.biz"
                  className="inline-flex items-center gap-2 text-sm text-nenya-accent-warm hover:text-nenya-accent-primary transition-colors"
                >
                  <Mail className="size-4" />
                  estelle@nenya.biz
                </a>
              </div>
            </Card>
          </BloomOnScroll>

          {/* Privacy Note */}
          <BloomOnScroll>
            <div className="bg-nenya-accent-primary/5 border border-nenya-accent-primary/20 p-6 rounded-lg">
              <p className="text-sm text-center">
                <strong className="text-nenya-accent-warm">Privacy Commitment:</strong> We respect your privacy and will never share your contact information with third parties. All correspondence is treated with confidentiality and care.
              </p>
            </div>
          </BloomOnScroll>
        </div>
      </div>

      <ReturnToTop onClick={scrollToTop} />

      <AppFooter />
    </div>
  );
}
