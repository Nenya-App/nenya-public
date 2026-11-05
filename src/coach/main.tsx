import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '../app/components/ThemeProvider';
import CoachPage from './CoachPage';
import { MotionProvider, preloadMotion } from '../app/components/MotionProvider';
import '../styles/index.css';

preloadMotion();
createRoot(document.getElementById('root')!).render(
  <MotionProvider>
    <ThemeProvider defaultTheme="dark">
      <CoachPage />
    </ThemeProvider>
  </MotionProvider>
);
