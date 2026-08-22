import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const initialState: ThemeProviderState = {
  theme: 'dark',
  setTheme: () => null,
  toggleTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('nenya-theme') as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    // Use View Transitions API if available for smoother theme switching
    const updateTheme = () => {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    };

    // Check if View Transitions API is supported and document is visible
    const canUseViewTransitions =
      'startViewTransition' in document &&
      (document as any).startViewTransition &&
      document.visibilityState === 'visible';

    if (canUseViewTransitions) {
      try {
        (document as any).startViewTransition(() => {
          updateTheme();
        });
      } catch (error) {
        // Fallback to immediate update if transition fails
        updateTheme();
      }
    } else {
      // Fallback for browsers without View Transitions API or when document is hidden
      updateTheme();
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem('nenya-theme', theme);
      setTheme(theme);
    },
    toggleTheme: () => {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('nenya-theme', newTheme);
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
