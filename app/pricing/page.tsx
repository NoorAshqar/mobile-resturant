import type { Metadata } from "next";

import { PricingLandingPage } from "@/components/marketing/pricing-landing-page";

export const metadata: Metadata = {
  title: "Pricing | Kareem Eats",
  description: "Transparent plans with unlimited menu edits, QR tables, and theme presets.",
};

export default function PricingPage() {
  return <PricingLandingPage />;
}
