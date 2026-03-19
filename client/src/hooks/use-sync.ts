import { useState, useEffect } from "react";

interface SyncState {
  enabled: boolean;
  lastSync: string | null;
  isSyncing: boolean;
}

const STORAGE_KEY = "habitracker-sync";

function load(): SyncState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { enabled: false, lastSync: null, isSyncing: false };
}

export function useSync() {
  const [state, setState] = useState<SyncState>(load);

  useEffect(() => {
    const { isSyncing: _, ...toSave } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [state]);

  const toggleEnabled = () => {
    setState((prev) => ({ ...prev, enabled: !prev.enabled }));
  };

  const syncNow = async () => {
    setState((prev) => ({ ...prev, isSyncing: true }));
    await new Promise((r) => setTimeout(r, 1800));
    setState({
      enabled: true,
      lastSync: new Date().toISOString(),
      isSyncing: false,
    });
  };

  return { state, toggleEnabled, syncNow };
}
