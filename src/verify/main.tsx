import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '../app/components/ThemeProvider';
import VerifyPage from './VerifyPage';
import '../styles/index.css';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider defaultTheme="dark">
    <VerifyPage />
  </ThemeProvider>
);
