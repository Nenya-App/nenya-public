import React, { useState, useEffect, useRef } from 'react';
import { StageSlot, StageIntro, StageNav, type PairStage } from '../GatewayStages';
import { GatewayProgress } from '../GatewayProgress';
import { Button } from '../ui/button';
import { unsetSlider, sliderValue } from '../../../lib/optionalSlider';
import { ArrowLeft, ChevronRight, ArrowRight as ArrowRightIcon, User } from 'lucide-react';
import { GatewaySubtitleLink } from '../GatewaySubtitleLink';
import PanelLogo from '../PanelLogo';
import { SnappingSlider } from '../ui/snapping-slider';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AppFooter } from '../AppFooter';
import { BodyMapAvatar, BodyMapData } from '../BodyMapAvatar';
import { DrawingCanvas } from '../DrawingCanvas';

import { WordPicker } from '../WordPicker';
import { LensPreview } from '../LensPreview';
import { useAutoDescription } from '../useAutoDescription';
import { PutThisDown, FewerNote, FewerWarning, AddToReport, LensCardNav } from '../LensCardParts';
import { lensTrayOn, needsFewerWarning } from '../../../lib/lensState';
import { lensTapestryOn, cleanLayers, tapestryWords } from '../../../lib/lensActivities';
import { TapestryActivity } from '../LensActivities';
import { ShapePicker, MAX_SHAPES } from '../ShapePicker';
import { L, sixthLensName } from '../../../lib/vocabulary';
interface InsightGatewayPageProps {
  onComplete: (data: any) => void;
  onBack: () => void;
  currentIndex: number;
  totalGateways: number;
  userColors?: { color1?: string; color2?: string };
  bodyMapData: BodyMapData;
  onUpdateBodyMap: (data: BodyMapData) => void;
  /** Tray mode: what was added before, so Edit opens with it. */
  initialData?: any;
}



const INSTRUCTION_CARDS = [
  {
    title: L('Welcome to the Insight Gateway'),
    description: L('How we organize our understanding shapes our experience. In this gateway, you\'ll explore the patterns of your thinking and knowing.'),
    detail: 'Consider the structure of your awareness: Is it clear or foggy? Deep or surface? What patterns and perspectives define how you see?'
  },
  {
    title: 'Mapping Your Understanding',
    description: 'You\'ll describe two cognitive states: where you are now (Present) and where you\'re moving toward (Potential).',
    detail: 'Trust the intelligence of how your mind naturally organizes. These patterns reveal the deeper architecture of your experience.'
  },
  {
    title: 'Everything is Optional',
    description: 'You can describe all dimensions or focus on just what feels most clear. Skip anything that doesn\'t resonate.',
    detail: 'This ritual adapts to whatever level of clarity and depth feels accessible right now.'
  }
];

export default function InsightGatewayPage({ onComplete, onBack, currentIndex, totalGateways, userColors, bodyMapData, onUpdateBodyMap, initialData }: InsightGatewayPageProps) {
  const tray = lensTrayOn();
  const init = tray && initialData && ('currentClarity' in initialData || 'currentPatternShapes' in initialData) ? initialData : null;
  // The soft limit of three in one list (tray mode): the fourth waits for a yes.
  const [pendingWord, setPendingWord] = useState<{ value: string; list: string[]; setter: (v: string[]) => void } | null>(null);
  // Step state
  const [step, setStep] = useState<'instructions' | 'selection'>('instructions');
  const [instructionCardIndex, setInstructionCardIndex] = useState(0);
  const [showBodyMap, setShowBodyMap] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<PairStage>('present');
  useEffect(() => { scrollContainerRef.current?.scrollTo({ top: 0 }); }, [stage]);
  // Tray mode: each activity is its own card (owner, 2026-11-18), the present state first, then the wish, then add. Each card shows some of the blocks of its state's card.
  type TrayCard = { stage: 'present' | 'wish' | 'add'; title: string; parts: number[] };
  const trayCards = (): TrayCard[] => {
    const pick: TrayCard = { stage: 'present', title: 'Choose a drawing', parts: [0] }, sliders: TrayCard = { stage: 'present', title: 'Clarity and depth', parts: [2, 3, 8] }, words: TrayCard = { stage: 'present', title: 'In words', parts: [1, 4, 6] };
    const present: TrayCard[] = [pick, sliders, words, { stage: 'present', title: 'Draw the shape of this pattern', parts: [5] }, ...(lensTapestryOn() ? [{ stage: 'present', title: 'The tapestry', parts: [7] } as TrayCard] : [])];
    const wish: TrayCard[] = [pick, sliders, words, { stage: 'present', title: 'Draw the shape of this pattern', parts: [5] }].map((c) => ({ ...c, stage: 'wish' as const }));
    return [...present, ...wish, { stage: 'add', title: 'Add to your report', parts: [] }];
  };
  const [trayIndex, setTrayIndex] = useState(0);
  const cards = tray ? trayCards() : [];
  const cur = tray ? cards[Math.min(trayIndex, cards.length - 1)] : null;
  const activeStage = tray ? cur!.stage : stage;
  useEffect(() => { scrollContainerRef.current?.scrollTo({ top: 0 }); }, [trayIndex]);

  // Advancing between steps swaps content inside this same persistently-
  // mounted scroll container -- it never unmounts, so nothing else resets
  // its scroll position when the step changes.
  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [step]);

  // Current state
  const [currentPatternShapes, setCurrentPatternShapes] = useState<string[]>(init?.currentPatternShapes ?? []);
  const [currentPatterns, setCurrentPatterns] = useState<string[]>(init?.currentPatterns ?? []);
  const [currentPatternOther, setCurrentPatternOther] = useState(init?.currentPatternOther ?? '');
  const [currentClarity, setCurrentClarity] = useState(() => (typeof init?.currentClarity === 'number' ? [init.currentClarity] : unsetSlider()));
  const [currentDepth, setCurrentDepth] = useState(() => (typeof init?.currentDepth === 'number' ? [init.currentDepth] : unsetSlider()));
  const [currentPerspectives, setCurrentPerspectives] = useState<string[]>(init?.currentPerspectives ?? []);
  const [currentPerspectiveOther, setCurrentPerspectiveOther] = useState(init?.currentPerspectiveOther ?? '');
  const [tapestryLayers, setTapestryLayers] = useState<string[]>(() => cleanLayers(init?.tapestryLayers));
  const [currentPatternDrawing, setCurrentPatternDrawing] = useState<string | null>(init?.currentPatternDrawing ?? null);

  // Potential state
  const [potentialPatternShapes, setPotentialPatternShapes] = useState<string[]>(init?.potentialPatternShapes ?? []);
  const [potentialPatterns, setPotentialPatterns] = useState<string[]>(init?.potentialPatterns ?? []);
  const [potentialPatternOther, setPotentialPatternOther] = useState(init?.potentialPatternOther ?? '');
  const [potentialClarity, setPotentialClarity] = useState(() => (typeof init?.potentialClarity === 'number' ? [init.potentialClarity] : unsetSlider()));
  const [potentialDepth, setPotentialDepth] = useState(() => (typeof init?.potentialDepth === 'number' ? [init.potentialDepth] : unsetSlider()));
  const [potentialPerspectives, setPotentialPerspectives] = useState<string[]>(init?.potentialPerspectives ?? []);
  const [potentialPerspectiveOther, setPotentialPerspectiveOther] = useState(init?.potentialPerspectiveOther ?? '');
  // The description boxes follow the words chosen (and the words added with Add) until the person writes in them (owner's comment sheet, 2026-11-18).
  const currentDesc = useAutoDescription(init?.currentDescription ?? '', [...currentPatterns, ...currentPerspectives]);
  const potentialDesc = useAutoDescription(init?.potentialDescription ?? '', [...potentialPatterns, ...potentialPerspectives]);
  const [potentialPatternDrawing, setPotentialPatternDrawing] = useState<string | null>(init?.potentialPatternDrawing ?? null);

  const handleCheckboxChange = (
    value: string,
    checked: boolean,
    currentValues: string[],
    setter: (values: string[]) => void
  ) => {
    if (checked && tray && needsFewerWarning(currentValues.length)) { setPendingWord({ value, list: currentValues, setter }); return; }
    if (checked) {
      setter([...currentValues, value]);
    } else {
      setter(currentValues.filter(v => v !== value));
    }
  };

  const toggleShape = (id: string, list: string[], set: (v: string[]) => void) => {
    if (tray) {
      if (!list.includes(id) && needsFewerWarning(list.length)) { setPendingWord({ value: id, list, setter: set }); return; }
      set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
      return;
    }
    set(list.includes(id) ? list.filter((x) => x !== id) : list.length < MAX_SHAPES ? [...list, id] : list);
  };

  const handleNextInstructionCard = () => {
    if (instructionCardIndex < INSTRUCTION_CARDS.length - 1) {
      setInstructionCardIndex(instructionCardIndex + 1);
    } else {
      setStep('selection');
    }
  };

  const handleNext = () => {
    onComplete({
      currentPatternShapes: currentPatternShapes.length > 0 ? currentPatternShapes : null,
      potentialPatternShapes: potentialPatternShapes.length > 0 ? potentialPatternShapes : null,
      currentPatterns: currentPatterns.length > 0 ? currentPatterns : null,
      currentPatternOther: currentPatternOther || null,
      currentClarity: sliderValue(currentClarity),
      currentDepth: sliderValue(currentDepth),
      currentPerspectives: currentPerspectives.length > 0 ? currentPerspectives : null,
      currentPerspectiveOther: currentPerspectiveOther || null,
      currentDescription: currentDesc.value || null,
      currentPatternDrawing: currentPatternDrawing || null,
      potentialPatterns: potentialPatterns.length > 0 ? potentialPatterns : null,
      potentialPatternOther: potentialPatternOther || null,
      potentialClarity: sliderValue(potentialClarity),
      potentialDepth: sliderValue(potentialDepth),
      potentialPerspectives: potentialPerspectives.length > 0 ? potentialPerspectives : null,
      potentialPerspectiveOther: potentialPerspectiveOther || null,
      potentialDescription: potentialDesc.value || null,
      potentialPatternDrawing: potentialPatternDrawing || null,
      // The optional tapestry (VITE_LENS_TAPESTRY): words for the report and the coach, layers for the PDF thumbnail and for reopening. Old drafts have neither key.
      ...(lensTapestryOn() && tapestryLayers.length ? { tapestryLayers, tapestryWords: tapestryWords(tapestryLayers) } : {})
    });
  };

  const canContinue = true; // All fields are optional

  const color1 = userColors?.color1;
  const color2 = userColors?.color2;

  return (
    <div className="size-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-3">
            <PanelLogo size={32} />
            <div className="text-center">
              <h1 className="text-lg">
                Pattern - Noesis
                <GatewaySubtitleLink href="https://en.wikipedia.org/wiki/Noesis" />
              </h1>
              {!tray && <GatewayProgress index={currentIndex} total={totalGateways} />}
            </div>
          </div>
          
          {tray ? <PutThisDown onClick={onBack} name={sixthLensName()} /> : <div className="w-20" />}
        </div>
      </div>

      {/* Main Content */}
      <div ref={scrollContainerRef} className="flex-1 overflow-auto scroll-container">
        {step === 'instructions' ? (
          /* Instruction Cards */
          <div className="h-full flex items-center justify-center px-4 sm:px-6 py-8">
            <div className="max-w-2xl w-full">
              <Card
                className="cursor-pointer transition-all hover:shadow-lg border-2"
                onClick={handleNextInstructionCard}
              >
                <CardHeader>
                  <CardTitle className="text-2xl md:text-3xl">
                    {INSTRUCTION_CARDS[instructionCardIndex].title}
                  </CardTitle>
                  <CardDescription className="text-base md:text-lg">
                    {INSTRUCTION_CARDS[instructionCardIndex].description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {INSTRUCTION_CARDS[instructionCardIndex].detail}
                  </p>
                  {tray && instructionCardIndex === 0 && <FewerNote />}
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-3">
                      <Button variant="ghost" size="sm" className="gap-1" onClick={(e) => { e.stopPropagation(); if (instructionCardIndex > 0) setInstructionCardIndex(instructionCardIndex - 1); else onBack(); }}>
                        <ArrowLeft className="size-4" /> Back
                      </Button>
                      <p className="text-sm text-muted-foreground">{instructionCardIndex + 1} of {INSTRUCTION_CARDS.length}</p>
                    </div>
                    <Button variant="ghost" className="gap-2">
                      {instructionCardIndex < INSTRUCTION_CARDS.length - 1 ? (
                        <>
                          Next <ChevronRight className="size-4" />
                        </>
                      ) : (
                        <>
                          Begin Selection <ArrowRightIcon className="size-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Selection Cards */
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
            <div className="flex justify-center">
              <Button variant="outline" size="sm" onClick={() => setShowBodyMap(true)} className="gap-2">
                <User className="size-4" />
                Open Body Map
              </Button>
            </div>
            <div className="mx-auto w-full max-w-2xl">
              {!tray && <StageIntro stage={stage} />}
              <StageSlot stage="present" current={activeStage as PairStage}>
              {/* Present State Card */}
              <Card
                className="transition-all"
                style={
                  color1
                    ? {
                        boxShadow: `0 0 20px ${color1}40, 0 0 40px ${color1}20`,
                        borderColor: `${color1}60`,
                        borderWidth: '2px'
                      }
                    : undefined
                }
              >
                <CardHeader>
                  <CardTitle>Present State</CardTitle>
                  <CardDescription>The patterns of understanding where you are now</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {(() => {
                    const b = [
                  <div key="p0" className="space-y-2">
                    <Label id="currentPattern-shapes-label" className="text-sm">Choose a drawing that is close (optional)</Label>
                    <ShapePicker soft={tray} set="pattern" idPrefix="currentPattern" selected={currentPatternShapes} onToggle={(id) => toggleShape(id, currentPatternShapes, setCurrentPatternShapes)} />
                    {pendingWord && pendingWord.list === currentPatternShapes && <FewerWarning onAdd={() => { pendingWord.setter([...pendingWord.list, pendingWord.value]); setPendingWord(null); }} onKeep={() => setPendingWord(null)} />}
                  </div>,
                  <div key="p1" className="space-y-2">
                    <Label className="text-sm">Pattern (optional)</Label>
                    <WordPicker category="pattern" idPrefix="currentPatterns" selected={currentPatterns} onToggle={(t) => handleCheckboxChange(t, !currentPatterns.includes(t), currentPatterns, setCurrentPatterns)} {...(tray ? { onAddText: currentDesc.add } : { other: { value: currentPatternOther, onChange: setCurrentPatternOther, placeholder: "Describe..." } })} />
                    {pendingWord && pendingWord.list === currentPatterns && <FewerWarning onAdd={() => { pendingWord.setter([...pendingWord.list, pendingWord.value]); setPendingWord(null); }} onKeep={() => setPendingWord(null)} />}
                  </div>,
                  <SnappingSlider key="p2"
                    value={currentClarity}
                    onValueChange={setCurrentClarity}
                    label="Clarity"
                    leftLabel="Foggy"
                    rightLabel="Crystal Clear"
                    max={100}
                  />,
                  <SnappingSlider key="p3"
                    value={currentDepth}
                    onValueChange={setCurrentDepth}
                    label="Depth"
                    leftLabel="Surface"
                    rightLabel="Profound"
                    max={100}
                  />,
                  <div key="p4" className="space-y-2">
                    <Label className="text-sm">Perspective (optional)</Label>
                    <WordPicker category="perspective" idPrefix="currentPerspectives" selected={currentPerspectives} onToggle={(t) => handleCheckboxChange(t, !currentPerspectives.includes(t), currentPerspectives, setCurrentPerspectives)} {...(tray ? { onAddText: currentDesc.add } : { other: { value: currentPerspectiveOther, onChange: setCurrentPerspectiveOther, placeholder: "Describe..." } })} />
                    {pendingWord && pendingWord.list === currentPerspectives && <FewerWarning onAdd={() => { pendingWord.setter([...pendingWord.list, pendingWord.value]); setPendingWord(null); }} onKeep={() => setPendingWord(null)} />}
                  </div>,
                  <div key="p5" className="space-y-2">
                    <Label className="text-sm">Draw the shape of this pattern (optional)</Label>
                    <DrawingCanvas
                      strokeColor={color1}
                      initialDataUrl={init?.currentPatternDrawing}
                      onChange={setCurrentPatternDrawing}
                      placeholder="Spiraling, fragmented, web-like, layered — trace it."
                    />
                  </div>,
                  <div key="p6" className="space-y-2">
                    <Label className="text-sm">Describe the patterns (optional)</Label>
                    <Textarea
                      placeholder="Describe the patterns and perspectives..."
                      value={currentDesc.value}
                      onChange={(e) => currentDesc.setValue(e.target.value)}
                      className="min-h-20 resize-none text-sm"
                    />
                    {currentDesc.edited && tray && <button type="button" onClick={currentDesc.reset} className="min-h-11 text-xs underline underline-offset-4 text-muted-foreground">Fill it from my choices again</button>}
                  </div>
                    ];
                    b[8] = <LensPreview key="prev" kind="pattern" clarity={sliderValue(currentClarity)} depth={sliderValue(currentDepth)} word={currentPatterns[0] ?? null} shapeId={currentPatternShapes[0] ?? null} />;
                    b[7] = <TapestryActivity key="act" layers={tapestryLayers} onChange={setTapestryLayers} />;
                    return tray ? (cur && cur.stage === 'present' ? cur.parts.map((n) => <React.Fragment key={n}>{b[n]}</React.Fragment>) : []) : b;
                  })()}
                </CardContent>
              </Card>

              </StageSlot>
              <StageSlot stage="wish" current={activeStage as PairStage}>
              {/* Potential State Card */}
              <Card
                className="transition-all"
                style={
                  color2
                    ? {
                        boxShadow: `0 0 20px ${color2}40, 0 0 40px ${color2}20`,
                        borderColor: `${color2}60`,
                        borderWidth: '2px'
                      }
                    : undefined
                }
              >
                <CardHeader>
                  <CardTitle>Wish State</CardTitle>
                  <CardDescription>The patterns of understanding you're moving toward</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {(() => {
                    const b = [
                  <div key="p0" className="space-y-2">
                    <Label id="potentialPattern-shapes-label" className="text-sm">Choose a drawing that is close (optional)</Label>
                    <ShapePicker soft={tray} set="pattern" idPrefix="potentialPattern" selected={potentialPatternShapes} onToggle={(id) => toggleShape(id, potentialPatternShapes, setPotentialPatternShapes)} />
                    {pendingWord && pendingWord.list === potentialPatternShapes && <FewerWarning onAdd={() => { pendingWord.setter([...pendingWord.list, pendingWord.value]); setPendingWord(null); }} onKeep={() => setPendingWord(null)} />}
                  </div>,
                  <div key="p1" className="space-y-2">
                    <Label className="text-sm">Pattern (optional)</Label>
                    <WordPicker category="pattern" idPrefix="potentialPatterns" selected={potentialPatterns} onToggle={(t) => handleCheckboxChange(t, !potentialPatterns.includes(t), potentialPatterns, setPotentialPatterns)} {...(tray ? { onAddText: potentialDesc.add } : { other: { value: potentialPatternOther, onChange: setPotentialPatternOther, placeholder: "Describe..." } })} />
                    {pendingWord && pendingWord.list === potentialPatterns && <FewerWarning onAdd={() => { pendingWord.setter([...pendingWord.list, pendingWord.value]); setPendingWord(null); }} onKeep={() => setPendingWord(null)} />}
                  </div>,
                  <SnappingSlider key="p2"
                    value={potentialClarity}
                    onValueChange={setPotentialClarity}
                    label="Clarity"
                    leftLabel="Foggy"
                    rightLabel="Crystal Clear"
                    max={100}
                  />,
                  <SnappingSlider key="p3"
                    value={potentialDepth}
                    onValueChange={setPotentialDepth}
                    label="Depth"
                    leftLabel="Surface"
                    rightLabel="Profound"
                    max={100}
                  />,
                  <div key="p4" className="space-y-2">
                    <Label className="text-sm">Perspective (optional)</Label>
                    <WordPicker category="perspective" idPrefix="potentialPerspectives" selected={potentialPerspectives} onToggle={(t) => handleCheckboxChange(t, !potentialPerspectives.includes(t), potentialPerspectives, setPotentialPerspectives)} {...(tray ? { onAddText: potentialDesc.add } : { other: { value: potentialPerspectiveOther, onChange: setPotentialPerspectiveOther, placeholder: "Describe..." } })} />
                    {pendingWord && pendingWord.list === potentialPerspectives && <FewerWarning onAdd={() => { pendingWord.setter([...pendingWord.list, pendingWord.value]); setPendingWord(null); }} onKeep={() => setPendingWord(null)} />}
                  </div>,
                  <div key="p5" className="space-y-2">
                    <Label className="text-sm">Draw the shape of this pattern (optional)</Label>
                    <DrawingCanvas
                      strokeColor={color2}
                      initialDataUrl={init?.potentialPatternDrawing}
                      onChange={setPotentialPatternDrawing}
                      placeholder="What shape would you rather your thinking take?"
                    />
                  </div>,
                  <div key="p6" className="space-y-2">
                    <Label className="text-sm">Describe the patterns (optional)</Label>
                    <Textarea
                      placeholder="Describe the patterns and perspectives you're moving toward..."
                      value={potentialDesc.value}
                      onChange={(e) => potentialDesc.setValue(e.target.value)}
                      className="min-h-20 resize-none text-sm"
                    />
                    {potentialDesc.edited && tray && <button type="button" onClick={potentialDesc.reset} className="min-h-11 text-xs underline underline-offset-4 text-muted-foreground">Fill it from my choices again</button>}
                  </div>
                    ];
                    b[8] = <LensPreview key="prev" kind="pattern" clarity={sliderValue(potentialClarity)} depth={sliderValue(potentialDepth)} word={potentialPatterns[0] ?? null} shapeId={potentialPatternShapes[0] ?? null} />;
                    return tray ? (cur && cur.stage === 'wish' ? cur.parts.map((n) => <React.Fragment key={n}>{b[n]}</React.Fragment>) : []) : b;
                  })()}
                </CardContent>
              </Card>
            </StageSlot>
              {!tray && <StageNav stage={stage} onChange={setStage} />}
              {tray && cur && cur.stage !== 'add' && (
                <>
                  <p className="text-center text-sm">{cur.title}</p>
                  <LensCardNav index={trayIndex} total={cards.length} onBack={() => setTrayIndex(Math.max(0, trayIndex - 1))} onNext={() => setTrayIndex(trayIndex + 1)} />
                </>
              )}
              {tray && cur && cur.stage === 'add' && (
                <div className="mx-auto w-full max-w-2xl space-y-4">
                  <h2 className="text-xl">Add Pattern to your report?</h2>
                  <p className="text-sm text-muted-foreground">Everything you chose stays here until you add it. If you put it down without adding, your report says: &ldquo;Examined, not included: Pattern.&rdquo;</p>
                  <AddToReport name="Pattern" added={!!init} onAdd={handleNext} onPutDown={onBack} />
                  <Button variant="ghost" onClick={() => setTrayIndex(Math.max(0, trayIndex - 1))}>Back</Button>
                </div>
              )}
            </div>

            {/* Next Button */}
            {stage === 'wish' && !tray && (
            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={handleNext}
                disabled={!canContinue}
                className="px-12"
              >
                {currentIndex + 1 < totalGateways ? L('Next Gateway') : 'Continue'}
              </Button>
            </div>
            )}
          </div>
        )}

        <AppFooter />
      </div>

      {showBodyMap && (
        <BodyMapAvatar
          userColors={color1 && color2 ? { color1, color2 } : undefined}
          onClose={() => setShowBodyMap(false)}
          onSave={(data) => onUpdateBodyMap(data)}
          initialPlacements={bodyMapData.placements}
          initialNotes={bodyMapData.notes}
          initialPins={bodyMapData.pins}
        />
      )}
    </div>
  );
}
