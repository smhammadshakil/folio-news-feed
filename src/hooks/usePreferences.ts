import { defaultPreferences, parsePreferences, PREFERENCES_KEY, serializePreferences, type Preferences } from "@shared/preferences.ts";
import { useCallback, useState } from "react";

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    try {
      return parsePreferences(localStorage.getItem(PREFERENCES_KEY));
    } catch {
      return defaultPreferences;
    }
  });

  const save = useCallback((next: Preferences) => {
    localStorage.setItem(PREFERENCES_KEY, serializePreferences(next));
    setPreferences(next);
  }, []);

  const reset = useCallback(() => {
    save(defaultPreferences);
  }, [save]);

  return { preferences, save, reset };
}
