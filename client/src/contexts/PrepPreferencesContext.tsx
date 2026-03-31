import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  DEFAULT_PREFERENCES,
  getStoredPreferences,
  setStoredProfile,
  setStoredPreferences,
  type PrepPreferences,
} from "@/lib/prepbro";
import {
  loadRemotePrepPreferences,
  saveRemotePrepPreferences,
} from "@/lib/prepbroRemote";

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
  const { user } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const remoteHydratedRef = useRef(false);

  useEffect(() => {
    setStoredPreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      remoteHydratedRef.current = true;
      return;
    }

    void loadRemotePrepPreferences(user).then(remote => {
      if (cancelled) return;
      setPreferences(current => ({ ...current, ...remote.preferences }));
      setStoredProfile(remote.profile);
      remoteHydratedRef.current = true;
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.language = preferences.language;
    root.lang = preferences.language;
  }, [preferences.language]);

  useEffect(() => {
    if (!user || !remoteHydratedRef.current) return;
    void saveRemotePrepPreferences(user, preferences);
  }, [preferences, user]);

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
