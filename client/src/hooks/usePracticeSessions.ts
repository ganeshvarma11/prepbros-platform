import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import {
  getStoredSessions,
  mergePracticeSessions,
  type PracticeSessionRecord,
} from "@/lib/prepbro";
import { fetchRemotePracticeSessions } from "@/lib/prepbroRemote";

export function usePracticeSessions(user: User | null | undefined) {
  const [sessions, setSessions] = useState<PracticeSessionRecord[]>(() =>
    getStoredSessions()
  );
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const localSessions = getStoredSessions();

    if (!user) {
      setSessions(localSessions);
      return;
    }

    setLoading(true);
    const remoteSessions = await fetchRemotePracticeSessions(user.id);
    setSessions(mergePracticeSessions(localSessions, remoteSessions));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const sync = () => void refresh();
    window.addEventListener("focus", sync);
    window.addEventListener("storage", sync);
    window.addEventListener("prepbro:sessions-updated", sync as EventListener);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener(
        "prepbro:sessions-updated",
        sync as EventListener
      );
    };
  }, [refresh]);

  return { sessions, loading, refresh };
}
