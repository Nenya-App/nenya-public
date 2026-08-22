import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Shield, Users, Flag, Waves, AlertCircle, User, Sparkles, ChevronDown, ChevronUp, ExternalLink, Eye, MessageSquare, FileText, MessageCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { ThemeToggle } from './ThemeToggle';
import SafetyModal from './SafetyModal';
import ReportModal from './ReportModal';
import EagleProtocolModal from './EagleProtocolModal';
import EagleProtocolTranscriptFlow from './EagleProtocolTranscriptFlow';
import EagleProtocolDemo from './EagleProtocolDemo';
import NenyaLogo from './NenyaLogo';
import PIIScrubbingDemo from './PIIScrubbingDemo';
import { HexagonCodeDisplay } from './HexagonCodeDisplay';
import { AppFooter } from './AppFooter';
import { ConversationControls } from './ConversationControls';
import { BodyMapAvatar } from './BodyMapAvatar';
import { getGradientMidpoint, getReadableTextColor } from './ColorUtils';

interface UserColors {
  color1: string;
  color2: string;
  color1Name?: string;
  color2Name?: string;
  color1Random?: boolean;
  color2Random?: boolean;
  skippedReflection?: boolean;
}

interface ChatInterfaceProps {
  userColors: UserColors;
  onNavigateToCell: () => void;
  onBackToWelcome: () => void;
  onNavigateToAbout?: (section: string) => void;
}

type Message = {
  id: string;
  sender: 'user' | 'nenya' | 'system';
  text: string;
};

type ChatStage = 'initial' | 'dialogue-complete';

export default function ChatInterface({ userColors, onNavigateToCell, onBackToWelcome, onNavigateToAbout }: ChatInterfaceProps) {
  // Generate initial greeting based on user's color choices
  const getInitialGreeting = () => {
    if (userColors.skippedReflection) {
      return "Welcome to this mirror for your inner world. I'm here to help you explore your feelings and needs through Nonviolent Communication. What would you like to talk about today?";
    }

    const color1Display = userColors.color1Random ? 'a random color' : 
                         (userColors.color1Name || userColors.color1.toUpperCase());
    const color2Display = userColors.color2Random ? 'a random color' : 
                         (userColors.color2Name || userColors.color2.toUpperCase());

    if (userColors.color1Random && userColors.color2Random) {
      return "Thank you for joining. I notice you chose random colors for your bio-social identity. That's perfectly fine—color reflection is entirely optional. Would you like to explore what you're feeling today, or would you prefer to just dive into what's on your mind?";
    } else if (userColors.color1Random || userColors.color2Random) {
      return `Thank you for joining. I see you chose ${color1Display} and ${color2Display}. If you'd like to reflect on these colors and what they might represent for you, I'm here to explore that with you. Or, if you'd rather just talk about how you're feeling, that's perfectly fine too. What feels right for you?`;
    } else {
      return `Thank you for sharing your colors with me. You've chosen a journey from ${color1Display} to ${color2Display}. If you'd like, we can explore what this means for you—or we can simply focus on what you're experiencing today. What would feel most helpful?`;
    }
  };

  const [showPIIDemo, setShowPIIDemo] = useState(true);
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: '1',
      sender: 'nenya',
      text: getInitialGreeting()
    }
  ]);
  const [stage, setStage] = useState<ChatStage>('initial');
  const [showSafety, setShowSafety] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showEagleProtocol, setShowEagleProtocol] = useState(false);
  const [showEagleTranscript, setShowEagleTranscript] = useState(false);
  const [showBodyMap, setShowBodyMap] = useState(false);
  const [eagleDemoActive, setEagleDemoActive] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showDemoSelection, setShowDemoSelection] = useState(true);
  const [disguiseMode, setDisguiseMode] = useState<'none' | 'text' | 'notes' | 'document'>('none');
  const [escapeCount, setEscapeCount] = useState(0);
  const [escapeTimer, setEscapeTimer] = useState<NodeJS.Timeout | null>(null);

  const userHexCode = `${userColors.color1}.${userColors.color2}`;

  // Escape key listener for emergency exit (3x Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEscapeCount(prev => {
          const newCount = prev + 1;
          
          // Clear any existing timer
          if (escapeTimer) {
            clearTimeout(escapeTimer);
          }
          
          // If this is the third escape, trigger emergency exit
          if (newCount >= 3) {
            // Using replace() instead of href to prevent back button navigation
            window.location.replace('https://en.wikipedia.org/wiki/Rings_of_Power#Nenya');
            return 0;
          }
          
          // Set timer to reset count after 2 seconds
          const timer = setTimeout(() => {
            setEscapeCount(0);
          }, 2000);
          setEscapeTimer(timer);
          
          return newCount;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (escapeTimer) {
        clearTimeout(escapeTimer);
      }
    };
  }, [escapeTimer]);

  const handleClearConversation = () => {
    // Reset to initial state
    setMessages([{
      id: '1',
      sender: 'nenya',
      text: getInitialGreeting()
    }]);
    setStage('initial');
  };

  const getConversationText = () => {
    return messages.map(m => `[${m.sender.toUpperCase()}]: ${m.text}`).join('\n\n');
  };

  const handleEagleDemoComplete = () => {
    setEagleDemoActive(false);
    onBackToWelcome();
  };

  const handleEagleProtocolDemo = () => {
    // Add the crisis message to the chat
    const crisisMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: "I just don't see the point anymore. I think everyone would be better off if I just disappeared for good."
    };
    
    setMessages(prev => [...prev, crisisMessage]);
    setEagleDemoActive(true);
  };

  const handlePredefinedResponse = (responseType: 'color-reflection' | 'feelings' | 'no-color' | 'chromatic-dialogue') => {
    // Immediately minimize selection section when user makes a choice
    setShowDemoSelection(false);
    
    let dialogueSequence: Message[] = [];
    
    if (responseType === 'color-reflection') {
      // Color reflection dialogue
      const color1Display = userColors.color1Name || userColors.color1.toUpperCase();
      const color2Display = userColors.color2Name || userColors.color2.toUpperCase();
      
      dialogueSequence = [
        {
          id: Date.now().toString(),
          sender: 'user',
          text: "I'd like to explore what these colors mean to me."
        },
        {
          id: (Date.now() + 1).toString(),
          sender: 'nenya',
          text: `I appreciate your willingness to explore this. You chose ${color1Display} as your present state and ${color2Display} as your potential state. When you look at ${color1Display}, what feeling or quality does it evoke in you right now?`
        },
        {
          id: (Date.now() + 2).toString(),
          sender: 'user',
          text: `When I think about ${color1Display}, I feel a sense of heaviness and tiredness. It's like I'm carrying something.`
        },
        {
          id: (Date.now() + 3).toString(),
          sender: 'nenya',
          text: `Thank you for sharing that. I'm hearing that ${color1Display} connects to feelings of heaviness and tiredness, and you're experiencing a sense of carrying something. I'm curious—when you feel this heaviness, what needs might be underneath that? Perhaps a need for rest, or ease, or support?`
        },
        {
          id: (Date.now() + 4).toString(),
          sender: 'user',
          text: "I think I need rest. And maybe some space to just... be."
        },
        {
          id: (Date.now() + 5).toString(),
          sender: 'nenya',
          text: `I'm hearing needs for rest and space. And when you look toward ${color2Display}—your potential state—what quality or feeling lives there for you?`
        },
        {
          id: (Date.now() + 6).toString(),
          sender: 'user',
          text: `${color2Display} feels lighter, more open. Like I can breathe.`
        },
        {
          id: (Date.now() + 7).toString(),
          sender: 'nenya',
          text: `Beautiful. So there's a movement from heaviness to lightness, from constraint to openness, from tiredness to breath. This journey you've named with color—from ${color1Display} to ${color2Display}—is a journey from a need for rest to a felt sense of ease and breathing room. Does that resonate?`
        },
        {
          id: (Date.now() + 8).toString(),
          sender: 'user',
          text: "Yes, that feels right."
        },
        {
          id: (Date.now() + 9).toString(),
          sender: 'nenya',
          text: `I'm glad that lands. In a full session, we'd continue exploring what small steps might help you move toward that lightness and breath. We'd work with the NVC+ framework to identify specific strategies that honor both your need for rest and your aspiration toward ease.`
        },
        {
          id: (Date.now() + 10).toString(),
          sender: 'system',
          text: '⚠️ DEMO NOTICE: This conversation is pre-generated for demonstration purposes only. The planned Nenya application will include an AI assistant trained in NVC+ methodology (currently under separate development), which would continue the dialogue dynamically based on your unique responses and needs.'
        },
        {
          id: (Date.now() + 11).toString(),
          sender: 'nenya',
          text: `If you'd like to continue this exploration with a live AI conversation partner, you can try our Venice AI integration. It's not the full Nenya system yet, but it can provide dynamic responses and help you continue reflecting on your needs and feelings.`
        }
      ];
    } else if (responseType === 'feelings') {
      // Direct feelings dialogue
      dialogueSequence = [
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
    } else if (responseType === 'chromatic-dialogue') {
      // Chromatic Needs Dialogue Demo - Following the 5 Phases
      const hc = userColors.color1; // Current State
      const hp = userColors.color2; // Potential State
      const hcName = userColors.color1Name || userColors.color1.toUpperCase();
      const hpName = userColors.color2Name || userColors.color2.toUpperCase();
      
      dialogueSequence = [
        {
          id: Date.now().toString(),
          sender: 'system',
          text: '⚠️ CHROMATIC NEEDS DIALOGUE DEMO ACTIVATED: This demonstration shows how Nenya analyzes your color selections to suggest pathways into deeper needs exploration. In the full system, this would be calculated using Bayesian inference based on your color choices.'
        },
        {
          id: (Date.now() + 1).toString(),
          sender: 'nenya',
          text: `Welcome. Based on my analysis of your color choices—${hcName} as your current state and ${hpName} as your potential state—I've calculated an educated guess about the core energies active for you right now. Which of these areas feels most resonant, or where would you like to begin your reflection?`
        },
        {
          id: (Date.now() + 2).toString(),
          sender: 'system',
          text: '📊 CALCULATED TRIAD OF NEEDS:\n\n1. The Spiritual Forge (Aulë) - Primary: Structure & Foundation\n2. The Compassionate River (Nienna) - Transmutative: Grief & Compassion\n3. The Champion\'s Strength (Tulkas) - Subtle: Vitality & Action\n\n[In the full system, these would be calculated from your specific color selections]'
        },
        {
          id: (Date.now() + 3).toString(),
          sender: 'user',
          text: 'I want to talk about The Spiritual Forge.'
        },
        {
          id: (Date.now() + 4).toString(),
          sender: 'nenya',
          text: `Let's explore The Spiritual Forge. Your current color was ${hcName}, suggesting a material anchor is present. But your potential color yearns for ${hpName}, indicating you seek transformation for the structure you are building. Can you describe what it feels like in your body when you focus on that need for Competence and Foundation?`
        },
        {
          id: (Date.now() + 5).toString(),
          sender: 'user',
          text: "It feels tight in my chest, like I'm waiting for permission before I start building."
        },
        {
          id: (Date.now() + 6).toString(),
          sender: 'nenya',
          text: "That 'tightness' is important information. Before we proceed deeper into this need for structure and competence, let's briefly check in with your immediate systemic needs. The Eagle Protocol will help us register your current sensory state and ground this feeling. This ensures we're building on a stable foundation."
        },
        {
          id: (Date.now() + 7).toString(),
          sender: 'system',
          text: '🦅 EAGLE PROTOCOL CHECK-IN:\n\nAir: Can you breathe freely? ✓\nWater: Are you hydrated? ✓\nFood: Have you eaten recently? ✓\nShelter: Do you feel physically safe? ✓\nRest: Are you adequately rested? ⚠️ (Tired)\n\n[In the full system, you would interactively confirm each need]'
        },
        {
          id: (Date.now() + 8).toString(),
          sender: 'nenya',
          text: "I notice the protocol flagged tiredness. That tightness in your chest and the feeling of 'waiting for permission' might be connected to your body needing rest before it can fully engage with building. Sometimes what feels like an emotional block is actually our system's wisdom saying 'not yet—restore first.'"
        },
        {
          id: (Date.now() + 9).toString(),
          sender: 'user',
          text: "That makes sense. I've been pushing myself really hard."
        },
        {
          id: (Date.now() + 10).toString(),
          sender: 'nenya',
          text: `So we have a beautiful clarity emerging: Your movement from ${hcName} to ${hpName} isn't just about building structure—it's about building *from a place of restoration*. The need for competence and foundation (The Spiritual Forge) is real, but it's calling for you to first honor your need for rest. This is the wisdom of the chromatic pathway you've chosen.`
        },
        {
          id: (Date.now() + 11).toString(),
          sender: 'user',
          text: 'What would be a small next step?'
        },
        {
          id: (Date.now() + 12).toString(),
          sender: 'nenya',
          text: "A small step might be: Before you begin any 'building' work today, give yourself explicit permission to rest for 20 minutes. Not as procrastination, but as the *first* foundational stone of what you're creating. You're not waiting for permission—you're *giving* yourself permission to build wisely."
        },
        {
          id: (Date.now() + 13).toString(),
          sender: 'user',
          text: "I can do that. Thank you."
        },
        {
          id: (Date.now() + 14).toString(),
          sender: 'nenya',
          text: "Our session is concluding. Remember, in the full Nenya system, all the data we used—the color codes, the Triad of Needs, and your sensory inputs—would be fully ephemeral and discarded when the session closes. Your journey from your current state to your potential state is yours alone to hold."
        },
        {
          id: (Date.now() + 15).toString(),
          sender: 'system',
          text: '⚠️ DEMO NOTICE: This Chromatic Needs Dialogue demonstration illustrated how color-based identity can guide needs exploration through the Pantheon of Needs framework, integrated with Eagle Protocol safety checks and Socratic questioning. The full application would feature dynamic AI-guided dialogue based on your unique responses, with all data processing happening locally and ephemerally.'
        }
      ];
    } else {
      // No color reflection dialogue
      const colorContext = userColors.color1Random || userColors.color2Random 
        ? "These are just random colors—I'd rather just talk about what I'm feeling."
        : "The colors are just my favorites—I'd rather focus on what I'm feeling.";
      
      dialogueSequence = [
        {
          id: Date.now().toString(),
          sender: 'user',
          text: colorContext
        },
        {
          id: (Date.now() + 1).toString(),
          sender: 'nenya',
          text: "That's perfectly fine—the colors are just a tool, not a requirement. What matters most is what you're experiencing and what would be helpful for you to explore. What's alive for you today?"
        },
        {
          id: (Date.now() + 2).toString(),
          sender: 'user',
          text: "I've been feeling disconnected from people. Like I'm going through the motions but not really connecting."
        },
        {
          id: (Date.now() + 3).toString(),
          sender: 'nenya',
          text: "I'm hearing feelings of disconnection, and perhaps loneliness or emptiness. It sounds like there's a need for genuine connection, for authenticity, and for being truly seen and heard. When you notice this feeling of 'going through the motions,' what's that experience like?"
        },
        {
          id: (Date.now() + 4).toString(),
          sender: 'user',
          text: "It's exhausting. I'm doing all the right things—showing up, having conversations—but it feels hollow."
        },
        {
          id: (Date.now() + 5).toString(),
          sender: 'nenya',
          text: "There's exhaustion there, and a sense that despite effort, something essential is missing. I'm hearing a need for depth, for meaning, and for authentic connection. The 'hollowness' you're describing—that's important information. It's telling you something about what you're longing for. Have there been times when connection felt different, more nourishing?"
        },
        {
          id: (Date.now() + 6).toString(),
          sender: 'user',
          text: "Yes, with my close friends. But I don't see them as often anymore."
        },
        {
          id: (Date.now() + 7).toString(),
          sender: 'nenya',
          text: "So you know what nourishing connection feels like—you've experienced it with your close friends. And right now, there's a scarcity of that kind of connection, which is contributing to this sense of hollowness and exhaustion. I'm hearing needs for deep friendship, for regularity in those connections, and for the kind of presence that nourishes rather than depletes. In a full session, we'd explore what might make it possible to cultivate more of that nourishing connection—both by potentially reconnecting with those close friends and by identifying what qualities made those friendships feel different."
        },
        {
          id: (Date.now() + 8).toString(),
          sender: 'user',
          text: "I'd like that. I miss feeling that way."
        },
        {
          id: (Date.now() + 9).toString(),
          sender: 'nenya',
          text: "That longing you're feeling—that missing—is actually pointing you toward what you need. It's your system's way of orienting you toward connection, depth, and nourishment. The work we'd continue here would help you translate that longing into concrete strategies that honor both your needs and your circumstances."
        },
        {
          id: (Date.now() + 10).toString(),
          sender: 'system',
          text: '⚠️ DEMO NOTICE: This conversation is pre-generated for demonstration purposes only. The planned Nenya application will include an AI assistant trained in NVC+ methodology (currently under separate development), which would help you develop specific practices and action steps to cultivate the kind of connection you\'re longing for.'
        },
        {
          id: (Date.now() + 11).toString(),
          sender: 'nenya',
          text: `If you'd like to continue this exploration with a live AI conversation partner, you can try our Venice AI integration. It's not the full Nenya system yet, but it can provide dynamic responses and help you continue reflecting on your needs and feelings.`
        }
      ];
    }

    // Add messages with delays using a more controlled approach
    const addMessagesSequentially = (index: number) => {
      if (index >= dialogueSequence.length) {
        setStage('dialogue-complete');
        return;
      }

      const currentMessage = dialogueSequence[index];
      if (!currentMessage) {
        setStage('dialogue-complete');
        return;
      }

      setMessages(prev => [...prev, currentMessage]);
      
      if (index + 1 < dialogueSequence.length) {
        // Longer delay for AI responses, shorter for user responses
        const delay = currentMessage.sender === 'user' ? 800 : 1800;
        setTimeout(() => addMessagesSequentially(index + 1), delay);
      } else {
        setStage('dialogue-complete');
      }
    };

    setTimeout(() => addMessagesSequentially(0), 500);
  };

  const showReflectionTint = stage === 'dialogue-complete';

  // Show PII scrubbing demo first
  if (showPIIDemo) {
    return <PIIScrubbingDemo onComplete={() => setShowPIIDemo(false)} />;
  }

  return (
    <>
      <div 
        className="size-full flex flex-col bg-background transition-colors duration-1000"
        style={showReflectionTint ? { 
          backgroundColor: `${userColors.color2}15` 
        } : undefined}
      >
        {/* Demo Banner - Collapsible */}
        {showDisclaimer ? (
          <div className="bg-yellow-50 border-b border-yellow-200">
            <div className="flex items-center justify-between gap-2 px-6 py-3">
              <div className="flex items-center gap-2 text-sm text-yellow-900 flex-1">
                <AlertCircle className="size-4 flex-shrink-0" />
                <p className="text-center flex-1">
                  <span className="font-medium">DEMONSTRATION MODE:</span> This chat interface displays pre-generated dialogue examples. The planned Nenya application will include an AI assistant trained in NVC+ methodology (currently under separate development), with automatic PII scrubbing on every message.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDisclaimer(false)}
                className="text-yellow-900 hover:bg-yellow-100 flex-shrink-0"
                title="Minimize disclaimer"
              >
                <ChevronUp className="size-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border-b border-yellow-200">
            <div className="flex items-center justify-center gap-2 px-6 py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDisclaimer(true)}
                className="text-yellow-900 hover:bg-yellow-100 text-xs"
              >
                <ChevronDown className="size-3 mr-1" />
                Show Demo Disclaimer
              </Button>
            </div>
          </div>
        )}

        {/* Header */}
        <div 
          className="border-b bg-background px-4 md:px-6 py-3 md:py-4"
          style={{
            borderBottomColor: disguiseMode === 'none' ? `${userColors.color2}40` : undefined
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <button onClick={onBackToWelcome} className="text-sm md:text-base text-muted-foreground hover:text-foreground whitespace-nowrap">
              ← Back
            </button>
            
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              {disguiseMode === 'none' && (
                <div className="hidden sm:block">
                  <NenyaLogo size={40} />
                </div>
              )}
              {disguiseMode === 'text' && (
                <div className="text-base">Messages</div>
              )}
              {disguiseMode === 'notes' && (
                <div className="text-base">Notes</div>
              )}
              {disguiseMode === 'document' && (
                <div className="text-base">Untitled Document</div>
              )}
              {disguiseMode === 'none' && (
                <div className="flex gap-1">
                <div 
                  className="rounded-full border-2 shadow-sm" 
                  style={{ 
                    backgroundColor: userColors.color1,
                    borderColor: `${userColors.color1}60`,
                    width: '24px',
                    height: '24px'
                  }}
                />
                <div 
                  className="rounded-full border-2 shadow-sm" 
                  style={{ 
                    backgroundColor: userColors.color2,
                    borderColor: `${userColors.color2}60`,
                    width: '24px',
                    height: '24px'
                  }}
                />
              </div>
              <div className="hidden sm:flex flex-col items-start min-w-0">
                <code 
                  className="text-sm font-semibold"
                  style={{
                    background: `linear-gradient(to right, ${userColors.color1}, ${userColors.color2})`,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  {userHexCode}
                </code>
                {!userColors.skippedReflection && (userColors.color1Name || userColors.color2Name || userColors.color1Random || userColors.color2Random) && (
                  <span className="text-xs text-muted-foreground truncate">
                    {userColors.color1Random ? 'Random' : (userColors.color1Name || userColors.color1)} → {userColors.color2Random ? 'Random' : (userColors.color2Name || userColors.color2)}
                  </span>
                )}
                {userColors.skippedReflection && (
                  <span className="text-xs text-muted-foreground italic">
                    Random colors
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex gap-1 items-center flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBodyMap(true)}
                title="Body Emotion Map"
                className="hidden sm:flex"
              >
                <User className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onNavigateToCell}
                className="hidden md:flex gap-1.5"
              >
                <Users className="size-4" />
                <span className="hidden lg:inline">Practice with Someone</span>
                <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0 h-auto">
                  <Sparkles className="size-3 mr-0.5" />
                  Cell
                </Badge>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onNavigateToCell}
                className="md:hidden relative"
                title="Create a Dyadic Cell"
              >
                <Users className="size-4" />
                <Sparkles className="size-2.5 absolute -top-0.5 -right-0.5 text-nenya-accent-warm" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open('https://gemini.google.com/share/137c34bc4014', '_blank')}
                title="NVC+ Resources (Gemini)"
                className="hidden sm:flex"
              >
                <ExternalLink className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPIIDemo(true)}
                title="Review Privacy Protection"
              >
                <Shield className="size-4 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEagleProtocol(true)}
                title="Eagle Protocol"
                className="hidden sm:flex"
              >
                <Waves className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Gradient Reminder Bar */}
        <div 
          className="h-1 w-full"
          style={{
            background: `linear-gradient(to right, ${userColors.color1}, ${userColors.color2})`
          }}
        />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-4 scroll-container">
          {messages.filter(m => m && m.sender && m.text).map((message) => (
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
                        background: `linear-gradient(135deg, ${userColors.color1} 0%, ${userColors.color2} 100%)`,
                        color: getReadableTextColor(getGradientMidpoint(userColors.color1, userColors.color2))
                      }
                    : undefined
                }
              >
                {message.text}
              </div>
            </div>
          ))}
          
          {/* Venice Button - Appears after demo completes */}
          {stage === 'dialogue-complete' && onNavigateToAbout && (
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
        {stage === 'initial' && (
          <div className="border-t border-border bg-background px-6 py-4 space-y-3">
            {/* Conversation Controls */}
            <div className="flex justify-center pb-2">
              <ConversationControls 
                onClearConversation={handleClearConversation}
                conversationText={getConversationText()}
                conversationName="solo-practice"
              />
            </div>

            {/* Interface Disguise Mode Controls */}
            <div className="border border-border/50 rounded-lg p-3 bg-muted/20">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-xs text-muted-foreground">
                  <Eye className="size-3 inline mr-1" />
                  <strong>Interface Disguise:</strong> Make this chat look like another app
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button
                  variant={disguiseMode === 'none' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDisguiseMode('none')}
                  className="text-xs h-8"
                >
                  <Sparkles className="size-3 mr-1" />
                  Nenya
                </Button>
                <Button
                  variant={disguiseMode === 'text' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDisguiseMode('text')}
                  className="text-xs h-8"
                >
                  <MessageSquare className="size-3 mr-1" />
                  Text App
                </Button>
                <Button
                  variant={disguiseMode === 'notes' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDisguiseMode('notes')}
                  className="text-xs h-8"
                >
                  <FileText className="size-3 mr-1" />
                  Notes
                </Button>
                <Button
                  variant={disguiseMode === 'document' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDisguiseMode('document')}
                  className="text-xs h-8"
                >
                  <FileText className="size-3 mr-1" />
                  Document
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">
                Demo feature: Interface styling will change to help maintain privacy in public spaces
              </p>
            </div>

            {/* Demo Selection Header - Collapsible */}
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground text-center flex-1">
                <strong>Choose a pre-generated demo conversation:</strong>
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDemoSelection(!showDemoSelection)}
                className="ml-2"
                title={showDemoSelection ? "Minimize selection" : "Show selection"}
              >
                {showDemoSelection ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </Button>
            </div>

            {/* Demo Selection Buttons */}
            {showDemoSelection && (
              <div className="space-y-3">
                {!userColors.skippedReflection && !userColors.color1Random && !userColors.color2Random && (
                  <>
                    <Button
                      className="w-full justify-start h-auto py-3 px-4 text-left whitespace-normal"
                      variant="outline"
                      onClick={() => handlePredefinedResponse('color-reflection')}
                      style={{
                        borderColor: `${userColors.color2}40`,
                      }}
                    >
                      Explore what my chosen colors mean to me
                    </Button>
                    <Button
                      className="w-full justify-start h-auto py-3 px-4 text-left whitespace-normal gap-2"
                      variant="outline"
                      onClick={() => handlePredefinedResponse('chromatic-dialogue')}
                      style={{
                        borderColor: `${userColors.color2}40`,
                        background: `linear-gradient(to right, ${userColors.color1}08, ${userColors.color2}08)`
                      }}
                    >
                      <Sparkles className="size-5 flex-shrink-0" style={{ color: userColors.color2 }} />
                      <span>Demo: Chromatic Needs Dialogue (Color → Pantheon → Eagle Protocol)</span>
                    </Button>
                  </>
                )}
                <Button
                  className="w-full justify-start h-auto py-3 px-4 text-left whitespace-normal"
                  variant="outline"
                  onClick={() => handlePredefinedResponse('feelings')}
                >
                  Share feelings about work stress and relationship support
                </Button>
                <Button
                  className="w-full justify-start h-auto py-3 px-4 text-left whitespace-normal"
                  variant="outline"
                  onClick={() => handlePredefinedResponse('no-color')}
                >
                  {userColors.color1Random || userColors.color2Random 
                    ? "Skip color discussion and explore feelings of disconnection"
                    : "Focus on feelings of disconnection (not color reflection)"}
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
            {!showDemoSelection && (
              <div className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDemoSelection(true)}
                  className="text-xs text-muted-foreground"
                >
                  <ChevronDown className="size-3 mr-1" />
                  Show Demo Options
                </Button>
              </div>
            )}
          </div>
        )}

        {stage === 'dialogue-complete' && (
          <div className="border-t border-border bg-background px-6 py-4">
            {/* Conversation Controls */}
            <div className="flex justify-center pb-3">
              <ConversationControls 
                onClearConversation={handleClearConversation}
                conversationText={getConversationText()}
                conversationName="solo-practice"
              />
            </div>
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                This demo dialogue has concluded. In the full application, the conversation would continue dynamically.
              </p>
              
              {/* Continue with AI Button */}
              {onNavigateToAbout && (
                <Button
                  onClick={() => onNavigateToAbout('venice-chat')}
                  size="lg"
                  className="w-full gap-2 bg-purple-700 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-500 text-white"
                >
                  <MessageCircle className="size-5" />
                  Continue with AI Chat
                  <ExternalLink className="size-5" />
                </Button>
              )}
              
              <Button onClick={onBackToWelcome} variant="outline">
                Return to Welcome Screen
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {onNavigateToAbout && <AppFooter onNavigateToAbout={onNavigateToAbout} />}

      {/* Safety Modal */}
      <SafetyModal open={showSafety} onOpenChange={setShowSafety} />

      {/* Report Modal */}
      <ReportModal isOpen={showReport} onClose={() => setShowReport(false)} />

      {/* Eagle Protocol Modal */}
      <EagleProtocolModal isOpen={showEagleProtocol} onClose={() => setShowEagleProtocol(false)} />

      {/* Eagle Protocol Transcript Flow */}
      <EagleProtocolTranscriptFlow isOpen={showEagleTranscript} onClose={() => setShowEagleTranscript(false)} />

      {/* Eagle Protocol Demo */}
      <EagleProtocolDemo isActive={eagleDemoActive} onComplete={handleEagleDemoComplete} />

      {/* Body Map Modal */}
      {showBodyMap && <BodyMapAvatar userColors={userColors} onClose={() => setShowBodyMap(false)} />}
    </>
  );
}