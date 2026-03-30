import { ThemeProvider as NextThemesProvider } from "next-themes";

/** Persisted in localStorage under this key; inline script in index.html mirrors it to prevent flash. */
export const UI_THEME_STORAGE_KEY = "prepbros-ui-theme";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey={UI_THEME_STORAGE_KEY}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

export { useTheme } from "next-themes";
