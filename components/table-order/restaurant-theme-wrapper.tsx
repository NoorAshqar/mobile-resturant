"use client";

import { useEffect, type ReactNode } from "react";
import { themePresets, type ThemePresetId, isThemePresetId, defaultThemePresetId } from "@/config/theme-presets";

interface RestaurantThemeWrapperProps {
  children: ReactNode;
  themePalette?: string;
  themeMode?: string;
}

export function RestaurantThemeWrapper({
  children,
  themePalette,
  themeMode,
}: RestaurantThemeWrapperProps) {
  useEffect(() => {
    // Determine the palette and mode
    const paletteId: ThemePresetId = themePalette && isThemePresetId(themePalette) 
      ? themePalette 
      : defaultThemePresetId;
    
    const mode = themeMode === "dark" ? "dark" : "light";
    
    // Get the theme variables
    const preset = themePresets[paletteId];
    const vars = preset[mode];
    
    // Apply theme variables to root element with !important
    const root = document.documentElement;
    
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value, "important");
    });
    
    // Cleanup function to restore original theme (optional)
    return () => {
      Object.keys(vars).forEach((key) => {
        root.style.removeProperty(key);
      });
    };
  }, [themePalette, themeMode]);

  return <>{children}</>;
}

