"use client";

import { HeroSection } from "@/components/marketing/hero-section";
import { MenuSampler } from "@/components/marketing/menu-sampler";
import { ProcessTimeline } from "@/components/marketing/process-timeline";
import { Testimonials } from "@/components/marketing/testimonials";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { SiteFooter } from "@/components/marketing/site-footer";

export function MenuExplorerPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-10 sm:py-16">
        <HeroSection
          align="left"
          eyebrow="Menu OS"
          title="Obsessively detailed QR menus"
          subtitle="Stack seasonal variants, chef notes, and prep timers in one interface. Guests see exactly what makes your dining room special."
          primaryCta={{ label: "Design my menu", href: "/admin/signup" }}
          secondaryCta={{ label: "See pricing", href: "/pricing" }}
        />
        <MenuSampler
          title="Crafted storytelling for every section"
          description="Mix photography, prep notes, and toggles. The theme engine keeps every page cohesive, even in dark mode."
        />
        <ProcessTimeline
          title="How menu changes go live"
          description="Automated approvals, preview links, and rollback controls build confidence before you hand the QR to guests."
        />
        <Testimonials
          title="Menus that convert"
          description="Operators using Menu OS see faster re-orders and more adventurous choices."
        />
        <CtaBanner
          title="Spin up a menu in under an hour"
          description="Start from a theme preset, then tweak fonts, photography, and copy as needed."
          primaryLabel="Launch Menu OS"
          primaryHref="/admin/signup"
          secondaryHref="/features"
          secondaryLabel="View platform tour"
        />
      </main>
      <SiteFooter />
    </div>
  );
}
