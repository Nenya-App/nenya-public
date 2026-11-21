import { sixthLensName } from './vocabulary.ts';
// One plain sentence per gateway, for the welcome page's short overview (and anywhere else a quick summary is needed). Each says what the
// person actually does there, matching the gateway pages; nothing about what it means or does for them.
export const GATEWAY_SUMMARIES: { id: 'sight' | 'sound' | 'touch' | 'essence' | 'movement' | 'insight'; name: string; summary: string }[] = [
  { id: 'sight', name: 'Sight', summary: 'Choose two colors: one for how you feel now, one for how you would like to feel.' },
  { id: 'sound', name: 'Sound', summary: 'Hear your colors as a short melody, or make one from silence.' },
  { id: 'touch', name: 'Touch', summary: 'Describe the feeling by touch: its texture, temperature, pressure, weight and sharpness.' },
  { id: 'essence', name: 'Essence', summary: 'Describe it as a scent or a taste, and how strong it is.' },
  { id: 'movement', name: 'Movement', summary: 'Show which way it moves, with how much energy and speed, in words or a drawing.' },
  { id: 'insight', name: sixthLensName(), summary: 'Sketch the shape of your thinking: its pattern, and how clear and deep it feels.' },
];

/** Routes through the gateways by choice and order alone: one to six of them, in any order (6 + 30 + 120 + 360 + 720 + 720). */
export const GATEWAY_ROUTES = [1, 2, 3, 4, 5, 6].reduce((sum, k) => sum + Array.from({ length: k }, (_, i) => 6 - i).reduce((p, x) => p * x, 1), 0);
