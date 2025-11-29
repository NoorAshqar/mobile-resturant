"use client";

import { Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { ThemeToggleButton } from "./theme-toggle-button";

const navLinks = [
  { href: "/menu", label: "Menu" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/stories", label: "Stories" },
];

export function Header() {
  const pathname = usePathname();

  // Don't show header on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm font-semibold transition hover:border-primary/60 hover:text-primary cursor-pointer"
          >
            <Home className="h-4 w-4" />
            Kareem Eats
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href || pathname?.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition hover:text-primary cursor-pointer",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggleButton />
            <Button
              asChild
              variant="outline"
              className="hidden rounded-full border-2 font-semibold md:inline-flex"
            >
              <Link href="/admin">Admin</Link>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between md:hidden">
          <nav className="flex flex-1 gap-3 overflow-x-auto">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href || pathname?.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold transition cursor-pointer",
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <Button
            asChild
            size="sm"
            className="ml-3 rounded-full px-4 font-semibold md:hidden"
          >
            <Link href="/admin">Admin</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
