import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '../app/components/ThemeProvider';
import CellPage from './CellPage';
import '../styles/index.css';
import { guardBackAfterExit } from '../lib/emergencyExit';

// After an emergency exit, Back must not bring this page back.
guardBackAfterExit();

createRoot(document.getElementById('root')!).render(
  <ThemeProvider defaultTheme="dark">
    <CellPage />
  </ThemeProvider>
);
