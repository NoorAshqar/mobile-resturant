"use client";

import { HeroSection } from "@/components/marketing/hero-section";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { MetricsStrip } from "@/components/marketing/metrics-strip";
import { ProcessTimeline } from "@/components/marketing/process-timeline";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { SiteFooter } from "@/components/marketing/site-footer";

export function FeatureLibraryPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-10 sm:py-16">
        <HeroSection
          align="left"
          eyebrow="Feature library"
          title="Floor-friendly, ops-approved"
          subtitle="Lightweight controls for hosts, chefs, and ops leaders. No bloated POS modules."
          primaryCta={{ label: "Try demo dashboard", href: "/admin" }}
          secondaryCta={{ label: "Download spec sheet", href: "/stories" }}
        />
        <FeatureGrid
          title="Purpose-built blocks"
          description="Each module solves a single service headache. Stack them as you need."
        />
        <MetricsStrip
          items={[
            { label: "POS partners", value: "12", helper: "Square, Toast & more" },
            { label: "Order states", value: "9", helper: "Fully customizable" },
            { label: "Theme presets", value: "3 core", helper: "Infinite tweaks" },
            { label: "Automation rules", value: "30+", helper: "No-code builder" },
          ]}
        />
        <ProcessTimeline
          title="Deployment playbook"
          description="Invite team leads, assign tables, and roll out access in minutes."
        />
        <PricingPlans
          title="Flexible plans for every floor"
          description="Switch plans anytime as you open new dining rooms."
        />
        <CtaBanner
          title="Give Kareem Eats a spin"
          description="We’ll migrate your menus and theme the guest view for you."
          primaryLabel="Book a walkthrough"
          primaryHref="/admin"
          secondaryHref="/pricing"
          secondaryLabel="Review pricing"
        />
      </main>
      <SiteFooter />
    </div>
  );
}
