import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '../app/components/ThemeProvider';
import VerifyPage from './VerifyPage';
import '../styles/index.css';
import { guardBackAfterExit } from '../lib/emergencyExit';

guardBackAfterExit();

createRoot(document.getElementById('root')!).render(
  <ThemeProvider defaultTheme="dark">
    <VerifyPage />
  </ThemeProvider>
);
