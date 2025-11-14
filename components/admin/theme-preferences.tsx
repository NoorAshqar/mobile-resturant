"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Check, Moon, Palette, Sun } from "lucide-react";
import { toast } from "sonner";

import {
  themePresets,
  type ThemePresetId,
  isThemePresetId,
} from "@/config/theme-presets";
import { useThemeSettings } from "@/components/theme/theme-settings-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";

const paletteEntries = Object.values(themePresets);
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type ThemeMode = "light" | "dark";

interface ThemePreferencesPanelProps {
  palette?: string | null;
  mode?: ThemeMode | null;
}

export function ThemePreferencesPanel({
  palette,
  mode,
}: ThemePreferencesPanelProps) {
  const { paletteId, setPaletteId } = useThemeSettings();
  const { setTheme } = useTheme();
  const [selectedMode, setSelectedMode] = useState<ThemeMode>(
    mode ?? "light",
  );
  const [isSaving, setIsSaving] = useState(false);

  const resolvedInitialPalette = useMemo(() => {
    if (palette && isThemePresetId(palette)) {
      return palette;
    }
    return null;
  }, [palette]);

  useEffect(() => {
    if (resolvedInitialPalette && resolvedInitialPalette !== paletteId) {
      setPaletteId(resolvedInitialPalette);
    }
  }, [resolvedInitialPalette, paletteId, setPaletteId]);

  useEffect(() => {
    if (mode && mode !== selectedMode) {
      setSelectedMode(mode);
      setTheme(mode);
    }
  }, [mode, selectedMode, setTheme]);

  const persistTheme = async (payload: {
    themePalette?: ThemePresetId;
    themeMode?: ThemeMode;
  }) => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/restaurant/theme`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message ?? "Failed to update theme.");
      }

      toast.success("Theme updated");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update theme.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePaletteSelect = async (id: ThemePresetId) => {
    if (id === paletteId) {
      return;
    }
    setPaletteId(id);
    await persistTheme({ themePalette: id, themeMode: selectedMode });
  };

  const handleModeSelect = async (modeValue: ThemeMode) => {
    if (modeValue === selectedMode) {
      return;
    }
    setSelectedMode(modeValue);
    setTheme(modeValue);
    await persistTheme({ themePalette: paletteId, themeMode: modeValue });
  };

  return (
    <Card className="border-2">
      <CardHeader className="flex flex-col gap-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Palette className="h-5 w-5 text-primary" />
          Customize app theme
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose a color story for diners and staff, then decide whether the
          dashboard runs in light or dark mode. Changes apply instantly.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {paletteEntries.map((preset) => {
            const isActive = preset.id === paletteId;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePaletteSelect(preset.id)}
                disabled={isSaving}
                className={cn(
                  "rounded-2xl border p-4 text-left transition",
                  isActive
                    ? "border-primary shadow-lg"
                    : "border-border hover:border-primary/60 hover:shadow-sm",
                  isSaving && "opacity-70",
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{preset.label}</p>
                  {isActive ? (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-4 w-4" />
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {preset.tagline}
                </p>
                <div className="mt-4 flex gap-1">
                  {preset.preview.map((color) => (
                    <span
                      key={color}
                      className="h-8 flex-1 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-dashed p-4">
          <p className="text-sm font-semibold">Appearance mode</p>
          <p className="text-xs text-muted-foreground">
            Applies to the dashboard immediately. Diners inherit your choice for
            their QR experience.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              type="button"
              variant={selectedMode === "light" ? "default" : "outline"}
              className="flex-1 min-w-[140px] justify-center gap-2 rounded-full"
              onClick={() => handleModeSelect("light")}
              disabled={isSaving}
            >
              <Sun className="h-4 w-4" />
              Light
            </Button>
            <Button
              type="button"
              variant={selectedMode === "dark" ? "default" : "outline"}
              className="flex-1 min-w-[140px] justify-center gap-2 rounded-full"
              onClick={() => handleModeSelect("dark")}
              disabled={isSaving}
            >
              <Moon className="h-4 w-4" />
              Dark
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
