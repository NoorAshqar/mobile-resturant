"use client";

import { cn } from "@/components/ui/utils";

interface MetricsStripProps {
  items?: Array<{ label: string; value: string; helper?: string }>;
  compact?: boolean;
}

const defaultItems = [
  { label: "QR tables live", value: "640+", helper: "Across 42 cities" },
  { label: "Order accuracy", value: "99.2%", helper: "With kitchen routing" },
  { label: "Time to launch", value: "48 hrs", helper: "From signup to live" },
  { label: "Guest reviews", value: "4.8 ★", helper: "Avg. diner rating" },
];

export function MetricsStrip({
  items = defaultItems,
  compact = false,
}: MetricsStripProps) {
  return (
    <section
      className={cn(
        "mx-auto mt-10 max-w-6xl rounded-3xl border border-border bg-card/70 shadow-sm",
        compact ? "p-4" : "p-6 sm:p-8",
      )}
    >
      <div className="grid gap-6 text-center sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="space-y-1">
            <p className="text-2xl font-semibold text-text-primary">
              {item.value}
            </p>
            <p className="text-sm font-semibold text-muted-foreground">
              {item.label}
            </p>
            {item.helper ? (
              <p className="text-xs text-muted-foreground">{item.helper}</p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
