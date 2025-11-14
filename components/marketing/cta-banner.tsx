"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

interface CtaBannerProps {
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export function CtaBanner({
  title = "Ready to modernize every table?",
  description = "Launch Kareem Eats this weekend and give guests a seamless, on-brand ordering flow.",
  primaryLabel = "Create my restaurant",
  primaryHref = "/admin/signup",
  secondaryLabel = "Preview menu",
  secondaryHref = "/menu",
}: CtaBannerProps) {
  return (
    <section className="mx-auto max-w-5xl rounded-[32px] border border-border bg-card/80 px-6 py-12 text-center shadow-lg sm:px-10">
      <h2 className="text-3xl font-semibold text-text-primary sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 text-base text-muted-foreground">{description}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg" className="rounded-full px-8 font-semibold">
          <Link href={primaryHref}>{primaryLabel}</Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="rounded-full px-8 font-semibold"
        >
          <Link href={secondaryHref}>{secondaryLabel}</Link>
        </Button>
      </div>
    </section>
  );
}
