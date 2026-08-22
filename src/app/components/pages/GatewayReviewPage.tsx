import { Button } from '../ui/button';
import { ArrowRight, Edit2, Eye, Music, Hand, Sparkles, Zap, Brain, Download, User, FileText } from 'lucide-react';
import NenyaLogo from '../NenyaLogo';
import { Gateway, GatewayData } from '../../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { BodyMapData } from '../BodyMapAvatar';
// jsPDF is only needed if the visitor clicks "Download PDF Report" -- loaded
// on demand inside downloadPDFReport() instead of shipped with every page.
import { NOTE_NAMES } from '../../../lib/audio';

interface GatewayReviewPageProps {
  gatewayData: GatewayData[];
  selectedGateways: Gateway[];
  onContinue: () => void;
  onEditGateway: (gateway: Gateway) => void;
}

const gatewayIcons = {
  sight: Eye,
  sound: Music,
  touch: Hand,
  essence: Sparkles,
  movement: Zap,
  insight: Brain,
};

const gatewayTitles = {
  sight: 'Sight - Chromesthesia',
  sound: 'Sound - Sonesthesia',
  touch: 'Touch - Haptic Resonance',
  essence: 'Essence - Aromatic Memory',
  movement: 'Movement - Kinesthesia',
  insight: 'Insight - Noesis',
};

// Helper function to get body part label from ID
const getBodyPartLabel = (bodyPartId: string): string => {
  const labels: { [key: string]: string } = {
    'head': 'Head',
    'throat': 'Throat',
    'chest': 'Chest',
    'stomach': 'Stomach',
    'left-shoulder': 'L. Shoulder',
    'right-shoulder': 'R. Shoulder',
    'left-arm': 'L. Arm',
    'right-arm': 'R. Arm',
    'left-hand': 'L. Hand',
    'right-hand': 'R. Hand',
    'pelvis': 'Pelvis',
    'left-leg': 'L. Leg',
    'right-leg': 'R. Leg',
    'left-foot': 'L. Foot',
    'right-foot': 'R. Foot',
  };
  return labels[bodyPartId] || bodyPartId;
};

const formatGatewayData = (gateway: Gateway, data: any): string[] => {
  const info: string[] = [];
  
  switch (gateway) {
    case 'sight':
      if (data.color1Name) info.push(`Present: ${data.color1Name}`);
      else info.push(`Present: ${data.color1}`);
      if (data.color1Qualities && data.color1Qualities.length > 0) {
        info.push(`  Quality: ${data.color1Qualities.join(', ')}`);
      }
      if (data.color1Intensity !== undefined) {
        info.push(`  Intensity: ${data.color1Intensity}/100`);
      }

      if (data.color2Name) info.push(`Wish: ${data.color2Name}`);
      else info.push(`Wish: ${data.color2}`);
      if (data.color2Qualities && data.color2Qualities.length > 0) {
        info.push(`  Quality: ${data.color2Qualities.join(', ')}`);
      }
      if (data.color2Intensity !== undefined) {
        info.push(`  Intensity: ${data.color2Intensity}/100`);
      }

      // Add body map info if available
      if (data.bodyMap && data.bodyMap.placements && data.bodyMap.placements.length > 0) {
        info.push(`Body Map: ${data.bodyMap.placements.length} locations mapped`);
      }
      break;
      
    case 'sound':
      info.push(`Present: Pitch ${data.currentPitch}/100, Volume ${data.currentVolume}/100`);
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
      
      info.push(`Wish: Pitch ${data.potentialPitch}/100, Volume ${data.potentialVolume}/100`);
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
        info.push(`Melody: ${data.melody.filter((n: number | null) => n !== null).map((n: number) => NOTE_NAMES[n] || '').join(' – ')}`);
      }
      break;

    case 'touch':
      info.push(`Present: Texture ${data.currentTexture}/100, Temperature ${data.currentTemperature}/100`);
      info.push(`  Pressure: ${data.currentPressure}/100, Weight: ${data.currentWeight}/100`);
      if (data.currentDescription) info.push(`  Description: ${data.currentDescription}`);

      info.push(`Wish: Texture ${data.potentialTexture}/100, Temperature ${data.potentialTemperature}/100`);
      info.push(`  Pressure: ${data.potentialPressure}/100, Weight: ${data.potentialWeight}/100`);
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
      if (data.currentIntensity) info.push(`  Intensity: ${data.currentIntensity}/100`);
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
      if (data.potentialIntensity) info.push(`  Intensity: ${data.potentialIntensity}/100`);
      if (data.potentialDescription) info.push(`  Description: ${data.potentialDescription}`);
      break;
      
    case 'movement':
      if (data.currentDirections && Array.isArray(data.currentDirections) && data.currentDirections.length > 0) {
        info.push(`Present Direction: ${data.currentDirections.join(', ')}`);
      } else if (data.currentDirection) {
        info.push(`Present Direction: ${data.currentDirection}`);
      }
      if (data.currentDirectionOther) info.push(`  Direction (other): ${data.currentDirectionOther}`);
      if (data.currentEnergy) info.push(`  Energy: ${data.currentEnergy}/100`);
      if (data.currentSpeed) info.push(`  Speed: ${data.currentSpeed}/100`);
      if (data.currentQualities && Array.isArray(data.currentQualities) && data.currentQualities.length > 0) {
        info.push(`  Quality: ${data.currentQualities.join(', ')}`);
      } else if (data.currentQuality) {
        info.push(`  Quality: ${data.currentQuality}`);
      }
      if (data.currentQualityOther) info.push(`  Quality (other): ${data.currentQualityOther}`);
      if (data.currentDescription) info.push(`  Description: ${data.currentDescription}`);
      
      if (data.potentialDirections && Array.isArray(data.potentialDirections) && data.potentialDirections.length > 0) {
        info.push(`Potential Direction: ${data.potentialDirections.join(', ')}`);
      } else if (data.potentialDirection) {
        info.push(`Potential Direction: ${data.potentialDirection}`);
      }
      if (data.potentialDirectionOther) info.push(`  Direction (other): ${data.potentialDirectionOther}`);
      if (data.potentialEnergy) info.push(`  Energy: ${data.potentialEnergy}/100`);
      if (data.potentialSpeed) info.push(`  Speed: ${data.potentialSpeed}/100`);
      if (data.potentialQualities && Array.isArray(data.potentialQualities) && data.potentialQualities.length > 0) {
        info.push(`  Quality: ${data.potentialQualities.join(', ')}`);
      } else if (data.potentialQuality) {
        info.push(`  Quality: ${data.potentialQuality}`);
      }
      if (data.potentialQualityOther) info.push(`  Quality (other): ${data.potentialQualityOther}`);
      if (data.potentialDescription) info.push(`  Description: ${data.potentialDescription}`);
      break;
      
    case 'insight':
      if (data.currentPatterns && Array.isArray(data.currentPatterns) && data.currentPatterns.length > 0) {
        info.push(`Present Pattern: ${data.currentPatterns.join(', ')}`);
      } else if (data.currentPattern) {
        info.push(`Present Pattern: ${data.currentPattern}`);
      }
      if (data.currentPatternOther) info.push(`  Pattern (other): ${data.currentPatternOther}`);
      if (data.currentClarity) info.push(`  Clarity: ${data.currentClarity}/100`);
      if (data.currentDepth) info.push(`  Depth: ${data.currentDepth}/100`);
      if (data.currentPerspectives && Array.isArray(data.currentPerspectives) && data.currentPerspectives.length > 0) {
        info.push(`  Perspective: ${data.currentPerspectives.join(', ')}`);
      } else if (data.currentPerspective) {
        info.push(`  Perspective: ${data.currentPerspective}`);
      }
      if (data.currentPerspectiveOther) info.push(`  Perspective (other): ${data.currentPerspectiveOther}`);
      if (data.currentDescription) info.push(`  Description: ${data.currentDescription}`);
      
      if (data.potentialPatterns && Array.isArray(data.potentialPatterns) && data.potentialPatterns.length > 0) {
        info.push(`Potential Pattern: ${data.potentialPatterns.join(', ')}`);
      } else if (data.potentialPattern) {
        info.push(`Potential Pattern: ${data.potentialPattern}`);
      }
      if (data.potentialPatternOther) info.push(`  Pattern (other): ${data.potentialPatternOther}`);
      if (data.potentialClarity) info.push(`  Clarity: ${data.potentialClarity}/100`);
      if (data.potentialDepth) info.push(`  Depth: ${data.potentialDepth}/100`);
      if (data.potentialPerspectives && Array.isArray(data.potentialPerspectives) && data.potentialPerspectives.length > 0) {
        info.push(`  Perspective: ${data.potentialPerspectives.join(', ')}`);
      } else if (data.potentialPerspective) {
        info.push(`  Perspective: ${data.potentialPerspective}`);
      }
      if (data.potentialPerspectiveOther) info.push(`  Perspective (other): ${data.potentialPerspectiveOther}`);
      if (data.potentialDescription) info.push(`  Description: ${data.potentialDescription}`);
      break;
  }
  
  return info.length > 0 ? info : ['No data captured'];
};

export default function GatewayReviewPage({ 
  gatewayData, 
  selectedGateways, 
  onContinue,
  onEditGateway 
}: GatewayReviewPageProps) {
  
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
      
      const dataLines = formatGatewayData(gd.gateway, gd.data);
      dataLines.forEach(line => {
        report += `${line}\n`;
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

  const downloadPDFReport = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // Helper to add new page if needed
    const checkPageBreak = (neededSpace: number) => {
      if (yPos + neededSpace > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };

    // Color palette
    const goldColor = [218, 198, 130]; // #DAC682
    const warmBrown = [26, 21, 18]; // #1A1512
    const textGray = [100, 100, 100];

    // Header with Nenya branding
    doc.setFillColor(goldColor[0], goldColor[1], goldColor[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(warmBrown[0], warmBrown[1], warmBrown[2]);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('NENYA', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Sensory Reflection Report', pageWidth / 2, 30, { align: 'center' });

    yPos = 50;

    // Timestamp
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.setFontSize(9);
    const timestamp = new Date().toLocaleString();
    doc.text(`Generated: ${timestamp}`, margin, yPos);
    yPos += 15;

    // Privacy notice
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    const privacyText = doc.splitTextToSize(
      'This sensory report is a tool for your personal reflection. You can use this with a therapist, spiritual counselor, or other trusted guide. Nenya is designed to support your sovereignty - you choose what to share, when to share, and how to use your own data.',
      pageWidth - (margin * 2)
    );
    privacyText.forEach((line: string) => {
      doc.text(line, margin, yPos);
      yPos += 5;
    });
    yPos += 10;

    // Gateways
    doc.setFont('helvetica', 'normal');
    gatewayData.forEach((gd, index) => {
      checkPageBreak(30);

      // Gateway title
      doc.setFillColor(goldColor[0], goldColor[1], goldColor[2]);
      doc.rect(margin, yPos - 5, pageWidth - (margin * 2), 12, 'F');

      doc.setTextColor(warmBrown[0], warmBrown[1], warmBrown[2]);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(gatewayTitles[gd.gateway].toUpperCase(), margin + 3, yPos + 3);
      yPos += 15;

      // Gateway data
      doc.setTextColor(textGray[0], textGray[1], textGray[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const dataLines = formatGatewayData(gd.gateway, gd.data);
      dataLines.forEach(line => {
        checkPageBreak(7);

        if (line.startsWith('  ')) {
          // Indented line
          doc.setFont('helvetica', 'italic');
          doc.text(line, margin + 5, yPos);
        } else {
          doc.setFont('helvetica', 'bold');
          doc.text(line, margin, yPos);
        }
        yPos += 6;
      });

      yPos += 8;
    });

    // Footer
    checkPageBreak(30);
    yPos = pageHeight - 30;
    doc.setFillColor(goldColor[0], goldColor[1], goldColor[2]);
    doc.rect(0, yPos - 5, pageWidth, 40, 'F');

    doc.setTextColor(warmBrown[0], warmBrown[1], warmBrown[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('This report was generated by Nenya (nenya.app)', pageWidth / 2, yPos + 5, { align: 'center' });
    doc.text('An empathy gym for evolved leadership', pageWidth / 2, yPos + 11, { align: 'center' });
    doc.text('Privacy-first • User-sovereign • Open & Transparent', pageWidth / 2, yPos + 17, { align: 'center' });

    // Save the PDF
    doc.save(`nenya-sensory-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };
  
  return (
    <div className="size-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-4 md:px-6 py-4">
        <div className="flex items-center justify-center gap-3">
          <NenyaLogo size={32} />
          <div className="text-center">
            <h1 className="text-xl">Gateway Review</h1>
            <p className="text-sm text-muted-foreground">
              Review and adjust your sensory pathways
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto scroll-container">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-8">
          {/* Introduction */}
          <div className="text-center space-y-4">
            <h2 className="text-2xl md:text-3xl">
              Your {selectedGateways.length} {selectedGateways.length === 1 ? 'Gateway' : 'Gateways'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              You can review and modify any of your gateway selections before continuing. 
              These sensory pathways will guide your conversation and help create your unique space for reflection.
            </p>
            
            {/* Download Report Info */}
            <div className="bg-muted/30 border border-border rounded-lg p-4 max-w-2xl mx-auto shadow-[0_0_15px_rgba(218,198,130,0.3)] dark:shadow-[0_0_20px_rgba(218,198,130,0.25)]">
              <p className="text-sm text-muted-foreground mb-3">
                <span className="text-foreground bg-nenya-gold/20 px-1.5 py-0.5 rounded">Your data, your choice:</span> You can download this sensory reflection to use with a therapist, spiritual counselor, or trusted guide. Our goal is to create helpful tools for your self-reflection — not to demand you use AI or share more data than you wish to share.
              </p>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                <Button
                  variant="default"
                  onClick={downloadPDFReport}
                  className="gap-2 shadow-[0_0_10px_rgba(218,198,130,0.3)] dark:shadow-[0_0_12px_rgba(218,198,130,0.25)]"
                >
                  <FileText className="size-4" />
                  Download PDF Report
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadReport}
                  className="gap-2 shadow-[0_0_10px_rgba(218,198,130,0.3)] dark:shadow-[0_0_12px_rgba(218,198,130,0.25)] border-nenya-gold/30 hover:border-nenya-gold/50"
                >
                  <Download className="size-4" />
                  Download Text Report
                </Button>
              </div>
            </div>
          </div>

          {/* Gateway Cards */}
          <div className="grid gap-4">
            {gatewayData.map((gd) => {
              const Icon = gatewayIcons[gd.gateway];
              const dataLines = formatGatewayData(gd.gateway, gd.data);
              
              return (
                <Card key={gd.gateway} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="mt-1 flex-shrink-0">
                          <Icon className="size-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg">
                            {gatewayTitles[gd.gateway]}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {gd.gateway === 'sight' && 'Color-based emotional mapping'}
                            {gd.gateway === 'sound' && 'Sonic qualities of your inner landscape'}
                            {gd.gateway === 'touch' && 'Physical sensations and textures'}
                            {gd.gateway === 'essence' && 'Scent and aromatic associations'}
                            {gd.gateway === 'movement' && 'Direction and flow of energy'}
                            {gd.gateway === 'insight' && 'Patterns of understanding'}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditGateway(gd.gateway)}
                        className="gap-2 flex-shrink-0"
                      >
                        <Edit2 className="size-3.5" />
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1 text-sm">
                      {dataLines.map((line, idx) => (
                        <div 
                          key={idx} 
                          className={line.startsWith('  ') ? 'text-muted-foreground pl-4' : ''}
                        >
                          {line}
                        </div>
                      ))}
                    </div>
                    
                    {/* Display Body Map if available (Sight gateway only) */}
                    {gd.gateway === 'sight' && gd.data.bodyMap && gd.data.bodyMap.imageDataUrl && (
                      <div className="border-t border-border pt-4 mt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <User className="size-4" />
                            Body Emotion Map
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.download = `nenya-body-map-${new Date().toISOString().split('T')[0]}.jpg`;
                              link.href = gd.data.bodyMap.imageDataUrl;
                              link.click();
                            }}
                            className="gap-2"
                          >
                            <Download className="size-3.5" />
                            Download
                          </Button>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-4 flex justify-center">
                          <img 
                            src={gd.data.bodyMap.imageDataUrl} 
                            alt="Body emotion map" 
                            className="max-w-full h-auto rounded"
                            style={{ maxHeight: '300px' }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Continue Button */}
          <div className="flex justify-center pt-8">
            <Button
              size="lg"
              onClick={onContinue}
              className="gap-2 px-12"
            >
              Continue to Session
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}