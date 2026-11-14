// The text of a sensory report, one function per part: the review page, the downloads (text and PDF) and the coach hand-off
// (src/lib/reportShare.ts) all use these, so what the person sees, downloads and may share is the same words.
import { surfaceLine } from './touchTextures.ts';
import { getNoteNames, TONAL_SYSTEM_LABELS, type TonalSystem } from './audio.ts';
import { describePalettePlainly } from './colorSchemes.ts';
import { shapeById } from './gatewayShapes.ts';
import { isAnswered } from './optionalSlider.ts';
import { labelFor, type MapPin } from './bodyMapParts.ts';

export type Gateway = 'sight' | 'sound' | 'touch' | 'essence' | 'movement' | 'insight';
export interface BodyMapLike {
  placements: { bodyPartId: string; color: string; colorName?: string }[];
  notes: Record<string, string>;
  /** Pins the person placed anywhere on the map (see bodyMapParts.ts). */
  pins?: MapPin[];
}

/** A line of slider answers, "Label: Pitch 40/100, Volume 60/100". Sliders that were never touched are left out (src/lib/optionalSlider.ts). */
function levels(head: string, pairs: [string, unknown][]): string | null {
  const got = pairs.filter(([, v]) => isAnswered(v)).map(([l, v]) => `${l} ${v}/100`);
  return got.length ? `${head}${got.join(', ')}` : null;
}

/** The drawings a person chose in the Movement or Insight gateway, as plain lines: the name and the one-sentence description of each. */
function shapeLine(state: 'present' | 'wish', ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  const found = ids.map((id) => (typeof id === 'string' ? shapeById(id) : undefined)).filter((x): x is NonNullable<typeof x> => !!x);
  return found.length ? [`  Drawings chosen (${state}): ${found.map((x) => `${x.label} (${x.alt})`).join(' ')}`] : [];
}

export const gatewayTitles: Record<Gateway, string> = {
  sight: 'Sight - Chromesthesia',
  sound: 'Sound - Audition',
  touch: 'Touch - Somatosensation',
  essence: 'Essence - Aromatic Memory',
  movement: 'Movement - Kinesthesia',
  insight: 'Insight - Noesis',
};

// Helper function to get body part label from ID
export const getBodyPartLabel = (bodyPartId: string, pins: MapPin[] = []): string => labelFor(bodyPartId, pins);

// The body map is shared across every gateway rather than owned by one, so
// whether it's "used" is a property of the whole map, not any single
// gateway's data -- true only if at least one color was placed or one note
// was written.
export const isBodyMapUsed = (bodyMapData: BodyMapLike): boolean =>
  bodyMapData.placements.length > 0 || Object.values(bodyMapData.notes).some((note) => note.trim().length > 0);

// One line per body part that has a color and/or a note. A part with a
// note but no color explicitly says "No color chosen" per body-part rather
// than being silently omitted or ambiguous.
export const formatBodyMapLines = (bodyMapData: BodyMapLike): string[] => {
  const lines: string[] = [];
  const partIds = new Set([
    ...bodyMapData.placements.map((p) => p.bodyPartId),
    ...Object.keys(bodyMapData.notes).filter((id) => bodyMapData.notes[id]?.trim()),
  ]);

  partIds.forEach((bodyPartId) => {
    const placement = bodyMapData.placements.find((p) => p.bodyPartId === bodyPartId);
    const note = bodyMapData.notes[bodyPartId]?.trim();
    if (!placement && !note) return;

    lines.push(getBodyPartLabel(bodyPartId, bodyMapData.pins));
    lines.push(`  Color: ${placement ? placement.colorName || placement.color : 'No color chosen'}`);
    if (note) lines.push(`  Note: ${note}`);
  });

  return lines;
};

export const formatGatewayData = (gateway: Gateway, data: any): string[] => {
  const info: string[] = [];
  
  switch (gateway) {
    case 'sight':
      if (data.color1Name) info.push(`Present: ${data.color1Name}`);
      else info.push(`Present: ${data.color1}`);
      if (data.color1Qualities && data.color1Qualities.length > 0) {
        info.push(`  Quality: ${data.color1Qualities.join(', ')}`);
      }
      if (isAnswered(data.color1Intensity)) {
        info.push(`  Intensity: ${data.color1Intensity}/100`);
      }

      if (data.color2Name) info.push(`Wish: ${data.color2Name}`);
      else info.push(`Wish: ${data.color2}`);
      if (data.color2Qualities && data.color2Qualities.length > 0) {
        info.push(`  Quality: ${data.color2Qualities.join(', ')}`);
      }
      if (isAnswered(data.color2Intensity)) {
        info.push(`  Intensity: ${data.color2Intensity}/100`);
      }
      (data.generatedPalettes ?? []).forEach((p: any, i: number) => { if (p?.colors?.length) info.push(describePalettePlainly(p, (data.generatedPalettes ?? []).length > 1 ? i + 1 : undefined)); });
      break;

    case 'sound':
      info.push(levels('Present: ', [['Pitch', data.currentPitch], ['Volume', data.currentVolume]]) ?? 'Present:');
      if (data.currentTimbres && Array.isArray(data.currentTimbres) && data.currentTimbres.length > 0) {
        info.push(`  Timbre: ${data.currentTimbres.join(', ')}`);
      } else if (data.currentTimbre) {
        info.push(`  Timbre: ${data.currentTimbre}`);
      }
      if (data.currentTimbreOther) info.push(`  Timbre (other): ${data.currentTimbreOther}`);
      if (data.currentRhythms && Array.isArray(data.currentRhythms) && data.currentRhythms.length > 0) {
        info.push(`  Rhythm: ${data.currentRhythms.join(', ')}`);
      } else if (data.currentRhythm) {
        info.push(`  Rhythm: ${data.currentRhythm}`);
      }
      if (data.currentRhythmOther) info.push(`  Rhythm (other): ${data.currentRhythmOther}`);
      if (data.currentDescription) info.push(`  Description: ${data.currentDescription}`);

      info.push(levels('Wish: ', [['Pitch', data.potentialPitch], ['Volume', data.potentialVolume]]) ?? 'Wish:');
      if (data.potentialTimbres && Array.isArray(data.potentialTimbres) && data.potentialTimbres.length > 0) {
        info.push(`  Timbre: ${data.potentialTimbres.join(', ')}`);
      } else if (data.potentialTimbre) {
        info.push(`  Timbre: ${data.potentialTimbre}`);
      }
      if (data.potentialTimbreOther) info.push(`  Timbre (other): ${data.potentialTimbreOther}`);
      if (data.potentialRhythms && Array.isArray(data.potentialRhythms) && data.potentialRhythms.length > 0) {
        info.push(`  Rhythm: ${data.potentialRhythms.join(', ')}`);
      } else if (data.potentialRhythm) {
        info.push(`  Rhythm: ${data.potentialRhythm}`);
      }
      if (data.potentialRhythmOther) info.push(`  Rhythm (other): ${data.potentialRhythmOther}`);
      if (data.potentialDescription) info.push(`  Description: ${data.potentialDescription}`);
      if (data.melody && Array.isArray(data.melody) && data.melody.some((n: number | null) => n !== null)) {
        const tonalSystem: TonalSystem = data.tonalSystem ?? 'western';
        const soundNoteNames = getNoteNames(tonalSystem);
        info.push(`Scale: ${TONAL_SYSTEM_LABELS[tonalSystem]}`);
        info.push(`Melody: ${data.melody.filter((n: number | null) => n !== null).map((n: number) => soundNoteNames[n] || '').join(' – ')}`);
        // A longer melody, one phrase for each color: the colors and the note values, as the person set them (nothing here describes how it sounds).
        if (Array.isArray(data.melodyPhrases) && data.melodyPhrases.length > 0) {
          info.push('Melody phrases, in playing order (the colors are the ones from the Sight gateway; the notes were set separately):');
          data.melodyPhrases.forEach((p: any, i: number) => {
            const kind = p?.kind === 'present' ? 'Present' : p?.kind === 'wish' ? 'Wish' : 'Palette';
            const label = String(p?.label ?? '');
            const hex = String(p?.hex ?? '');
            info.push(`  ${i + 1}. ${kind} ${label}${label.toUpperCase() === hex.toUpperCase() ? '' : ` ${hex}`}: ${p?.muted ? 'muted' : (p?.notes ?? []).map((n: number) => soundNoteNames[n] || '').join(' ')}`);
          });
        }
      }
      break;

    case 'touch':
      info.push(levels('Present: ', [['Texture', data.currentTexture], ['Temperature', data.currentTemperature]]) ?? 'Present:');
      { const l = levels('  ', [['Pressure', data.currentPressure], ['Weight', data.currentWeight], ['Sharpness', data.currentSharpness]]); if (l) info.push(l); }
      { const l = surfaceLine(data.currentSurface); if (l) info.push(`  Surface chosen from pictures: ${l}`); }
      if (data.currentDescription) info.push(`  Description: ${data.currentDescription}`);

      info.push(levels('Wish: ', [['Texture', data.potentialTexture], ['Temperature', data.potentialTemperature]]) ?? 'Wish:');
      { const l = levels('  ', [['Pressure', data.potentialPressure], ['Weight', data.potentialWeight], ['Sharpness', data.potentialSharpness]]); if (l) info.push(l); }
      { const l = surfaceLine(data.potentialSurface); if (l) info.push(`  Surface chosen from pictures: ${l}`); }
      if (data.potentialDescription) info.push(`  Description: ${data.potentialDescription}`);
      break;
      
    case 'essence':
      if (data.currentTastes && Array.isArray(data.currentTastes) && data.currentTastes.length > 0) {
        info.push(`Present Taste: ${data.currentTastes.join(', ')}`);
      } else if (data.currentTaste) {
        info.push(`Present Taste: ${data.currentTaste}`);
      }
      if (data.currentTasteOther) info.push(`  Taste (other): ${data.currentTasteOther}`);
      if (data.currentScents && Array.isArray(data.currentScents) && data.currentScents.length > 0) {
        info.push(`  Scent: ${data.currentScents.join(', ')}`);
      } else if (data.currentScent) {
        info.push(`  Scent: ${data.currentScent}`);
      }
      if (data.currentScentOther) info.push(`  Scent (other): ${data.currentScentOther}`);
      if (isAnswered(data.currentIntensity)) info.push(`  Intensity: ${data.currentIntensity}/100`);
      if (data.currentDescription) info.push(`  Description: ${data.currentDescription}`);

      if (data.potentialTastes && Array.isArray(data.potentialTastes) && data.potentialTastes.length > 0) {
        info.push(`Potential Taste: ${data.potentialTastes.join(', ')}`);
      } else if (data.potentialTaste) {
        info.push(`Potential Taste: ${data.potentialTaste}`);
      }
      if (data.potentialTasteOther) info.push(`  Taste (other): ${data.potentialTasteOther}`);
      if (data.potentialScents && Array.isArray(data.potentialScents) && data.potentialScents.length > 0) {
        info.push(`  Scent: ${data.potentialScents.join(', ')}`);
      } else if (data.potentialScent) {
        info.push(`  Scent: ${data.potentialScent}`);
      }
      if (data.potentialScentOther) info.push(`  Scent (other): ${data.potentialScentOther}`);
      if (isAnswered(data.potentialIntensity)) info.push(`  Intensity: ${data.potentialIntensity}/100`);
      if (data.potentialDescription) info.push(`  Description: ${data.potentialDescription}`);
      break;

    case 'movement':
      if (data.currentDirections && Array.isArray(data.currentDirections) && data.currentDirections.length > 0) {
        info.push(`Present Direction: ${data.currentDirections.join(', ')}`);
      } else if (data.currentDirection) {
        info.push(`Present Direction: ${data.currentDirection}`);
      }
      if (data.currentDirectionOther) info.push(`  Direction (other): ${data.currentDirectionOther}`);
      if (isAnswered(data.currentEnergy)) info.push(`  Energy: ${data.currentEnergy}/100`);
      if (isAnswered(data.currentSpeed)) info.push(`  Speed: ${data.currentSpeed}/100`);
      if (data.currentQualities && Array.isArray(data.currentQualities) && data.currentQualities.length > 0) {
        info.push(`  Quality: ${data.currentQualities.join(', ')}`);
      } else if (data.currentQuality) {
        info.push(`  Quality: ${data.currentQuality}`);
      }
      if (data.currentQualityOther) info.push(`  Quality (other): ${data.currentQualityOther}`);
      if (data.currentDescription) info.push(`  Description: ${data.currentDescription}`);
      if (data.currentMovementDrawing) info.push(`  Drawing: captured`);
      info.push(...shapeLine('present', data.currentMovementShapes));

      if (data.potentialDirections && Array.isArray(data.potentialDirections) && data.potentialDirections.length > 0) {
        info.push(`Potential Direction: ${data.potentialDirections.join(', ')}`);
      } else if (data.potentialDirection) {
        info.push(`Potential Direction: ${data.potentialDirection}`);
      }
      if (data.potentialDirectionOther) info.push(`  Direction (other): ${data.potentialDirectionOther}`);
      if (isAnswered(data.potentialEnergy)) info.push(`  Energy: ${data.potentialEnergy}/100`);
      if (isAnswered(data.potentialSpeed)) info.push(`  Speed: ${data.potentialSpeed}/100`);
      if (data.potentialQualities && Array.isArray(data.potentialQualities) && data.potentialQualities.length > 0) {
        info.push(`  Quality: ${data.potentialQualities.join(', ')}`);
      } else if (data.potentialQuality) {
        info.push(`  Quality: ${data.potentialQuality}`);
      }
      if (data.potentialQualityOther) info.push(`  Quality (other): ${data.potentialQualityOther}`);
      if (data.potentialDescription) info.push(`  Description: ${data.potentialDescription}`);
      if (data.potentialMovementDrawing) info.push(`  Drawing: captured`);
      info.push(...shapeLine('wish', data.potentialMovementShapes));
      break;

    case 'insight':
      if (data.currentPatterns && Array.isArray(data.currentPatterns) && data.currentPatterns.length > 0) {
        info.push(`Present Pattern: ${data.currentPatterns.join(', ')}`);
      } else if (data.currentPattern) {
        info.push(`Present Pattern: ${data.currentPattern}`);
      }
      if (data.currentPatternOther) info.push(`  Pattern (other): ${data.currentPatternOther}`);
      if (isAnswered(data.currentClarity)) info.push(`  Clarity: ${data.currentClarity}/100`);
      if (isAnswered(data.currentDepth)) info.push(`  Depth: ${data.currentDepth}/100`);
      if (data.currentPerspectives && Array.isArray(data.currentPerspectives) && data.currentPerspectives.length > 0) {
        info.push(`  Perspective: ${data.currentPerspectives.join(', ')}`);
      } else if (data.currentPerspective) {
        info.push(`  Perspective: ${data.currentPerspective}`);
      }
      if (data.currentPerspectiveOther) info.push(`  Perspective (other): ${data.currentPerspectiveOther}`);
      if (data.currentDescription) info.push(`  Description: ${data.currentDescription}`);
      if (data.currentPatternDrawing) info.push(`  Drawing: captured`);
      info.push(...shapeLine('present', data.currentPatternShapes));

      if (data.potentialPatterns && Array.isArray(data.potentialPatterns) && data.potentialPatterns.length > 0) {
        info.push(`Potential Pattern: ${data.potentialPatterns.join(', ')}`);
      } else if (data.potentialPattern) {
        info.push(`Potential Pattern: ${data.potentialPattern}`);
      }
      if (data.potentialPatternOther) info.push(`  Pattern (other): ${data.potentialPatternOther}`);
      if (isAnswered(data.potentialClarity)) info.push(`  Clarity: ${data.potentialClarity}/100`);
      if (isAnswered(data.potentialDepth)) info.push(`  Depth: ${data.potentialDepth}/100`);
      if (data.potentialPerspectives && Array.isArray(data.potentialPerspectives) && data.potentialPerspectives.length > 0) {
        info.push(`  Perspective: ${data.potentialPerspectives.join(', ')}`);
      } else if (data.potentialPerspective) {
        info.push(`  Perspective: ${data.potentialPerspective}`);
      }
      if (data.potentialPerspectiveOther) info.push(`  Perspective (other): ${data.potentialPerspectiveOther}`);
      if (data.potentialDescription) info.push(`  Description: ${data.potentialDescription}`);
      if (data.potentialPatternDrawing) info.push(`  Drawing: captured`);
      info.push(...shapeLine('wish', data.potentialPatternShapes));
      break;
  }
  
  return info.length > 0 ? info : ['No data captured'];
};

