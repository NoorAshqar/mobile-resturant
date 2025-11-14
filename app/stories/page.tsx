import type { Metadata } from "next";

import { StoryShowcasePage } from "@/components/marketing/story-showcase-page";

export const metadata: Metadata = {
  title: "Customer Stories | Kareem Eats",
  description: "See how multi-venue operators theme their QR menus and speed up service.",
};

export default function StoriesPage() {
  return <StoryShowcasePage />;
}
