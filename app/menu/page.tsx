import type { Metadata } from "next";

import { MenuExplorerPage } from "@/components/marketing/menu-explorer-page";

export const metadata: Metadata = {
  title: "Menu OS | Kareem Eats",
  description: "Design-rich QR menus with chef notes, prep timers, and instant theming.",
};

export default function MenuPage() {
  return <MenuExplorerPage />;
}
