import React, { createContext, useContext, useEffect, useState } from "react"
import { THEMES } from "../lib/themes"

export interface CustomThemeData {
  id: string;
  name: string;
  description: string;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    primaryForeground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    card: string;
  }
}

export type Theme = string;

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "zinc",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "zinc",
  storageKey = "fretmaster-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement;
    // Remove old theme class if it exists (all classes starting with 'theme-')
    Array.from(root.classList).forEach(cls => {
      if (cls.startsWith('theme-')) root.classList.remove(cls);
    });
    root.classList.add(`theme-${theme}`);

    if (theme.startsWith('custom-')) {
      const savedCustomThemes = localStorage.getItem('fretmaster-custom-themes');
      if (savedCustomThemes) {
        try {
          const customThemes: CustomThemeData[] = JSON.parse(savedCustomThemes);
          const foundTheme = customThemes.find(t => t.id === theme);
          
          if (foundTheme) {
            const themeColors = foundTheme.colors;
            let styleEl = document.getElementById('custom-theme-style');
            if (!styleEl) {
              styleEl = document.createElement('style');
              styleEl.id = 'custom-theme-style';
              document.head.appendChild(styleEl);
            }
            styleEl.innerHTML = `
              .theme-${theme} {
                --background: ${themeColors.background};
                --foreground: ${themeColors.foreground};
                --primary: ${themeColors.primary};
                --primary-foreground: ${themeColors.primaryForeground};
                --muted: ${themeColors.muted};
                --muted-foreground: ${themeColors.mutedForeground};
                --border: ${themeColors.border};
                --card: ${themeColors.card};
                --dot-glow: drop-shadow(0 0 4px ${themeColors.primary});
              }
            `;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
