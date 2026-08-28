import { useState } from 'react';
import { Button } from './ui/button';
import { Hand, Check, MessageCircle, Flag, Waves, Bot, BotOff, Sparkles, ArrowRight, Info, Eye, EyeOff } from 'lucide-react';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import ReportModal from './ReportModal';
import EagleProtocolModal from './EagleProtocolModal';
import EagleProtocolTranscriptFlow from './EagleProtocolTranscriptFlow';
import EagleProtocolDemo from './EagleProtocolDemo';
import { ConversationControls } from './ConversationControls';
import { getGradientMidpoint, getReadableTextColor } from './ColorUtils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';

interface UserColors {
  color1: string;
  color2: string;
  color1Name?: string;
  color2Name?: string;
}

interface DyadicCellInterfaceProps {
  userColors: UserColors;
  cellCode: string;
  onBack: () => void;
}

type CellMessage = {
  id: string;
  sender: 'nenya' | 'user' | 'other';
  text: string;
  rawText?: string; // Original text before AI assistance
  isTranslated?: boolean;
};

type DemoStep = 
  | 'intro'
  | 'partner-raw-message'
  | 'translation-option'
  | 'translated-view'
  | 'user-composing'
  | 'user-ai-assist'
  | 'complete';

export default function DyadicCellInterface({ userColors, cellCode, onBack }: DyadicCellInterfaceProps) {
  const otherUserColors = { color1: '#FF6B6B', color2: '#4ECDC4' };
  const [showReport, setShowReport] = useState(false);
  const [showEagleProtocol, setShowEagleProtocol] = useState(false);
  const [showEagleTranscript, setShowEagleTranscript] = useState(false);
  const [eagleDemoActive, setEagleDemoActive] = useState(false);
  
  // AI Translation Settings
  const [receiveTranslated, setReceiveTranslated] = useState(false);
  const [sendWithAI, setSendWithAI] = useState(false);
  
  // Demo walkthrough state
  const [showWalkthrough, setShowWalkthrough] = useState(true);
  const [demoStep, setDemoStep] = useState<DemoStep>('intro');
  
  // Message view state - track which messages are showing raw text
  const [showingRawText, setShowingRawText] = useState<Set<string>>(new Set());
  
  const [messages, setMessages] = useState<CellMessage[]>([
    {
      id: '1',
      sender: 'nenya',
      text: "Welcome. This is a space for deep listening. I will guide the process."
    }
  ]);

  const userHexCode = `${userColors.color1}.${userColors.color2}`;
  const otherHexCode = `${otherUserColors.color1}.${otherUserColors.color2}`;

  const handleClearConversation = () => {
    setMessages([{
      id: '1',
      sender: 'nenya',
      text: "Welcome. This is a space for deep listening. I will guide the process."
    }]);
  };

  const getConversationText = () => {
    return messages.map(m => `[${m.sender.toUpperCase()}]: ${m.text}`).join('\n\n');
  };

  const toggleRawText = (messageId: string) => {
    setShowingRawText(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  // Demo walkthrough progression
  const handleNextStep = () => {
    const steps: DemoStep[] = ['intro', 'partner-raw-message', 'translation-option', 'translated-view', 'user-composing', 'user-ai-assist', 'complete'];
    const currentIndex = steps.indexOf(demoStep);
    
    if (demoStep === 'intro') {
      setDemoStep('partner-raw-message');
    } else if (demoStep === 'partner-raw-message') {
      // Add partner's raw message
      setMessages(prev => [...prev, {
        id: '2',
        sender: 'other',
        text: "You never listen to me! Every time I try to share something important, you just dismiss it or change the subject. I'm so tired of feeling like I don't matter to you.",
        rawText: "You never listen to me! Every time I try to share something important, you just dismiss it or change the subject. I'm so tired of feeling like I don't matter to you.",
        isTranslated: false
      }]);
      setDemoStep('translation-option');
    } else if (demoStep === 'translation-option') {
      setDemoStep('translated-view');
    } else if (demoStep === 'translated-view') {
      // Enable translation
      setReceiveTranslated(true);
      // Update the last message to show translated version
      setMessages(prev => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg.sender === 'other') {
          lastMsg.text = "I'm feeling hurt and frustrated right now. When I share things that are important to me, I notice that the conversation shifts direction, and I'm left feeling unheard. I have a need for connection and to know that what I share matters to you. I'm longing for that sense of being seen and valued.";
          lastMsg.isTranslated = true;
        }
        return updated;
      });
      setDemoStep('user-composing');
    } else if (demoStep === 'user-composing') {
      setDemoStep('user-ai-assist');
    } else if (demoStep === 'user-ai-assist') {
      setSendWithAI(true);
      // Add user's AI-assisted message
      setMessages(prev => [...prev, {
        id: '3',
        sender: 'user',
        text: "I hear that you're feeling hurt and frustrated. It sounds like when you share important things with me and the conversation changes direction, you feel unheard and disconnected. You need to know that what you share matters to me, and you're longing to feel seen and valued. Is that right?",
        rawText: "I hear you and I'm trying to understand.",
        isTranslated: true
      }]);
      setDemoStep('complete');
    } else {
      setShowWalkthrough(false);
    }
  };

  const getDemoContent = () => {
    switch (demoStep) {
      case 'intro':
        return {
          title: "AI Translation Tutorial",
          description: "In dyadic cells, you can choose whether to use AI assistance for both sending and receiving messages. This walkthrough demonstrates how AI translation works with NVC+ principles.",
          icon: <Sparkles className="size-6 text-primary" />,
          extraContent: null
        };
      case 'partner-raw-message':
        return {
          title: "Partner Sends Raw Message",
          description: "Your conversation partner has chosen to send their message without AI assistance. This is their authentic, unfiltered expression.",
          icon: <MessageCircle className="size-6 text-blue-600" />,
          extraContent: null
        };
      case 'translation-option':
        return {
          title: "Your Translation Option",
          description: "You can choose to view this message in its raw form (as written) or request an AI-assisted NVC+ translation that identifies feelings and needs. The choice is yours.",
          icon: <Bot className="size-6 text-purple-600" />,
          extraContent: (
            <Card className="p-4 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
              <p className="text-sm text-purple-900 dark:text-purple-100">
                <strong>Notice the difference:</strong> You can see the partner's raw emotional expression. If you toggle "Receive Translated", this preview shows what an AI-assisted NVC+ translation would look like — the actual translation isn't live yet, this walkthrough uses a scripted example.
              </p>
            </Card>
          )
        };
      case 'translated-view':
        return {
          title: "NVC+ Translation Active",
          description: "The AI has translated the partner's message using NVC+ principles, identifying feelings (hurt, frustrated) and needs (connection, being seen and valued). Notice how it preserves the emotional content while making the underlying needs more explicit.",
          icon: <Sparkles className="size-6 text-green-600" />,
          extraContent: null
        };
      case 'user-composing':
        return {
          title: "Your Response",
          description: "Now it's your turn to respond. You can write a raw message or use AI assistance to help craft an NVC+ response. We'll demonstrate using AI assistance.",
          icon: <MessageCircle className="size-6 text-amber-600" />,
          extraContent: (
            <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-900 dark:text-amber-100 mb-2">
                <strong>Your options for responding:</strong>
              </p>
              <ul className="text-sm text-amber-900 dark:text-amber-100 space-y-1 list-disc list-inside">
                <li><strong>Raw:</strong> Send your authentic response as-is</li>
                <li><strong>AI Assist:</strong> Get help structuring an empathic NVC+ reflection</li>
              </ul>
            </Card>
          )
        };
      case 'user-ai-assist':
        return {
          title: "AI-Assisted Response",
          description: "The AI has helped you craft a response using NVC+ reflection techniques. It identifies the feelings and needs you heard, then checks for understanding. This demonstrates empathic listening in action.",
          icon: <Sparkles className="size-6 text-purple-600" />,
          extraContent: null
        };
      case 'complete':
        return {
          title: "Tutorial Complete",
          description: "You've seen how AI translation works in both directions. You can toggle these settings at any time during a conversation. The goal is to support authentic connection while providing tools for clearer communication.",
          icon: <Check className="size-6 text-green-600" />,
          extraContent: (
            <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <p className="text-sm text-green-900 dark:text-green-100">
                <strong>Key takeaway:</strong> Each person controls their own AI assistance independently. Your partner can send raw messages while you receive translations, or vice versa. This flexibility supports authentic connection while providing scaffolding for clearer communication.
              </p>
            </Card>
          )
        };
      default:
        return null;
    }
  };

  return (
    <>
      <div className="size-full flex flex-col bg-background scroll-container">
        {/* Header */}
        <div 
          className="border-b bg-background px-4 md:px-6 py-3 md:py-4"
          style={{
            borderBottomColor: `${userColors.color2}40`
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <button onClick={onBack} className="text-muted-foreground hover:text-foreground">
              ← Leave Cell
            </button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReport(true)}
                title="Submit a Report"
              >
                <Flag className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEagleProtocol(true)}
                title="Eagle Protocol (planned safety feature)"
              >
                <Waves className="size-4" />
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground ml-2">
                <MessageCircle className="size-4" />
                Cell: <code className="text-xs">{cellCode}</code>
              </div>
            </div>
          </div>
          
          {/* Participants */}
          <div className="grid grid-cols-2 gap-4">
            <div 
              className="bg-muted/50 rounded-lg p-3 border-2"
              style={{
                borderColor: `${userColors.color2}60`
              }}
            >
              <div className="flex items-center gap-2 justify-center">
                <div className="flex gap-1">
                  <div 
                    className="w-4 h-4 rounded-full border-2" 
                    style={{ 
                      backgroundColor: userColors.color1,
                      borderColor: `${userColors.color1}60`
                    }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full border-2" 
                    style={{ 
                      backgroundColor: userColors.color2,
                      borderColor: `${userColors.color2}60`
                    }}
                  />
                </div>
                <code 
                  className="text-xs"
                  style={{
                    background: `linear-gradient(to right, ${userColors.color1}, ${userColors.color2})`,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  {userHexCode}
                </code>
                <span className="text-xs text-muted-foreground">(You)</span>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2 justify-center">
                <div className="flex gap-1">
                  <div 
                    className="w-4 h-4 rounded-full border-2" 
                    style={{ 
                      backgroundColor: otherUserColors.color1,
                      borderColor: `${otherUserColors.color1}60`
                    }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full border-2" 
                    style={{ 
                      backgroundColor: otherUserColors.color2,
                      borderColor: `${otherUserColors.color2}60`
                    }}
                  />
                </div>
                <code 
                  className="text-xs"
                  style={{
                    background: `linear-gradient(to right, ${otherUserColors.color1}, ${otherUserColors.color2})`,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  {otherHexCode}
                </code>
              </div>
            </div>
          </div>

          {/* AI Translation Settings */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Card className="p-3 bg-muted/30">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {receiveTranslated ? <Bot className="size-4 text-purple-600 flex-shrink-0" /> : <BotOff className="size-4 text-muted-foreground flex-shrink-0" />}
                  <Label htmlFor="receive-translate" className="text-xs cursor-pointer truncate">
                    Receive Translated
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                        <Info className="size-3" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72" align="start">
                      <div className="space-y-2">
                        <h4 className="text-sm">Receive Translated</h4>
                        <p className="text-xs text-muted-foreground">
                          When enabled, incoming messages are automatically translated using NVC+ principles. The AI identifies feelings and needs while preserving the emotional content. You can click any translated message to see the original unfiltered text.
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Switch 
                  id="receive-translate" 
                  checked={receiveTranslated}
                  onCheckedChange={setReceiveTranslated}
                  disabled={showWalkthrough && demoStep !== 'translated-view'}
                />
              </div>
            </Card>

            <Card className="p-3 bg-muted/30">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {sendWithAI ? <Bot className="size-4 text-green-600 flex-shrink-0" /> : <BotOff className="size-4 text-muted-foreground flex-shrink-0" />}
                  <Label htmlFor="send-ai" className="text-xs cursor-pointer truncate">
                    Send with AI
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                        <Info className="size-3" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72" align="start">
                      <div className="space-y-2">
                        <h4 className="text-sm">Send with AI</h4>
                        <p className="text-xs text-muted-foreground">
                          When enabled, the AI helps structure your outgoing messages using NVC+ reflection techniques. It crafts empathic responses that identify feelings and needs, then checks for understanding. Your original message is preserved and can be viewed by clicking the sent message.
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Switch 
                  id="send-ai" 
                  checked={sendWithAI}
                  onCheckedChange={setSendWithAI}
                  disabled={showWalkthrough && demoStep !== 'user-ai-assist'}
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content - Split View */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 
                  message.sender === 'other' ? 'justify-start' :
                  'justify-center'
                }`}
              >
                <div
                  className={`max-w-xl px-4 py-3 rounded-lg relative ${
                    message.sender === 'nenya'
                      ? 'bg-accent text-foreground border border-border text-center'
                      : message.sender === 'user'
                      ? ''
                      : message.sender === 'other'
                      ? ''
                      : 'bg-muted text-foreground'
                  } ${message.rawText ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
                  style={
                    message.sender === 'user'
                      ? {
                          background: `linear-gradient(135deg, ${userColors.color1} 0%, ${userColors.color2} 100%)`,
                          color: getReadableTextColor(getGradientMidpoint(userColors.color1, userColors.color2))
                        }
                      : message.sender === 'other'
                      ? {
                          background: `linear-gradient(135deg, ${otherUserColors.color1} 0%, ${otherUserColors.color2} 100%)`,
                          color: getReadableTextColor(getGradientMidpoint(otherUserColors.color1, otherUserColors.color2))
                        }
                      : undefined
                  }
                  onClick={() => message.rawText && toggleRawText(message.id)}
                  title={message.rawText ? 'Click to toggle between raw and translated message' : undefined}
                >
                  <div>
                    {showingRawText.has(message.id) && message.rawText ? message.rawText : message.text}
                  </div>
                  {message.rawText && (
                    <div className="mt-2 pt-2 border-t border-current/20 flex items-center gap-1 text-xs opacity-70">
                      {showingRawText.has(message.id) ? (
                        <>
                          <EyeOff className="size-3" />
                          <span>Raw message (click for NVC+)</span>
                        </>
                      ) : (
                        <>
                          <Eye className="size-3" />
                          <span>Click to see unfiltered input</span>
                        </>
                      )}
                    </div>
                  )}
                  {message.isTranslated && !showingRawText.has(message.id) && (
                    <Badge variant="secondary" className="absolute -top-2 -right-2 gap-1">
                      <Sparkles className="size-3" />
                      NVC+
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Control Panel */}
          <div className="w-full md:w-80 border-t md:border-l md:border-t-0 border-border bg-muted/30 p-4 md:p-6 space-y-4 md:overflow-y-auto">
            <div className="space-y-2">
              <h3 className="text-sm">Conversation Controls</h3>
              <ConversationControls 
                onClearConversation={handleClearConversation}
                conversationText={getConversationText()}
                conversationName={`dyadic-cell-${cellCode}`}
              />
            </div>

            <div className="bg-card rounded-lg p-4 border border-border">
              <h4 className="text-xs mb-2">Facilitation Guide</h4>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li>• Take turns sharing and listening</li>
                <li>• Reflect back what you heard</li>
                <li>• Focus on feelings and needs</li>
                <li>• No advice or solutions</li>
                <li>• Practice curiosity, not judgment</li>
              </ul>
            </div>

            <div className="bg-card rounded-lg p-4 border border-border">
              <h4 className="text-xs mb-2 flex items-center gap-1">
                <Sparkles className="size-3" />
                AI Translation
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Toggle AI assistance for incoming and outgoing messages. AI helps translate to/from NVC+ principles while preserving your authentic expression.
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
              <h4 className="text-xs mb-2 text-amber-900 dark:text-amber-100">Professional Use Only</h4>
              <p className="text-xs text-amber-900 dark:text-amber-100 leading-relaxed">
                This is a demonstration prototype being developed for therapists and professionals. <strong>Not a replacement for professional help.</strong> If you need support, consult a qualified mental health professional.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Walkthrough Modal - Now positioned at the bottom */}
      {showWalkthrough && (
        <div className="fixed bottom-0 left-0 right-0 p-2 md:p-4 z-50 pointer-events-none max-h-[70vh] overflow-y-auto">
          <Card className="max-w-2xl mx-auto pointer-events-auto shadow-2xl border-2">
            <div className="p-4 md:p-6 space-y-4">
              <div className="flex items-start gap-3">
                {getDemoContent()?.icon}
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg">{getDemoContent()?.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {getDemoContent()?.description}
                  </p>
                </div>
              </div>

              {getDemoContent()?.extraContent}

              <div className="text-sm text-muted-foreground bg-muted/50 rounded p-3">
                <strong>Step {['intro', 'partner-raw-message', 'translation-option', 'translated-view', 'user-composing', 'user-ai-assist', 'complete'].indexOf(demoStep) + 1} of 7</strong>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setShowWalkthrough(false)}>
                  Skip Tutorial
                </Button>
                <Button onClick={handleNextStep} className="gap-2">
                  {demoStep === 'complete' ? 'Finish' : 'Continue'}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal isOpen={showReport} onClose={() => setShowReport(false)} />

      {/* Eagle Protocol Modal */}
      <EagleProtocolModal isOpen={showEagleProtocol} onClose={() => setShowEagleProtocol(false)} />

      {/* Eagle Protocol Transcript Flow */}
      <EagleProtocolTranscriptFlow isOpen={showEagleTranscript} onClose={() => setShowEagleTranscript(false)} />

      {/* Eagle Protocol Demo */}
      <EagleProtocolDemo isActive={eagleDemoActive} onComplete={() => { setEagleDemoActive(false); onBack(); }} />
    </>
  );
}
