import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useTheme } from "@/contexts/ThemeContext";
import {
  DEFAULT_PREFERENCES,
  getStoredPreferences,
  setStoredPreferences,
  type PrepPreferences,
} from "@/lib/prepbro";

type PrepPreferencesContextValue = {
  preferences: PrepPreferences;
  updatePreferences: (patch: Partial<PrepPreferences>) => void;
};

const PrepPreferencesContext = createContext<
  PrepPreferencesContextValue | undefined
>(undefined);

export function PrepPreferencesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [preferences, setPreferences] = useState<PrepPreferences>(() =>
    getStoredPreferences()
  );
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setStoredPreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.language = preferences.language;
    root.lang = preferences.language;
  }, [preferences.language]);

  useEffect(() => {
    setTheme(preferences.adaptiveDarkMode ? "system" : "light");
  }, [preferences.adaptiveDarkMode, setTheme]);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "prepbros-dark",
      resolvedTheme === "dark"
    );
  }, [resolvedTheme]);

  const value = useMemo(
    () => ({
      preferences,
      updatePreferences: (patch: Partial<PrepPreferences>) => {
        setPreferences(current => ({ ...current, ...patch }));
      },
    }),
    [preferences]
  );

  return (
    <PrepPreferencesContext.Provider value={value}>
      {children}
    </PrepPreferencesContext.Provider>
  );
}

export function usePrepPreferences() {
  const context = useContext(PrepPreferencesContext);
  if (!context) {
    throw new Error(
      "usePrepPreferences must be used within PrepPreferencesProvider"
    );
  }
  return context;
}

export { DEFAULT_PREFERENCES };
