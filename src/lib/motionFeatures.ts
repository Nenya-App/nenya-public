// The animation engine, in its own file so it downloads after the page first paints instead of
// before it. MotionProvider loads this; nothing else should import it. domMax is used (not the
// smaller domAnimation) because the breathing counter can be dragged.
export { domMax as default } from 'motion/react';
