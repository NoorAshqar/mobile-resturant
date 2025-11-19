"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/header";

export function HeaderWrapper() {
  const pathname = usePathname();
  
  // Hide header on table ordering pages
  if (pathname.match(/\/[^/]+\/[^/]+\/?$/)) {
    return null;
  }
  
  return <Header />;
}
