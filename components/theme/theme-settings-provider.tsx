"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTheme } from "next-themes";

import {
    defaultThemePresetId,
    isThemePresetId,
    themePresets,
    ThemePreset,
    ThemePresetId,
} from "@/config/theme-presets";

const STORAGE_KEY = "mr-theme-palette";

interface ThemeSettingsContextValue {
  paletteId: ThemePresetId;
  setPaletteId: (id: ThemePresetId) => void;
  preset: ThemePreset;
}

const ThemeSettingsContext =
  createContext<ThemeSettingsContextValue | null>(null);

export function ThemeSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const [paletteId, setPaletteId] = useState<ThemePresetId>(() => {
    if (typeof window === "undefined") {
      return defaultThemePresetId;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored && isThemePresetId(stored)
      ? stored
      : defaultThemePresetId;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, paletteId);
  }, [paletteId]);

  useEffect(() => {
    if (!resolvedTheme) {
      return;
    }

    const preset = themePresets[paletteId];
    const mode = resolvedTheme === "dark" ? "dark" : "light";
    const vars = preset[mode];
    const root = document.documentElement;

    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    root.dataset.palette = preset.id;
  }, [paletteId, resolvedTheme]);

  const value = useMemo(
    () => ({
      paletteId,
      setPaletteId,
      preset: themePresets[paletteId],
    }),
    [paletteId],
  );

  return (
    <ThemeSettingsContext.Provider value={value}>
      {children}
    </ThemeSettingsContext.Provider>
  );
}

export function useThemeSettings() {
  const context = useContext(ThemeSettingsContext);
  if (!context) {
    throw new Error(
      "useThemeSettings must be used within a ThemeSettingsProvider",
    );
  }

  return context;
}
