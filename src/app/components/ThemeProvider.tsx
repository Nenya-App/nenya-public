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
  // In-memory only, by design: the theme choice is not persisted across
  // sessions, so every fresh visit starts from `defaultTheme` regardless
  // of what was picked last time -- consistent with the rest of the app
  // storing nothing about a visitor between sessions.
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  // One-time cleanup: a visitor who used the app before this was made
  // ephemeral may still have the old persisted value sitting in their
  // browser. It's never read anymore, but leaving it there would still be
  // retained information, which is exactly what this is meant to avoid.
  useEffect(() => {
    localStorage.removeItem('nenya-theme');
  }, []);

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
      setTheme(theme);
    },
    toggleTheme: () => {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
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
