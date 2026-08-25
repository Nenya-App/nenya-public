import { useState } from 'react';
import { Button } from './ui/button';
import { Shield, Users, Flag, Waves, AlertCircle, Crown, ChevronDown, ChevronUp, Layers, Eye, Music, Hand, Sparkles, Zap, Brain, Edit2, Download, MessageCircle, ExternalLink } from 'lucide-react';
import { Badge } from './ui/badge';
import NenyaLogo from './NenyaLogo';
import PIIScrubbingDemo from './PIIScrubbingDemo';
import EagleProtocolDemo from './EagleProtocolDemo';
import { ConversationControls } from './ConversationControls';
import { Gateway, UserColors, GatewayData } from '../App';
import { getGradientMidpoint, getReadableTextColor } from './ColorUtils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

interface SessionInterfaceProps {
  interfaceColors: UserColors;
  gatewayData: GatewayData[];
  selectedGateways: Gateway[];
  onNavigateToCell: () => void;
  onBackToHome: () => void;
  onNavigateToAbout?: (section: string) => void;
  onUpdateGatewayData: (data: GatewayData[]) => void;
  onEditGateway?: (gateway: Gateway) => void;
}

type Message = {
  id: string;
  sender: 'user' | 'nenya' | 'system';
  text: string;
};

const gatewayIcons: Record<Gateway, any> = {
  sight: Eye,
  sound: Music,
  touch: Hand,
  essence: Sparkles,
  movement: Zap,
  insight: Brain,
};

const gatewayTitles: Record<Gateway, string> = {
  sight: 'Sight - Chromesthesia',
  sound: 'Sound - Audition',
  touch: 'Touch - Somatosensation',
  essence: 'Essence - Aromatic Memory',
  movement: 'Movement - Kinesthesia',
  insight: 'Insight - Noesis',
};

const formatGatewayData = (gateway: Gateway, data: any): { label: string; value: string }[] => {
  const info: { label: string; value: string }[] = [];
  
  switch (gateway) {
    case 'sight':
      info.push({ label: 'Present Color', value: data.color1Name || data.color1 });
      if (data.color1Qualities && data.color1Qualities.length > 0) {
        info.push({ label: 'Present Quality', value: data.color1Qualities.join(', ') });
      }
      info.push({ label: 'Potential Color', value: data.color2Name || data.color2 });
      if (data.color2Qualities && data.color2Qualities.length > 0) {
        info.push({ label: 'Potential Quality', value: data.color2Qualities.join(', ') });
      }
      break;
      
    case 'sound':
      info.push({ label: 'Present Pitch', value: `${data.currentPitch}/100` });
      info.push({ label: 'Present Volume', value: `${data.currentVolume}/100` });
      if (data.currentTimbres && Array.isArray(data.currentTimbres) && data.currentTimbres.length > 0) {
        info.push({ label: 'Present Timbre', value: data.currentTimbres.join(', ') });
      } else if (data.currentTimbre) {
        info.push({ label: 'Present Timbre', value: data.currentTimbre });
      }
      if (data.currentTimbreOther) info.push({ label: 'Timbre (other)', value: data.currentTimbreOther });
      if (data.currentRhythms && Array.isArray(data.currentRhythms) && data.currentRhythms.length > 0) {
        info.push({ label: 'Present Rhythm', value: data.currentRhythms.join(', ') });
      } else if (data.currentRhythm) {
        info.push({ label: 'Present Rhythm', value: data.currentRhythm });
      }
      if (data.currentRhythmOther) info.push({ label: 'Rhythm (other)', value: data.currentRhythmOther });
      if (data.currentDescription) info.push({ label: 'Present Description', value: data.currentDescription });
      
      info.push({ label: 'Potential Pitch', value: `${data.potentialPitch}/100` });
      info.push({ label: 'Potential Volume', value: `${data.potentialVolume}/100` });
      if (data.potentialTimbres && Array.isArray(data.potentialTimbres) && data.potentialTimbres.length > 0) {
        info.push({ label: 'Potential Timbre', value: data.potentialTimbres.join(', ') });
      } else if (data.potentialTimbre) {
        info.push({ label: 'Potential Timbre', value: data.potentialTimbre });
      }
      if (data.potentialTimbreOther) info.push({ label: 'Timbre (other)', value: data.potentialTimbreOther });
      if (data.potentialRhythms && Array.isArray(data.potentialRhythms) && data.potentialRhythms.length > 0) {
        info.push({ label: 'Potential Rhythm', value: data.potentialRhythms.join(', ') });
      } else if (data.potentialRhythm) {
        info.push({ label: 'Potential Rhythm', value: data.potentialRhythm });
      }
      if (data.potentialRhythmOther) info.push({ label: 'Rhythm (other)', value: data.potentialRhythmOther });
      if (data.potentialDescription) info.push({ label: 'Potential Description', value: data.potentialDescription });
      break;
      
    case 'touch':
      if (data.currentTexture) info.push({ label: 'Present Texture', value: `${data.currentTexture}/100` });
      info.push({ label: 'Present Temperature', value: `${data.currentTemperature}/100` });
      info.push({ label: 'Present Pressure', value: `${data.currentPressure}/100` });
      if (data.currentWeight) info.push({ label: 'Present Weight', value: `${data.currentWeight}/100` });
      if (data.currentDescription) info.push({ label: 'Present Description', value: data.currentDescription });
      
      if (data.potentialTexture) info.push({ label: 'Potential Texture', value: `${data.potentialTexture}/100` });
      info.push({ label: 'Potential Temperature', value: `${data.potentialTemperature}/100` });
      info.push({ label: 'Potential Pressure', value: `${data.potentialPressure}/100` });
      if (data.potentialWeight) info.push({ label: 'Potential Weight', value: `${data.potentialWeight}/100` });
      if (data.potentialDescription) info.push({ label: 'Potential Description', value: data.potentialDescription });
      break;
      
    case 'essence':
      if (data.currentTastes && Array.isArray(data.currentTastes) && data.currentTastes.length > 0) {
        info.push({ label: 'Present Taste', value: data.currentTastes.join(', ') });
      } else if (data.currentTaste) {
        info.push({ label: 'Present Taste', value: data.currentTaste });
      }
      if (data.currentTasteOther) info.push({ label: 'Taste (other)', value: data.currentTasteOther });
      if (data.currentScents && Array.isArray(data.currentScents) && data.currentScents.length > 0) {
        info.push({ label: 'Present Scent', value: data.currentScents.join(', ') });
      } else if (data.currentScent) {
        info.push({ label: 'Present Scent', value: data.currentScent });
      }
      if (data.currentScentOther) info.push({ label: 'Scent (other)', value: data.currentScentOther });
      if (data.currentIntensity) info.push({ label: 'Present Intensity', value: `${data.currentIntensity}/100` });
      if (data.currentDescription) info.push({ label: 'Present Description', value: data.currentDescription });
      
      if (data.potentialTastes && Array.isArray(data.potentialTastes) && data.potentialTastes.length > 0) {
        info.push({ label: 'Potential Taste', value: data.potentialTastes.join(', ') });
      } else if (data.potentialTaste) {
        info.push({ label: 'Potential Taste', value: data.potentialTaste });
      }
      if (data.potentialTasteOther) info.push({ label: 'Taste (other)', value: data.potentialTasteOther });
      if (data.potentialScents && Array.isArray(data.potentialScents) && data.potentialScents.length > 0) {
        info.push({ label: 'Potential Scent', value: data.potentialScents.join(', ') });
      } else if (data.potentialScent) {
        info.push({ label: 'Potential Scent', value: data.potentialScent });
      }
      if (data.potentialScentOther) info.push({ label: 'Scent (other)', value: data.potentialScentOther });
      if (data.potentialIntensity) info.push({ label: 'Potential Intensity', value: `${data.potentialIntensity}/100` });
      if (data.potentialDescription) info.push({ label: 'Potential Description', value: data.potentialDescription });
      break;
      
    case 'movement':
      if (data.currentDirections && Array.isArray(data.currentDirections) && data.currentDirections.length > 0) {
        info.push({ label: 'Present Direction', value: data.currentDirections.join(', ') });
      } else if (data.currentDirection) {
        info.push({ label: 'Present Direction', value: data.currentDirection });
      }
      if (data.currentDirectionOther) info.push({ label: 'Direction (other)', value: data.currentDirectionOther });
      if (data.currentEnergy) info.push({ label: 'Present Energy', value: `${data.currentEnergy}/100` });
      if (data.currentSpeed) info.push({ label: 'Present Speed', value: `${data.currentSpeed}/100` });
      if (data.currentQualities && Array.isArray(data.currentQualities) && data.currentQualities.length > 0) {
        info.push({ label: 'Present Quality', value: data.currentQualities.join(', ') });
      } else if (data.currentQuality) {
        info.push({ label: 'Present Quality', value: data.currentQuality });
      }
      if (data.currentQualityOther) info.push({ label: 'Quality (other)', value: data.currentQualityOther });
      if (data.currentDescription) info.push({ label: 'Present Description', value: data.currentDescription });
      
      if (data.potentialDirections && Array.isArray(data.potentialDirections) && data.potentialDirections.length > 0) {
        info.push({ label: 'Potential Direction', value: data.potentialDirections.join(', ') });
      } else if (data.potentialDirection) {
        info.push({ label: 'Potential Direction', value: data.potentialDirection });
      }
      if (data.potentialDirectionOther) info.push({ label: 'Direction (other)', value: data.potentialDirectionOther });
      if (data.potentialEnergy) info.push({ label: 'Potential Energy', value: `${data.potentialEnergy}/100` });
      if (data.potentialSpeed) info.push({ label: 'Potential Speed', value: `${data.potentialSpeed}/100` });
      if (data.potentialQualities && Array.isArray(data.potentialQualities) && data.potentialQualities.length > 0) {
        info.push({ label: 'Potential Quality', value: data.potentialQualities.join(', ') });
      } else if (data.potentialQuality) {
        info.push({ label: 'Potential Quality', value: data.potentialQuality });
      }
      if (data.potentialQualityOther) info.push({ label: 'Quality (other)', value: data.potentialQualityOther });
      if (data.potentialDescription) info.push({ label: 'Potential Description', value: data.potentialDescription });
      break;
      
    case 'insight':
      if (data.currentPatterns && Array.isArray(data.currentPatterns) && data.currentPatterns.length > 0) {
        info.push({ label: 'Present Pattern', value: data.currentPatterns.join(', ') });
      } else if (data.currentPattern) {
        info.push({ label: 'Present Pattern', value: data.currentPattern });
      }
      if (data.currentPatternOther) info.push({ label: 'Pattern (other)', value: data.currentPatternOther });
      if (data.currentClarity !== undefined) info.push({ label: 'Present Clarity', value: `${data.currentClarity}/100` });
      if (data.currentDepth !== undefined) info.push({ label: 'Present Depth', value: `${data.currentDepth}/100` });
      if (data.currentPerspectives && Array.isArray(data.currentPerspectives) && data.currentPerspectives.length > 0) {
        info.push({ label: 'Present Perspective', value: data.currentPerspectives.join(', ') });
      } else if (data.currentPerspective) {
        info.push({ label: 'Present Perspective', value: data.currentPerspective });
      }
      if (data.currentPerspectiveOther) info.push({ label: 'Perspective (other)', value: data.currentPerspectiveOther });
      if (data.currentDescription) info.push({ label: 'Present Description', value: data.currentDescription });
      
      if (data.potentialPatterns && Array.isArray(data.potentialPatterns) && data.potentialPatterns.length > 0) {
        info.push({ label: 'Potential Pattern', value: data.potentialPatterns.join(', ') });
      } else if (data.potentialPattern) {
        info.push({ label: 'Potential Pattern', value: data.potentialPattern });
      }
      if (data.potentialPatternOther) info.push({ label: 'Pattern (other)', value: data.potentialPatternOther });
      if (data.potentialClarity !== undefined) info.push({ label: 'Potential Clarity', value: `${data.potentialClarity}/100` });
      if (data.potentialDepth !== undefined) info.push({ label: 'Potential Depth', value: `${data.potentialDepth}/100` });
      if (data.potentialPerspectives && Array.isArray(data.potentialPerspectives) && data.potentialPerspectives.length > 0) {
        info.push({ label: 'Potential Perspective', value: data.potentialPerspectives.join(', ') });
      } else if (data.potentialPerspective) {
        info.push({ label: 'Potential Perspective', value: data.potentialPerspective });
      }
      if (data.potentialPerspectiveOther) info.push({ label: 'Perspective (other)', value: data.potentialPerspectiveOther });
      if (data.potentialDescription) info.push({ label: 'Potential Description', value: data.potentialDescription });
      break;
  }
  
  return info.length > 0 ? info : [{ label: 'Status', value: 'No data captured' }];
};

export default function SessionInterface({ 
  interfaceColors, 
  gatewayData, 
  selectedGateways,
  onNavigateToCell, 
  onBackToHome, 
  onNavigateToAbout,
  onUpdateGatewayData,
  onEditGateway
}: SessionInterfaceProps) {
  const [showPIIDemo, setShowPIIDemo] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    // Generate opening message based on gateway data
    let greeting = "Welcome to this space for reflection. ";
    
    const sightData = gatewayData.find(g => g.gateway === 'sight');
    if (sightData) {
      greeting += `I see you've chosen to move from ${sightData.data.color1Name || sightData.data.color1} to ${sightData.data.color2Name || sightData.data.color2}. `;
    }
    
    greeting += "Where are you right now in your journey?";
    
    return [{
      id: '1',
      sender: 'nenya',
      text: greeting
    }];
  });
  
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showDemoSelection, setShowDemoSelection] = useState(true);
  const [eagleDemoActive, setEagleDemoActive] = useState(false);
  const [gatewayPanelOpen, setGatewayPanelOpen] = useState(false);
  const [dialogueComplete, setDialogueComplete] = useState(false);

  const userHexCode = `${interfaceColors.color1}.${interfaceColors.color2}`;

  const handleClearConversation = () => {
    setMessages([messages[0]]);
  };

  const getConversationText = () => {
    return messages.map(m => `[${m.sender.toUpperCase()}]: ${m.text}`).join('\n\n');
  };

  const handleEagleDemoComplete = () => {
    setEagleDemoActive(false);
    onBackToHome();
  };

  const handleEagleProtocolDemo = () => {
    const crisisMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: "I just don't see the point anymore. I think everyone would be better off if I just disappeared for good."
    };
    setMessages(prev => [...prev, crisisMessage]);
    setEagleDemoActive(true);
  };

  const handlePredefinedResponse = (responseType: 'feelings') => {
    setShowDemoSelection(false);
    
    const dialogueSequence: Message[] = [
      {
        id: Date.now().toString(),
        sender: 'user',
        text: "I'm feeling really overwhelmed with work and my partner isn't being supportive."
      },
      {
        id: (Date.now() + 1).toString(),
        sender: 'nenya',
        text: "Thank you for sharing that. I'm hearing feelings of being overwhelmed, and perhaps frustration or loneliness around your partnership. I'm guessing you have needs for support, partnership, and perhaps understanding that aren't being met right now. Does that resonate?"
      },
      {
        id: (Date.now() + 2).toString(),
        sender: 'system',
        text: '⚠️ DEMO NOTICE: This brief exchange demonstrates how Nenya reflects feelings and identifies needs. To continue this conversation with a live AI partner, try the Venice AI integration below.'
      }
    ];

    const addMessagesSequentially = (index: number) => {
      if (index >= dialogueSequence.length) {
        // All messages added, show Venice button after a short delay
        setTimeout(() => setDialogueComplete(true), 500);
        return;
      }
      const currentMessage = dialogueSequence[index];
      setMessages(prev => [...prev, currentMessage]);
      
      if (index + 1 < dialogueSequence.length) {
        const delay = currentMessage.sender === 'user' ? 800 : 1800;
        setTimeout(() => addMessagesSequentially(index + 1), delay);
      } else {
        // Last message added, continue to trigger completion
        setTimeout(() => addMessagesSequentially(index + 1), 500);
      }
    };

    setTimeout(() => addMessagesSequentially(0), 500);
  };

  const generateSensoryReport = () => {
    const timestamp = new Date().toLocaleString();
    let report = `NENYA SENSORY REFLECTION REPORT\n`;
    report += `Generated: ${timestamp}\n`;
    report += `\n${'='.repeat(60)}\n\n`;
    report += `This sensory report is a tool for your personal reflection.\n`;
    report += `You can use this as-is with a therapist, spiritual counselor,\n`;
    report += `or other trusted guide as a starting point for joint reflection.\n`;
    report += `\nNenya is designed to support your sovereignty - you choose what\n`;
    report += `to share, when to share, and how to use your own data.\n`;
    report += `\n${'='.repeat(60)}\n\n`;
    
    gatewayData.forEach((gd) => {
      report += `\n${gatewayTitles[gd.gateway].toUpperCase()}\n`;
      report += `${'-'.repeat(60)}\n`;
      
      const dataFields = formatGatewayData(gd.gateway, gd.data);
      dataFields.forEach(field => {
        report += `${field.label}: ${field.value}\n`;
      });
      report += `\n`;
    });
    
    report += `\n${'='.repeat(60)}\n`;
    report += `\nEnd of Report\n`;
    report += `\nThis report was generated by Nenya (nenya.app)\n`;
    report += `An empathy gym for evolved leadership\n`;
    report += `Privacy-first • User-sovereign • Open & Transparent\n`;
    
    return report;
  };
  
  const downloadReport = () => {
    const report = generateSensoryReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nenya-sensory-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (showPIIDemo) {
    return <PIIScrubbingDemo onComplete={() => setShowPIIDemo(false)} />;
  }

  if (eagleDemoActive) {
    return <EagleProtocolDemo isActive={true} onComplete={handleEagleDemoComplete} />;
  }

  return (
    <div className="size-full flex flex-col bg-background relative">
      {/* Demo Banner */}
      {showDisclaimer ? (
        <div className="bg-nenya-accent-warm/10 border-b border-nenya-accent-secondary">
          <div className="flex items-center justify-between gap-2 px-4 md:px-6 py-3">
            <div className="flex items-center gap-2 text-sm text-foreground flex-1">
              <AlertCircle className="size-4 flex-shrink-0 text-nenya-accent-warm" />
              <p className="text-center flex-1">
                <span className="font-medium text-nenya-accent-warm">DEMONSTRATION MODE:</span> This chat interface displays pre-generated dialogue examples. The planned Nenya application will include an AI assistant trained in NVC+ methodology (currently under separate development), with automatic PII scrubbing on every message.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDisclaimer(false)}
              className="text-foreground hover:bg-nenya-accent-metallic/10 flex-shrink-0"
            >
              <ChevronUp className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-nenya-accent-warm/10 border-b border-nenya-accent-secondary">
          <div className="flex items-center justify-center gap-2 px-6 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDisclaimer(true)}
              className="text-foreground hover:bg-nenya-accent-metallic/10 text-xs"
            >
              <ChevronDown className="size-3 mr-1" />
              Show Demo Disclaimer
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div 
        className="border-b bg-background-secondary px-4 md:px-6 py-3 md:py-4"
        style={{ borderBottomColor: `${interfaceColors.color2}40` }}
      >
        <div className="flex items-center justify-between gap-2">
          <button onClick={onBackToHome} className="text-sm md:text-base text-muted-foreground hover:text-nenya-accent-primary transition-colors whitespace-nowrap">
            ← Back
          </button>
          
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="hidden sm:block">
              <NenyaLogo size={40} />
            </div>
            <div className="flex gap-1">
              <div 
                className="rounded-full border-2 shadow-sm" 
                style={{ 
                  backgroundColor: interfaceColors.color1,
                  borderColor: `${interfaceColors.color1}60`,
                  width: '24px',
                  height: '24px'
                }}
              />
              <div 
                className="rounded-full border-2 shadow-sm" 
                style={{ 
                  backgroundColor: interfaceColors.color2,
                  borderColor: `${interfaceColors.color2}60`,
                  width: '24px',
                  height: '24px'
                }}
              />
            </div>
            <code 
              className="text-sm hidden sm:inline"
              style={{
                background: `linear-gradient(to right, ${interfaceColors.color1}, ${interfaceColors.color2})`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}
            >
              {userHexCode}
            </code>
          </div>
          
          <div className="flex gap-1 items-center flex-shrink-0">
            {/* Gateway Panel Trigger */}
            <Sheet open={gatewayPanelOpen} onOpenChange={setGatewayPanelOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <Layers className="size-4" />
                  <span className="hidden md:inline">Gateways</span>
                  <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0 h-auto">
                    {selectedGateways.length}
                  </Badge>
                </Button>
              </SheetTrigger>
              <SheetContent className="flex flex-col w-full sm:max-w-lg h-full overflow-hidden">
                <SheetHeader className="flex-shrink-0">
                  <SheetTitle>Your Active Gateways</SheetTitle>
                  <SheetDescription>
                    The sensory pathways you've chosen for this session
                  </SheetDescription>
                </SheetHeader>
                <ScrollArea className="flex-1 -mx-6 px-6 min-h-0">
                  <div className="space-y-4 pb-6">
                    {gatewayData.map((gd) => {
                      const Icon = gatewayIcons[gd.gateway];
                      const dataFields = formatGatewayData(gd.gateway, gd.data);
                      
                      return (
                        <Card key={gd.gateway} className="overflow-hidden">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="mt-0.5 flex-shrink-0">
                                  <Icon className="size-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-base">
                                    {gatewayTitles[gd.gateway]}
                                  </CardTitle>
                                </div>
                              </div>
                              {onEditGateway && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onEditGateway(gd.gateway)}
                                  className="gap-1.5 h-8 flex-shrink-0"
                                >
                                  <Edit2 className="size-3" />
                                  <span className="text-xs">Edit</span>
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-1.5">
                              {dataFields.map((field, idx) => (
                                <div key={idx} className="grid grid-cols-[auto_1fr] gap-3 text-sm">
                                  <span className="text-muted-foreground whitespace-nowrap">
                                    {field.label}:
                                  </span>
                                  <span className="break-words">
                                    {field.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
                
                {/* Download Report Section */}
                <div className="border-t border-border pt-4 -mx-6 px-6 pb-2 flex-shrink-0">
                  <div className="bg-muted/30 rounded-lg p-3 shadow-[0_0_12px_rgba(218,198,130,0.25)] dark:shadow-[0_0_15px_rgba(218,198,130,0.2)]">
                    <p className="text-xs text-muted-foreground mb-2">
                      <span className="text-foreground bg-nenya-gold/20 px-1.5 py-0.5 rounded">Your data, your choice:</span> Download this sensory reflection to use with a therapist, counselor, or trusted guide.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadReport}
                      className="gap-2 w-full shadow-[0_0_8px_rgba(218,198,130,0.25)] dark:shadow-[0_0_10px_rgba(218,198,130,0.2)] border-nenya-gold/30 hover:border-nenya-gold/50"
                    >
                      <Download className="size-4" />
                      Download Sensory Report
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateToCell}
              className="hidden md:flex gap-1.5"
            >
              <Users className="size-4" />
              <span className="hidden lg:inline">Practice with Someone</span>
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0 h-auto">
                <Crown className="size-3 mr-0.5" />
                Premium
              </Badge>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPIIDemo(true)}
              title="Review Privacy Protection"
            >
              <Shield className="size-4 text-green-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Gradient Bar */}
      <div 
        className="h-1 w-full"
        style={{
          background: `linear-gradient(to right, ${interfaceColors.color1}, ${interfaceColors.color2})`
        }}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-8 space-y-4 scroll-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : message.sender === 'system' ? 'justify-center' : 'justify-start'}`}
          >
            <div
              className={`max-w-xl px-4 py-3 rounded-lg ${
                message.sender === 'user'
                  ? ''
                  : message.sender === 'system'
                  ? 'bg-yellow-50 dark:bg-yellow-950 text-yellow-900 dark:text-yellow-100 border border-yellow-200 dark:border-yellow-800 text-sm'
                  : 'bg-muted text-foreground'
              }`}
              style={
                message.sender === 'user'
                  ? {
                      background: `linear-gradient(135deg, ${interfaceColors.color1} 0%, ${interfaceColors.color2} 100%)`,
                      color: getReadableTextColor(getGradientMidpoint(interfaceColors.color1, interfaceColors.color2))
                    }
                  : undefined
              }
            >
              {message.text}
            </div>
          </div>
        ))}
        
        {/* Venice Button - Appears after demo completes */}
        {dialogueComplete && onNavigateToAbout && (
          <div className="flex justify-center pt-4">
            <div className="max-w-xl w-full space-y-3">
              <div className="text-center">
                <Button
                  onClick={() => onNavigateToAbout('venice-chat')}
                  size="lg"
                  className="w-full gap-2 bg-purple-700 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-500 text-white shadow-lg"
                >
                  <MessageCircle className="size-5" />
                  Continue with AI Chat
                  <ExternalLink className="size-5" />
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Try our AI conversation partner (via Venice AI integration)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background px-4 md:px-6 py-4 space-y-3">
        <div className="flex justify-center pb-2">
          <ConversationControls 
            onClearConversation={handleClearConversation}
            conversationText={getConversationText()}
            conversationName="solo-practice"
          />
        </div>

        {showDemoSelection && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Choose a pre-generated demo conversation:</strong>
            </p>
            <Button
              className="w-full justify-start h-auto py-3 px-4 text-left whitespace-normal"
              variant="outline"
              onClick={() => handlePredefinedResponse('feelings')}
            >
              Share feelings about work stress and relationship support
            </Button>
            <Button
              className="w-full justify-start h-auto py-3 px-4 text-left whitespace-normal gap-2"
              variant="outline"
              onClick={handleEagleProtocolDemo}
            >
              <Waves className="size-5 flex-shrink-0" style={{ color: '#BC8F8F' }} />
              <span>Demo: Eagle Protocol Safety System (Crisis Detection & Compassionate Care)</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}