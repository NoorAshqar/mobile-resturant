"use client";

import { HeroSection } from "@/components/marketing/hero-section";
import { Testimonials } from "@/components/marketing/testimonials";
import { MetricsStrip } from "@/components/marketing/metrics-strip";
import { MenuSampler } from "@/components/marketing/menu-sampler";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { SiteFooter } from "@/components/marketing/site-footer";

const storyHighlights = [
  {
    name: "Lotus Rooftop",
    result: "+24% beverage lift",
    detail: "Guests toggle neon theme at night, leading to higher cocktail discovery.",
  },
  {
    name: "Farro & Flame",
    result: "12 min faster covers",
    detail: "Dark-mode expo screen reduces errors during late-night service.",
  },
  {
    name: "Portside Cantina",
    result: "3 new pop-ups",
    detail: "Switch palettes per pop-up crew without rebuilding the site.",
  },
];

export function StoryShowcasePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-10 sm:py-16">
        <HeroSection
          align="left"
          eyebrow="Customer stories"
          title="Dining rooms with personality"
          subtitle="Discover how teams run contrasting themes, dark mode dashboards, and consistent QR journeys."
          primaryCta={{ label: "Read the case studies", href: "/stories" }}
          secondaryCta={{ label: "Book a walkthrough", href: "/admin" }}
        />

        <section className="space-y-4 rounded-3xl border border-border/70 bg-card/80 p-6 shadow-sm">
          {storyHighlights.map((story) => (
            <div
              key={story.name}
              className="flex flex-col gap-2 border-b border-border/60 pb-4 last:border-none last:pb-0"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-lg font-semibold">{story.name}</p>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {story.result}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{story.detail}</p>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-text-primary">
              Impact across concepts
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Independent cafes to multi-level dining rooms see gains within the first few weeks.
            </p>
          </div>
          <MetricsStrip
            items={[
              { label: "Concepts profiled", value: "18", helper: "Casual to fine dining" },
              { label: "Average lift", value: "+16%", helper: "Ticket size" },
              { label: "Staff hours saved", value: "120+", helper: "Per location" },
              { label: "Theme mixes", value: "36", helper: "Combinations live" },
            ]}
          />
        </section>

        <MenuSampler
          title="Pair each concept with a theme"
          description="From neon night markets to velvet tasting rooms, mix palettes per experience without hiring an agency."
        />

        <Testimonials
          title="Voices from the floor"
          description="Managers and chefs share how Kareem Eats keeps service organized."
        />

        <CtaBanner
          title="Your story starts here"
          description="Trial multi-theme QR menus with your team this week."
          primaryLabel="Start free trial"
          primaryHref="/admin/signup"
          secondaryHref="/features"
          secondaryLabel="Explore platform"
        />
      </main>
      <SiteFooter />
    </div>
  );
}
