"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const footerLinks = [
  {
    heading: "Product",
    items: [
      { label: "Menu OS", href: "/menu" },
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: "Stories", href: "/stories" },
      { label: "Support", href: "/admin" },
      { label: "Status", href: "#" },
    ],
  },
];

export function SiteFooter() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="mt-16 border-t border-border bg-background px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:justify-between">
        <div>
          <p className="text-lg font-semibold">Kareem Eats</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Multi-theme QR menus for modern dining rooms.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            &copy; {year || new Date().getFullYear()} Kareem Eats. All rights
            reserved.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {footerLinks.map((group) => (
            <div key={group.heading}>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {group.heading}
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground transition hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
