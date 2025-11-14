"use client";

import { HeroSection } from "@/components/marketing/hero-section";
import { MetricsStrip } from "@/components/marketing/metrics-strip";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { MenuSampler } from "@/components/marketing/menu-sampler";
import { ProcessTimeline } from "@/components/marketing/process-timeline";
import { Testimonials } from "@/components/marketing/testimonials";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Toaster } from "@/components/ui/sonner";

export function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />
      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-10 sm:py-16">
        <HeroSection
          eyebrow="QR-native dining"
          title={
            <>
              Multi-theme menus <br className="hidden sm:block" /> for modern
              operators
            </>
          }
          subtitle="Design-rich ordering flows, dynamic menu states, and admin tools that work equally well in light or dark mode."
          primaryCta={{ label: "Create restaurant", href: "/admin/signup" }}
          secondaryCta={{ label: "Watch a 3 min demo", href: "/features" }}
          stats={[
            { label: "Tables activated", value: "640+" },
            { label: "Avg. ticket lift", value: "+18%" },
            { label: "Guest repeat rate", value: "92%" },
          ]}
        />

        <MetricsStrip />
        <FeatureGrid />
        <MenuSampler />
        <ProcessTimeline />
        <Testimonials />
        <PricingPlans />
        <CtaBanner />
      </main>
      <SiteFooter />
    </div>
  );
}
