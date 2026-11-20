import { useState } from 'react';
import { Button } from './ui/button';
import { Check, MessageCircle, Flag, Sparkles, ArrowRight } from 'lucide-react';
import { Card } from './ui/card';
import ReportModal from './ReportModal';
import { ConversationControls } from './ConversationControls';
import { getGradientMidpoint, getReadableTextColor } from './ColorUtils';

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
  
  
  // Demo walkthrough state
  const [showWalkthrough, setShowWalkthrough] = useState(true);
  const [demoStep, setDemoStep] = useState<DemoStep>('intro');
  
  
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

  // Demo walkthrough progression
  const handleNextStep = () => {
    if (demoStep === 'intro') {
      setDemoStep('partner-raw-message');
    } else if (demoStep === 'partner-raw-message') {
      // Add partner's raw message
      setMessages(prev => [...prev, {
        id: '2',
        sender: 'other',
        text: "You never listen to me! Every time I try to share something important, you just dismiss it or change the subject. I'm so tired of feeling like I don't matter to you."
      }]);
      setDemoStep('translation-option');
    } else if (demoStep === 'translation-option') {
      setDemoStep('translated-view');
    } else if (demoStep === 'translated-view') {
      setDemoStep('user-composing');
    } else if (demoStep === 'user-composing') {
      setDemoStep('user-ai-assist');
    } else if (demoStep === 'user-ai-assist') {
      // The person's own words, written by them (scripted here)
      setMessages(prev => [...prev, {
        id: '3',
        sender: 'user',
        text: "When I hear 'you never listen', I wonder if you felt hurt and wanted to be heard. Is that close?"
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
          title: "Preview: rephrasing (planned)",
          description: "Partner practice is a planned feature and is not built here. This scripted walkthrough shows the idea of rephrasing: one person shares a phrase and marks what they meant, the other marks what they heard, and each chooses what to send back. There is no AI in it, and nothing is rewritten for anyone.",
          icon: <Sparkles className="size-6 text-primary" />,
          extraContent: null
        };
      case 'partner-raw-message':
        return {
          title: "Your partner shares a phrase",
          description: "Your partner has asked if you would like to hear a phrase, and you said yes. Nothing was shown to you before you said yes, and you could have said \"Not now\" without a reason.",
          icon: <MessageCircle className="size-6 text-primary" />,
          extraContent: null
        };
      case 'translation-option':
        return {
          title: "You mark what you hear",
          description: "You tap the words to mark what you saw or heard, a story about it, a feeling or a need (your guesses), or a request. You choose whether to send your marks back, keep them to yourself, or skip marking.",
          icon: <Check className="size-6 text-primary" />,
          extraContent: null
        };
      case 'translated-view':
        return {
          title: "Two readings of the same words",
          description: "When your partner chooses to show what they meant, you see both readings side by side, in plain words, for each marked word: marked the same way, marked as different kinds, or marked by one of you. There are no scores, and neither reading is the right one.",
          icon: <Sparkles className="size-6 text-primary" />,
          extraContent: null
        };
      case 'user-composing':
        return {
          title: "Your turn",
          description: "You can answer in your own words, or start a round of your own. The app suggests nothing unless you ask, and it never writes or changes what you say.",
          icon: <MessageCircle className="size-6 text-primary" />,
          extraContent: null
        };
      case 'user-ai-assist':
        return {
          title: "In your own words",
          description: "Here you guess, in your own words, what your partner may have felt and needed. It is written by you (scripted in this preview) and sent only if you choose.",
          icon: <MessageCircle className="size-6 text-primary" />,
          extraContent: null
        };
      case 'complete':
        return {
          title: "Walkthrough complete",
          description: "Each person chooses, every time, what is sent, and either can pause, stop or close at any time. Anything you send can be copied or screenshotted by the other person. The real thing is in the cell itself, where it is switched on.",
          icon: <Check className="size-6 text-primary" />,
          extraContent: null
        };
      default:
        return null;
    }
  };

  return (
    <>
      <div className="size-full flex flex-col bg-background scroll-container">
        <div role="note" className="border-b border-amber-300 bg-amber-100 px-4 py-2 text-center text-xs text-amber-950 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-100">
          <strong>Planned feature, not built.</strong> This is a scripted preview of partner practice. No one else can join, and nothing here is sent anywhere.
        </div>
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

          <p className="mt-3 text-xs text-muted-foreground">There is no AI in a cell, and nothing is rewritten for anyone. To work on a phrase together, rephrase it: you mark the words yourselves.</p>
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
                  }`}
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
                >
                  <div>{message.text}</div>
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
                conversationName={`dyadic-cell-${cellCode}`}
              />
            </div>

            <div className="bg-card rounded-lg p-4 border border-border">
              <h4 className="text-sm mb-2">Facilitation Guide</h4>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li>• Take turns sharing and listening</li>
                <li>• Reflect back what you heard</li>
                <li>• Focus on feelings and needs</li>
                <li>• No advice or solutions</li>
                <li>• Practice curiosity, not judgment</li>
              </ul>
            </div>

            <div className="bg-card rounded-lg p-4 border border-border">
              <h4 className="text-sm mb-2 flex items-center gap-1">
                <Sparkles className="size-3" />
                Rephrasing
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                One person marks what they meant by a phrase; the other marks what they heard; each chooses what to send back. No AI, no scores.
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
              <h4 className="text-sm mb-2 text-amber-900 dark:text-amber-100">Professional Use Only</h4>
              <p className="text-xs text-amber-900 dark:text-amber-100 leading-relaxed">
                Partner practice is planned for use by therapists and other professionals, and it is not built. What you see is a scripted mock-up. <strong>It is not a replacement for professional help.</strong> If you need support, consult a qualified mental health professional.
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

    </>
  );
}
