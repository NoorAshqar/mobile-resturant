"use client";

import { HeroSection } from "@/components/marketing/hero-section";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { Testimonials } from "@/components/marketing/testimonials";
import { MetricsStrip } from "@/components/marketing/metrics-strip";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { SiteFooter } from "@/components/marketing/site-footer";

export function PricingLandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-10 sm:py-16">
        <HeroSection
          align="left"
          eyebrow="Pricing"
          title="Transparent plans, 14-day trial"
          subtitle="Every plan includes unlimited menu edits, table QR links, and theme presets. Upgrade as your dining room scales."
          primaryCta={{ label: "Start free trial", href: "/admin/signup" }}
          secondaryCta={{ label: "Need enterprise?", href: "/stories" }}
          stats={[
            { label: "Avg ROI", value: "7x" },
            { label: "Launch time", value: "48 hrs" },
            { label: "Support CSAT", value: "4.9/5" },
          ]}
        />
        <PricingPlans />
        <MetricsStrip
          compact
          items={[
            { label: "Implementation", value: "Included", helper: "Remote support" },
            { label: "Theme editor", value: "Included", helper: "All plans" },
            { label: "Staff seats", value: "Unlimited", helper: "No per-seat fee" },
            { label: "Payment cut", value: "0%", helper: "Keep your tips" },
          ]}
        />
        <Testimonials
          title="Operators trust us with their margins"
          description="Their precise control over branding and dark mode keeps both guests and managers happy."
        />
        <CtaBanner
          title="Try Kareem Eats risk-free"
          description="Spin up a QR experience, test it with staff, and cancel anytime during the trial."
          primaryLabel="Launch free trial"
          secondaryLabel="Talk to sales"
          secondaryHref="/admin"
        />
      </main>
      <SiteFooter />
    </div>
  );
}
