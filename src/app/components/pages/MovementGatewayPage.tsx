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
import { lensPathOn, cleanPoints, simplifyPoints, pathWords, type PathPoint } from '../../../lib/lensActivities';
import { PathActivity } from '../LensActivities';
import { ShapePicker, MAX_SHAPES } from '../ShapePicker';
import { L } from '../../../lib/vocabulary';
interface MovementGatewayPageProps {
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
    title: L('Welcome to the Movement Gateway'),
    description: L('Emotions have a kinesthetic quality - they move us. In this gateway, you\'ll explore the directional flow of your inner experience.'),
    detail: 'Consider how your feelings want to move: Are they rising, falling, spiraling? What direction and speed do they carry?'
  },
  {
    title: 'Following the Flow',
    description: 'You\'ll describe two kinesthetic states: where you are now (Present) and where you\'re moving toward (Potential).',
    detail: 'Trust the body\'s wisdom. Movement patterns reveal the deeper currents of our emotional landscape.'
  },
  {
    title: 'Everything is Optional',
    description: 'You can describe all dimensions or focus on just what feels most alive. Skip anything that doesn\'t resonate.',
    detail: 'This ritual adapts to whatever level of kinesthetic awareness feels accessible right now.'
  }
];

export default function MovementGatewayPage({ onComplete, onBack, currentIndex, totalGateways, userColors, bodyMapData, onUpdateBodyMap, initialData }: MovementGatewayPageProps) {
  const tray = lensTrayOn();
  const init = tray && initialData && ('currentEnergy' in initialData || 'currentMovementShapes' in initialData) ? initialData : null;
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
    const pick: TrayCard = { stage: 'present', title: 'Choose a drawing', parts: [0] }, sliders: TrayCard = { stage: 'present', title: 'Energy and speed', parts: [2, 3, 8] }, words: TrayCard = { stage: 'present', title: 'In words', parts: [1, 4, 6] };
    const present: TrayCard[] = [pick, sliders, words, { stage: 'present', title: lensPathOn() ? 'The path of movement' : 'Draw your movement', parts: lensPathOn() ? [7] : [5] }];
    const wish: TrayCard[] = [pick, sliders, words, ...(lensPathOn() ? [] : [{ stage: 'present', title: 'Draw your movement', parts: [5] } as TrayCard])].map((c) => ({ ...c, stage: 'wish' as const }));
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
  const [currentMovementShapes, setCurrentMovementShapes] = useState<string[]>(init?.currentMovementShapes ?? []);
  const [currentDirections, setCurrentDirections] = useState<string[]>(init?.currentDirections ?? []);
  const [currentDirectionOther, setCurrentDirectionOther] = useState(init?.currentDirectionOther ?? '');
  const [currentEnergy, setCurrentEnergy] = useState(() => (typeof init?.currentEnergy === 'number' ? [init.currentEnergy] : unsetSlider()));
  const [currentSpeed, setCurrentSpeed] = useState(() => (typeof init?.currentSpeed === 'number' ? [init.currentSpeed] : unsetSlider()));
  const [currentQualities, setCurrentQualities] = useState<string[]>(init?.currentQualities ?? []);
  const [currentQualityOther, setCurrentQualityOther] = useState(init?.currentQualityOther ?? '');
  const [movementPath, setMovementPath] = useState<PathPoint[]>(() => cleanPoints(init?.movementPath));
  const [currentMovementDrawing, setCurrentMovementDrawing] = useState<string | null>(init?.currentMovementDrawing ?? null);

  // Potential state
  const [potentialMovementShapes, setPotentialMovementShapes] = useState<string[]>(init?.potentialMovementShapes ?? []);
  const [potentialDirections, setPotentialDirections] = useState<string[]>(init?.potentialDirections ?? []);
  const [potentialDirectionOther, setPotentialDirectionOther] = useState(init?.potentialDirectionOther ?? '');
  const [potentialEnergy, setPotentialEnergy] = useState(() => (typeof init?.potentialEnergy === 'number' ? [init.potentialEnergy] : unsetSlider()));
  const [potentialSpeed, setPotentialSpeed] = useState(() => (typeof init?.potentialSpeed === 'number' ? [init.potentialSpeed] : unsetSlider()));
  const [potentialQualities, setPotentialQualities] = useState<string[]>(init?.potentialQualities ?? []);
  const [potentialQualityOther, setPotentialQualityOther] = useState(init?.potentialQualityOther ?? '');
  // The description boxes follow the words chosen (and the words added with Add) until the person writes in them (owner's comment sheet, 2026-11-18).
  const currentDesc = useAutoDescription(init?.currentDescription ?? '', [...currentDirections, ...currentQualities]);
  const potentialDesc = useAutoDescription(init?.potentialDescription ?? '', [...potentialDirections, ...potentialQualities]);
  const [potentialMovementDrawing, setPotentialMovementDrawing] = useState<string | null>(init?.potentialMovementDrawing ?? null);

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
      currentMovementShapes: currentMovementShapes.length > 0 ? currentMovementShapes : null,
      potentialMovementShapes: potentialMovementShapes.length > 0 ? potentialMovementShapes : null,
      currentDirections: currentDirections.length > 0 ? currentDirections : null,
      currentDirectionOther: currentDirectionOther || null,
      currentEnergy: sliderValue(currentEnergy),
      currentSpeed: sliderValue(currentSpeed),
      currentQualities: currentQualities.length > 0 ? currentQualities : null,
      currentQualityOther: currentQualityOther || null,
      currentDescription: currentDesc.value || null,
      currentMovementDrawing: currentMovementDrawing || null,
      potentialDirections: potentialDirections.length > 0 ? potentialDirections : null,
      potentialDirectionOther: potentialDirectionOther || null,
      potentialEnergy: sliderValue(potentialEnergy),
      potentialSpeed: sliderValue(potentialSpeed),
      potentialQualities: potentialQualities.length > 0 ? potentialQualities : null,
      potentialQualityOther: potentialQualityOther || null,
      potentialDescription: potentialDesc.value || null,
      potentialMovementDrawing: potentialMovementDrawing || null,
      // The optional path (VITE_LENS_PATH): words for the report and the coach, points for the PDF thumbnail and for reopening. Old drafts have neither key.
      ...(lensPathOn() && movementPath.length ? { movementPath: simplifyPoints(movementPath), movementPathWords: pathWords(movementPath, currentQualities) } : {})
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
                Movement - Kinesthesia
                <GatewaySubtitleLink href="https://open.lib.umn.edu/sensationandperception/chapter/kinesthesia-and-prorioception/" />
              </h1>
              {!tray && <GatewayProgress index={currentIndex} total={totalGateways} />}
            </div>
          </div>
          
          {tray ? <PutThisDown onClick={onBack} name={'Movement'} /> : <div className="w-20" />}
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
                  <CardDescription>The kinesthetic qualities of where you are now</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const b = [
                  <div key="m0" className="space-y-2">
                    <Label id="currentMovement-shapes-label" className="text-sm">Choose a drawing that is close (optional)</Label>
                    <ShapePicker soft={tray} set="movement" idPrefix="currentMovement" selected={currentMovementShapes} onToggle={(id) => toggleShape(id, currentMovementShapes, setCurrentMovementShapes)} />
                    {pendingWord && pendingWord.list === currentMovementShapes && <FewerWarning onAdd={() => { pendingWord.setter([...pendingWord.list, pendingWord.value]); setPendingWord(null); }} onKeep={() => setPendingWord(null)} />}
                  </div>,
                  <div key="m1" className="space-y-2">
                    <Label className="text-sm">Direction (optional)</Label>
                    <WordPicker category="direction" idPrefix="currentDirections" selected={currentDirections} onToggle={(t) => handleCheckboxChange(t, !currentDirections.includes(t), currentDirections, setCurrentDirections)} {...(tray ? { onAddText: currentDesc.add } : { other: { value: currentDirectionOther, onChange: setCurrentDirectionOther, placeholder: "Describe..." } })} />
                    {pendingWord && pendingWord.list === currentDirections && <FewerWarning onAdd={() => { pendingWord.setter([...pendingWord.list, pendingWord.value]); setPendingWord(null); }} onKeep={() => setPendingWord(null)} />}
                  </div>,
                  <SnappingSlider key="m2"
                    value={currentEnergy}
                    onValueChange={setCurrentEnergy}
                    label="Energy"
                    leftLabel="Depleted"
                    rightLabel="Surging"
                    max={100}
                  />,
                  <SnappingSlider key="m3"
                    value={currentSpeed}
                    onValueChange={setCurrentSpeed}
                    label="Speed"
                    leftLabel="Glacial"
                    rightLabel="Frenetic"
                    max={100}
                  />,
                  <div key="m4" className="space-y-2">
                    <Label className="text-sm">Quality (optional)</Label>
                    <WordPicker category="quality" idPrefix="currentQualities" selected={currentQualities} onToggle={(t) => handleCheckboxChange(t, !currentQualities.includes(t), currentQualities, setCurrentQualities)} {...(tray ? { onAddText: currentDesc.add } : { other: { value: currentQualityOther, onChange: setCurrentQualityOther, placeholder: "Describe..." } })} />
                    {pendingWord && pendingWord.list === currentQualities && <FewerWarning onAdd={() => { pendingWord.setter([...pendingWord.list, pendingWord.value]); setPendingWord(null); }} onKeep={() => setPendingWord(null)} />}
                  </div>,
                  <div key="m5" className="space-y-2">
                    <Label className="text-sm">Draw your movement pattern (optional)</Label>
                    <DrawingCanvas
                      strokeColor={color1}
                      initialDataUrl={init?.currentMovementDrawing}
                      onChange={setCurrentMovementDrawing}
                    />
                  </div>,
                  <div key="m6" className="space-y-2">
                    <Label className="text-sm">Describe the movement (optional)</Label>
                    <Textarea
                      placeholder="Describe the kinesthetic qualities..."
                      value={currentDesc.value}
                      onChange={(e) => currentDesc.setValue(e.target.value)}
                      className="min-h-20 resize-none text-sm"
                    />
                    {currentDesc.edited && tray && <button type="button" onClick={currentDesc.reset} className="min-h-11 text-xs underline underline-offset-4 text-muted-foreground">Fill it from my choices again</button>}
                  </div>
                    ];
                    b[8] = <LensPreview key="prev" kind="movement" speed={sliderValue(currentSpeed)} energy={sliderValue(currentEnergy)} direction={currentDirections[0] ?? null} />;
                    b[7] = <PathActivity key="act" points={movementPath} feel={currentQualities} onChange={setMovementPath} />;
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
                  <CardDescription>The kinesthetic qualities of where you're moving toward</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const b = [
                  <div key="m0" className="space-y-2">
                    <Label id="potentialMovement-shapes-label" className="text-sm">Choose a drawing that is close (optional)</Label>
                    <ShapePicker soft={tray} set="movement" idPrefix="potentialMovement" selected={potentialMovementShapes} onToggle={(id) => toggleShape(id, potentialMovementShapes, setPotentialMovementShapes)} />
                    {pendingWord && pendingWord.list === potentialMovementShapes && <FewerWarning onAdd={() => { pendingWord.setter([...pendingWord.list, pendingWord.value]); setPendingWord(null); }} onKeep={() => setPendingWord(null)} />}
                  </div>,
                  <div key="m1" className="space-y-2">
                    <Label className="text-sm">Direction (optional)</Label>
                    <WordPicker category="direction" idPrefix="potentialDirections" selected={potentialDirections} onToggle={(t) => handleCheckboxChange(t, !potentialDirections.includes(t), potentialDirections, setPotentialDirections)} {...(tray ? { onAddText: potentialDesc.add } : { other: { value: potentialDirectionOther, onChange: setPotentialDirectionOther, placeholder: "Describe..." } })} />
                    {pendingWord && pendingWord.list === potentialDirections && <FewerWarning onAdd={() => { pendingWord.setter([...pendingWord.list, pendingWord.value]); setPendingWord(null); }} onKeep={() => setPendingWord(null)} />}
                  </div>,
                  <SnappingSlider key="m2"
                    value={potentialEnergy}
                    onValueChange={setPotentialEnergy}
                    label="Energy"
                    leftLabel="Depleted"
                    rightLabel="Surging"
                    max={100}
                  />,
                  <SnappingSlider key="m3"
                    value={potentialSpeed}
                    onValueChange={setPotentialSpeed}
                    label="Speed"
                    leftLabel="Glacial"
                    rightLabel="Frenetic"
                    max={100}
                  />,
                  <div key="m4" className="space-y-2">
                    <Label className="text-sm">Quality (optional)</Label>
                    <WordPicker category="quality" idPrefix="potentialQualities" selected={potentialQualities} onToggle={(t) => handleCheckboxChange(t, !potentialQualities.includes(t), potentialQualities, setPotentialQualities)} {...(tray ? { onAddText: potentialDesc.add } : { other: { value: potentialQualityOther, onChange: setPotentialQualityOther, placeholder: "Describe..." } })} />
                    {pendingWord && pendingWord.list === potentialQualities && <FewerWarning onAdd={() => { pendingWord.setter([...pendingWord.list, pendingWord.value]); setPendingWord(null); }} onKeep={() => setPendingWord(null)} />}
                  </div>,
                  <div key="m5" className="space-y-2">
                    <Label className="text-sm">Draw your movement pattern (optional)</Label>
                    <DrawingCanvas
                      strokeColor={color2}
                      initialDataUrl={init?.potentialMovementDrawing}
                      onChange={setPotentialMovementDrawing}
                      placeholder="Trace the shape you're moving toward instead."
                    />
                  </div>,
                  <div key="m6" className="space-y-2">
                    <Label className="text-sm">Describe the movement (optional)</Label>
                    <Textarea
                      placeholder="Describe the kinesthetic qualities you're moving toward..."
                      value={potentialDesc.value}
                      onChange={(e) => potentialDesc.setValue(e.target.value)}
                      className="min-h-20 resize-none text-sm"
                    />
                    {potentialDesc.edited && tray && <button type="button" onClick={potentialDesc.reset} className="min-h-11 text-xs underline underline-offset-4 text-muted-foreground">Fill it from my choices again</button>}
                  </div>
                    ];
                    b[8] = <LensPreview key="prev" kind="movement" speed={sliderValue(potentialSpeed)} energy={sliderValue(potentialEnergy)} direction={potentialDirections[0] ?? null} />;
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
                  <h2 className="text-xl">Add Movement to your report?</h2>
                  <p className="text-sm text-muted-foreground">Everything you chose stays here until you add it. If you put it down without adding, your report says: &ldquo;Examined, not included: Movement.&rdquo;</p>
                  <AddToReport name="Movement" added={!!init} onAdd={handleNext} onPutDown={onBack} />
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
