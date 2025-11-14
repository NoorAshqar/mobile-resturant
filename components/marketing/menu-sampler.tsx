"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MenuSamplerProps {
  title?: string;
  description?: string;
}

const sampleMenu = [
  {
    category: "Chef picks",
    name: "Harissa Butter Salmon",
    price: 26,
    tags: ["Most loved", "Ready in 14 min"],
  },
  {
    category: "Table starters",
    name: "Charred Corn Dip",
    price: 14,
    tags: ["Shareable", "Vegetarian"],
  },
  {
    category: "Beverages",
    name: "Lychee Spritz",
    price: 12,
    tags: ["Zero proof", "Seasonal"],
  },
];

export function MenuSampler({
  title = "Menus that update everywhere at once",
  description = "Highlight chef notes, dietary tags, and live prep times. Guests browse an elevated experience that mirrors your in-room ambiance.",
}: MenuSamplerProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Menu OS
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-text-primary sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">{description}</p>
          <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
            <li>• Switch photography, copy, and allergens without redeploys.</li>
            <li>• Auto-surface upsells once guests add mains to cart.</li>
            <li>• Theme-aware layouts ensure QR menus feel on-brand.</li>
          </ul>
        </div>

        <div className="space-y-4">
          {sampleMenu.map((item) => (
            <Card
              key={item.name}
              className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {item.category}
                </span>
                <p className="text-lg font-semibold">${item.price.toFixed(0)}</p>
              </div>
              <h3 className="mt-2 text-xl font-semibold">{item.name}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="rounded-full border-border/70 text-xs font-medium"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
