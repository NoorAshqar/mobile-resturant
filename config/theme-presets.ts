"use client";

export type ThemePresetId = "sunset" | "lagoon" | "velvet";

type CssVarMap = Record<string, string>;

export interface ThemePreset {
  id: ThemePresetId;
  label: string;
  tagline: string;
  preview: [string, string, string];
  light: CssVarMap;
  dark: CssVarMap;
}

const baseLight = {
  "--foreground": "#111827",
  "--muted-foreground": "#6b7280",
  "--accent-foreground": "#111827",
  "--text-primary": "#111827",
};

const baseDark = {
  "--foreground": "#f5f5f5",
  "--muted-foreground": "#d1d5db",
  "--accent-foreground": "#f5f5f5",
  "--text-primary": "#f5f5f5",
};

export const themePresets: Record<ThemePresetId, ThemePreset> = {
  sunset: {
    id: "sunset",
    label: "Sunset Citrus",
    tagline: "Vibrant oranges with warm neutrals",
    preview: ["#ff6b35", "#ffc857", "#ffe8dc"],
    light: {
      ...baseLight,
      "--background": "#fffaf5",
      "--card": "#ffffff",
      "--card-foreground": "#201a16",
      "--primary": "#ff6b35",
      "--primary-foreground": "#ffffff",
      "--secondary": "#ffe8dc",
      "--secondary-foreground": "#8f2a1b",
      "--accent": "#ffe0cc",
      "--muted": "#fff1e8",
      "--border": "#ffe0cc",
      "--ring": "#ffb997",
    },
    dark: {
      ...baseDark,
      "--background": "#1b100d",
      "--card": "#1f1410",
      "--card-foreground": "#fdf4ef",
      "--primary": "#ff8a5c",
      "--primary-foreground": "#241108",
      "--secondary": "#2b140d",
      "--secondary-foreground": "#ffd7c0",
      "--accent": "#34160d",
      "--muted": "#2b140d",
      "--border": "#3a1a12",
      "--ring": "#ffb997",
    },
  },
  lagoon: {
    id: "lagoon",
    label: "Lagoon Breeze",
    tagline: "Seafoam blues with crisp whites",
    preview: ["#0ba5e9", "#7cd4fd", "#e0f2fe"],
    light: {
      ...baseLight,
      "--background": "#f4fbff",
      "--card": "#ffffff",
      "--card-foreground": "#10212d",
      "--primary": "#0ba5e9",
      "--primary-foreground": "#f0f9ff",
      "--secondary": "#e0f2fe",
      "--secondary-foreground": "#035388",
      "--accent": "#c7e8ff",
      "--muted": "#f0f8ff",
      "--border": "#cde9fb",
      "--ring": "#7cd4fd",
    },
    dark: {
      ...baseDark,
      "--background": "#071b26",
      "--card": "#0b2533",
      "--card-foreground": "#eff8ff",
      "--primary": "#36bffa",
      "--primary-foreground": "#041018",
      "--secondary": "#0f2a3a",
      "--secondary-foreground": "#a5defc",
      "--accent": "#123347",
      "--muted": "#102b3c",
      "--border": "#133a50",
      "--ring": "#36bffa",
    },
  },
  velvet: {
    id: "velvet",
    label: "Velvet Night",
    tagline: "Rich purples with luxe copper",
    preview: ["#6b21a8", "#c084fc", "#f5e1ff"],
    light: {
      ...baseLight,
      "--background": "#fbf7ff",
      "--card": "#ffffff",
      "--card-foreground": "#201125",
      "--primary": "#6b21a8",
      "--primary-foreground": "#f5e1ff",
      "--secondary": "#f5e1ff",
      "--secondary-foreground": "#4c126f",
      "--accent": "#e9ccff",
      "--muted": "#f8edff",
      "--border": "#efd7ff",
      "--ring": "#c084fc",
    },
    dark: {
      ...baseDark,
      "--background": "#160a1c",
      "--card": "#1e1025",
      "--card-foreground": "#f9efff",
      "--primary": "#c084fc",
      "--primary-foreground": "#1b0b24",
      "--secondary": "#2a0b3f",
      "--secondary-foreground": "#f5e1ff",
      "--accent": "#341248",
      "--muted": "#2a0b3f",
      "--border": "#3b1552",
      "--ring": "#c084fc",
    },
  },
};

export const defaultThemePresetId: ThemePresetId = "sunset";

export function isThemePresetId(value: string): value is ThemePresetId {
  return value === "sunset" || value === "lagoon" || value === "velvet";
}
