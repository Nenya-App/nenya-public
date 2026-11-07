import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '../app/components/ThemeProvider';
import AdminPage from './AdminPage';
import '../styles/index.css';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider defaultTheme="dark">
    <AdminPage />
  </ThemeProvider>
);
