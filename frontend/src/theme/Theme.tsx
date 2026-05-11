'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { darkPalette, lightPalette } from './Palette';
import { cataventoDarkPalette, cataventoLightPalette } from './PaletteParty';
import { typography } from './Typography';
//import { components } from './Components';
//import { lightComponents } from './LightComponents';

export type ThemeVariant = 'default' | 'party';

interface ThemeContextType {
  toggleDarkMode: () => void;
  isDarkMode: boolean;
  themeVariant: ThemeVariant;
  toggleThemeVariant: () => void;
}

declare module '@mui/material/Tab' {
  interface TabOwnProps {
    variant?: "contained" | "default"
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
};

interface ThemeModeProviderProps {
  children: ReactNode;
}

export default function ThemeModeProvider({ children }: ThemeModeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [themeVariant, setThemeVariant] = useState<ThemeVariant>('default');

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);
  const toggleThemeVariant = () => setThemeVariant((prev) => prev === 'default' ? 'party' : 'default');

  const theme = useMemo(() => {
    const isParty = themeVariant === 'party';
    const palette = isParty
      ? (isDarkMode ? cataventoDarkPalette : cataventoLightPalette)
      : (isDarkMode ? darkPalette : lightPalette);

    return createTheme({
      palette: {
        mode: isDarkMode ? 'dark' : 'light',
        ...palette,
      },
      shape: {
        borderRadius: isParty ? 12 : 8,
      },
      typography,
      //components: isDarkMode ? components : lightComponents,
    });
  }, [isDarkMode, themeVariant]);

  return (
    <ThemeContext.Provider value={{ toggleDarkMode, isDarkMode, themeVariant, toggleThemeVariant }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}