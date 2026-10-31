import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '../app/components/ThemeProvider';
import CoachPage from './CoachPage';
import '../styles/index.css';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider defaultTheme="dark">
    <CoachPage />
  </ThemeProvider>
);
