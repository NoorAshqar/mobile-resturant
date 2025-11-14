import type { Metadata } from "next";

import { FeatureLibraryPage } from "@/components/marketing/feature-library-page";

export const metadata: Metadata = {
  title: "Platform Features | Kareem Eats",
  description: "Explore automation, menu, and QR controls purpose-built for busy dining rooms.",
};

export default function FeaturesPage() {
  return <FeatureLibraryPage />;
}
