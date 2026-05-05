'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { darkPalette, lightPalette } from './Palette';
import { typography } from './Typography';
//import { components } from './Components';
//import { lightComponents } from './LightComponents';

interface ThemeContextType {
  toggleDarkMode: () => void;
  isDarkMode: boolean;
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

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode: isDarkMode ? "dark" : "light",
        ...(isDarkMode ? darkPalette : lightPalette),
      },
      shape: {
        borderRadius: 8,
      },
      typography,
      //components: isDarkMode ? components : lightComponents,
    }),
    [isDarkMode]);


  return (
    <ThemeContext.Provider value={{ toggleDarkMode, isDarkMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}