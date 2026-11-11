import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '../app/components/ThemeProvider';
import { MotionProvider, preloadMotion } from '../app/components/MotionProvider';
import GemBench from './GemBench';
import '../styles/index.css';

preloadMotion();
createRoot(document.getElementById('root')!).render(
  <MotionProvider>
    <ThemeProvider defaultTheme="dark">
      <GemBench />
    </ThemeProvider>
  </MotionProvider>
);
