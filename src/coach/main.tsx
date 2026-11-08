import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '../app/components/ThemeProvider';
import CoachPage from './CoachPage';
import { MotionProvider, preloadMotion } from '../app/components/MotionProvider';
import '../styles/index.css';
import { guardBackAfterExit } from '../lib/emergencyExit';

// After an emergency exit, Back must not bring this page back.
guardBackAfterExit();

preloadMotion();
createRoot(document.getElementById('root')!).render(
  <MotionProvider>
    <ThemeProvider defaultTheme="dark">
      <CoachPage />
    </ThemeProvider>
  </MotionProvider>
);
