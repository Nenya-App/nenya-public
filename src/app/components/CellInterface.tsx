import { useState } from 'react';
import { Button } from './ui/button';
import { Hand, Check, MessageCircle, Flag, Waves } from 'lucide-react';
import ReportModal from './ReportModal';
import EagleProtocolModal from './EagleProtocolModal';
import EagleProtocolTranscriptFlow from './EagleProtocolTranscriptFlow';
import EagleProtocolDemo from './EagleProtocolDemo';

interface UserColors {
  color1: string;
  color2: string;
  color1Name?: string;
  color2Name?: string;
}

interface CellInterfaceProps {
  userColors: UserColors;
  cellCode: string;
  onBack: () => void;
}

type CellMessage = {
  id: string;
  sender: 'nenya' | 'user' | 'other';
  text: string;
};

export default function CellInterface({ userColors, cellCode, onBack }: CellInterfaceProps) {
  const otherUserColors = { color1: '#FF6B6B', color2: '#4ECDC4' };
  const [handRaised, setHandRaised] = useState(false);
  const [ready, setReady] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showEagleProtocol, setShowEagleProtocol] = useState(false);
  const [showEagleTranscript, setShowEagleTranscript] = useState(false);
  const [eagleDemoActive, setEagleDemoActive] = useState(false);
  const [messages, setMessages] = useState<CellMessage[]>([
    {
      id: '1',
      sender: 'nenya',
      text: "Welcome. This is a space for deep listening. I will guide the process."
    },
    {
      id: '2',
      sender: 'nenya',
      text: `${userColors.color1}.${userColors.color2}, would you be willing to share your perspective first? Click the 'Ready' signal when you are finished.`
    }
  ]);

  const userHexCode = `${userColors.color1}.${userColors.color2}`;
  const otherHexCode = `${otherUserColors.color1}.${otherUserColors.color2}`;

  const handleReady = () => {
    setReady(!ready);
    
    if (!ready) {
      // Simulate facilitator response
      setTimeout(() => {
        const newMessage: CellMessage = {
          id: Date.now().toString(),
          sender: 'nenya',
          text: `Thank you for sharing. ${otherHexCode}, what did you hear in what ${userHexCode} shared? Please reflect back what you understood.`
        };
        setMessages(prev => [...prev, newMessage]);
      }, 1000);
    }
  };

  return (
    <div className="size-full flex flex-col bg-background scroll-container">
      {/* Header */}
      <div className="border-b border-border bg-background px-6 py-4">
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
              title="Eagle Protocol"
            >
              <Waves className="size-4" />
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground ml-2">
              <MessageCircle className="size-4" />
              Cell: <code>{cellCode}</code>
            </div>
          </div>
        </div>
        
        {/* Participants */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-3 border-2 border-primary">
            <div className="flex items-center gap-2 justify-center">
              <div className="flex gap-1">
                <div 
                  className="w-4 h-4 rounded-full border border-border" 
                  style={{ backgroundColor: userColors.color1 }}
                />
                <div 
                  className="w-4 h-4 rounded-full border border-border" 
                  style={{ backgroundColor: userColors.color2 }}
                />
              </div>
              <code className="text-xs">{userHexCode}</code>
              <span className="text-xs text-muted-foreground">(You)</span>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 border border-border">
            <div className="flex items-center gap-2 justify-center">
              <div className="flex gap-1">
                <div 
                  className="w-4 h-4 rounded-full border border-border" 
                  style={{ backgroundColor: otherUserColors.color1 }}
                />
                <div 
                  className="w-4 h-4 rounded-full border border-border" 
                  style={{ backgroundColor: otherUserColors.color2 }}
                />
              </div>
              <code className="text-xs">{otherHexCode}</code>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="flex-1 overflow-hidden flex">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
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
                className={`max-w-xl px-4 py-3 rounded-lg ${
                  message.sender === 'nenya'
                    ? 'bg-accent text-foreground border border-border text-center'
                    : message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}

          {handRaised && (
            <div className="flex justify-center">
              <div className="bg-amber-100 dark:bg-amber-900/20 text-amber-900 dark:text-amber-200 px-4 py-2 rounded-lg flex items-center gap-2 text-sm border border-amber-300 dark:border-amber-700">
                <Hand className="size-4" />
                You raised your hand
              </div>
            </div>
          )}

          {ready && (
            <div className="flex justify-center">
              <div className="bg-green-100 dark:bg-green-900/20 text-green-900 dark:text-green-200 px-4 py-2 rounded-lg flex items-center gap-2 text-sm border border-green-300 dark:border-green-700">
                <Check className="size-4" />
                You signaled ready
              </div>
            </div>
          )}
        </div>

        {/* Control Panel */}
        <div className="w-80 border-l border-border bg-muted/30 p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm">Process Controls</h3>
            <p className="text-xs text-muted-foreground">
              Use these signals to communicate with the facilitator and your partner
            </p>
          </div>

          <div className="space-y-3">
            <Button
              variant={handRaised ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setHandRaised(!handRaised)}
            >
              <Hand className="size-4 mr-2" />
              {handRaised ? "Lower Hand" : "Raise Hand"}
            </Button>

            <Button
              variant={ready ? "default" : "outline"}
              className="w-full justify-start"
              onClick={handleReady}
            >
              <Check className="size-4 mr-2" />
              {ready ? "Unmark Ready" : "Signal Ready"}
            </Button>
          </div>

          <div className="bg-card rounded-lg p-4 border border-border mt-6">
            <h4 className="text-xs mb-2">Facilitation Guide</h4>
            <ul className="text-xs text-muted-foreground space-y-2">
              <li>• Take turns sharing and listening</li>
              <li>• Reflect back what you heard</li>
              <li>• Focus on feelings and needs</li>
              <li>• No advice or solutions</li>
              <li>• Practice curiosity, not judgment</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal isOpen={showReport} onClose={() => setShowReport(false)} />

      {/* Eagle Protocol Modal */}
      <EagleProtocolModal isOpen={showEagleProtocol} onClose={() => setShowEagleProtocol(false)} />

      {/* Eagle Protocol Transcript Flow */}
      <EagleProtocolTranscriptFlow isOpen={showEagleTranscript} onClose={() => setShowEagleTranscript(false)} />

      {/* Eagle Protocol Demo */}
      <EagleProtocolDemo isActive={eagleDemoActive} onComplete={() => { setEagleDemoActive(false); onBack(); }} />
    </div>
  );
}