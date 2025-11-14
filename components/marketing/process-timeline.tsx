"use client";

import { Card } from "@/components/ui/card";

const steps = [
  {
    title: "Verify your restaurant",
    detail: "Upload branding, locations, and assign table ranges.",
  },
  {
    title: "Drop in your menu",
    detail: "Bulk import CSV or sync directly from your POS.",
  },
  {
    title: "Generate smart QR kits",
    detail: "Each table gets a routed URL with optional tipping prompts.",
  },
  {
    title: "Serve & iterate",
    detail: "Real-time orders, pacing controls, and reorder nudges.",
  },
];

interface ProcessTimelineProps {
  title?: string;
  description?: string;
}

export function ProcessTimeline({
  title = "Launch in a weekend",
  description = "Everything from onboarding to guest ordering happens inside Kareem Eats. No patchwork of tools or clunky portals.",
}: ProcessTimelineProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-semibold text-text-primary sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 text-base text-muted-foreground">{description}</p>
      </div>

      <div className="mt-10 space-y-4">
        {steps.map((step, index) => (
          <Card
            key={step.title}
            className="flex flex-col gap-3 rounded-3xl border border-border/70 bg-card/80 p-6 shadow-sm sm:flex-row sm:items-center sm:gap-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-base font-semibold text-primary">
              {String(index + 1).padStart(2, "0")}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.detail}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
