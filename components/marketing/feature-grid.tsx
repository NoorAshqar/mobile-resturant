"use client";

import { BadgeCheck, Layers, Leaf, Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";

const iconMap = {
  automation: Layers,
  branding: Sparkles,
  sustainability: Leaf,
  reliability: BadgeCheck,
} as const;

interface FeatureGridProps {
  eyebrow?: string;
  title?: string;
  description?: string;
}

const featureItems = [
  {
    id: "automation",
    title: "Menu automation",
    details: "Schedule specials, auto-86 items, and sync QR codes instantly.",
  },
  {
    id: "branding",
    title: "Immersive branding",
    details:
      "Apply your fonts, photography, and palette across every diner-facing screen.",
  },
  {
    id: "sustainability",
    title: "Paperless tables",
    details: "Replace menus, wait times, and pens with fast mobile ordering.",
  },
  {
    id: "reliability",
    title: "PCI compliant & resilient",
    details:
      "Edge-cached menus, offline-safe queues, and SOC2-grade infrastructure.",
  },
];

export function FeatureGrid({
  eyebrow = "Platform highlights",
  title = "The toolkit your floor staff actually loves",
  description = "Everything in Kareem Eats is built around modern floor service: low training overhead, one tap re-fires, and menu updates that land everywhere at once.",
}: FeatureGridProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-text-primary sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 text-base text-muted-foreground">{description}</p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {featureItems.map((feature) => {
          const Icon = iconMap[feature.id as keyof typeof iconMap];

          return (
            <Card
              key={feature.id}
              className="flex h-full flex-col gap-3 rounded-2xl border border-border/70 bg-card/90 p-6 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.details}</p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
