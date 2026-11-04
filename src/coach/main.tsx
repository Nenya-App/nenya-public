import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '../app/components/ThemeProvider';
import CoachPage from './CoachPage';
import { MotionProvider } from '../app/components/MotionProvider';
import '../styles/index.css';

createRoot(document.getElementById('root')!).render(
  <MotionProvider>
    <ThemeProvider defaultTheme="dark">
      <CoachPage />
    </ThemeProvider>
  </MotionProvider>
);
