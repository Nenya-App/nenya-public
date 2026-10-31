import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '../app/components/ThemeProvider';
import CoachDemo from './CoachDemo';
import '../styles/index.css';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider defaultTheme="dark">
    <CoachDemo />
  </ThemeProvider>
);
