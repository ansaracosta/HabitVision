import { useState, useEffect } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type AccentColor = "turquesa" | "blue" | "green" | "orange" | "red";
export type FontSize = "small" | "medium" | "large";

export interface ThemeSettings {
  theme: ThemeMode;
  accentColor: AccentColor;
  fontSize: FontSize;
  compactMode: boolean;
}

const STORAGE_KEY = "habitracker-theme";

export const ACCENT_COLORS: Record<AccentColor, string> = {
  turquesa: "hsl(174, 72%, 38%)",
  blue: "hsl(221, 83%, 53%)",
  green: "hsl(142, 71%, 45%)",
  orange: "hsl(25, 95%, 53%)",
  red: "hsl(0, 84%, 60%)",
};

const DEFAULTS: ThemeSettings = {
  theme: "light",
  accentColor: "turquesa",
  fontSize: "medium",
  compactMode: false,
};

function load(): ThemeSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.accentColor === "violet") parsed.accentColor = "turquesa";
      return { ...DEFAULTS, ...parsed };
    }
  } catch {}
  return DEFAULTS;
}

export function applyTheme(settings: ThemeSettings) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark =
    settings.theme === "dark" || (settings.theme === "system" && prefersDark);

  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.setProperty(
    "--font-scale",
    settings.fontSize === "small" ? "0.9" : settings.fontSize === "large" ? "1.1" : "1"
  );
}

const initialSettings = load();
applyTheme(initialSettings);

export function useTheme() {
  const [settings, setSettings] = useState<ThemeSettings>(initialSettings);

  useEffect(() => {
    applyTheme(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (settings.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(settings);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [settings]);

  const update = (patch: Partial<ThemeSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  return { settings, update, ACCENT_COLORS };
}
