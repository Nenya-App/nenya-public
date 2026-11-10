import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '../app/components/ThemeProvider';
import MyTranscriptPage from './MyTranscriptPage';
import '../styles/index.css';
import { guardBackAfterExit } from '../lib/emergencyExit';

guardBackAfterExit();

createRoot(document.getElementById('root')!).render(
  <ThemeProvider defaultTheme="dark">
    <MyTranscriptPage />
  </ThemeProvider>
);
