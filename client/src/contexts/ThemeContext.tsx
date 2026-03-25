import React, { createContext, useContext, useEffect } from "react";

export type Theme = "dark";
export type ResolvedTheme = "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme?: () => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

const STORAGE_KEY = "theme";

const applyThemeClasses = (theme: ResolvedTheme) => {
  const root = document.documentElement;
  root.classList.add("dark");
  root.classList.remove("light");
  root.style.colorScheme = theme;
};

const DARK_THEME_CONTEXT: ThemeContextType = {
  theme: "dark",
  resolvedTheme: "dark",
  setTheme: () => undefined,
  switchable: false,
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    localStorage.removeItem(STORAGE_KEY);
    applyThemeClasses("dark");
  }, []);

  return (
    <ThemeContext.Provider value={DARK_THEME_CONTEXT}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
