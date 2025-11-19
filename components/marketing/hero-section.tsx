"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useThemeSettings } from "@/components/theme/theme-settings-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";

interface HeroSectionProps {
  eyebrow: string;
  title: string | React.ReactNode;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  align?: "left" | "center";
  stats?: Array<{ label: string; value: string }>;
}

export function HeroSection({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  align = "center",
  stats = [
    { label: "Orders routed", value: "2.3M+" },
    { label: "Avg. table turn", value: "18 min faster" },
    { label: "Guests retained", value: "92%" },
  ],
}: HeroSectionProps) {
  const { preset } = useThemeSettings();
  const [gradient, setGradient] = useState<string>("");

  useEffect(() => {
    setGradient(
      `linear-gradient(120deg, ${preset.preview[0]}, ${preset.preview[1]}, ${preset.preview[2]})`,
    );
  }, [preset]);

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-border bg-background shadow-xl">
      <div
        className="absolute inset-0 opacity-90"
        style={{ backgroundImage: gradient }}
        suppressHydrationWarning
      />
      <div className="relative px-6 py-16 text-black dark:text-white sm:px-12 lg:px-16">
        <div
          className={cn(
            "mx-auto flex max-w-4xl flex-col gap-8 text-center",
            align === "left" && "items-start text-left",
          )}
        >
          <span className="inline-flex w-fit items-center rounded-full border border-white/30 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            {eyebrow}
          </span>
          <div>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-4 text-base text-white/80 sm:text-lg">
              {subtitle}
            </p>
          </div>

          <div
            className={cn(
              "flex flex-wrap items-center gap-3",
              align === "center" ? "justify-center" : "justify-start",
            )}
          >
            <Button
              asChild
              size="lg"
              className="rounded-full bg-white px-8 text-base font-semibold text-slate-900 shadow-2xl hover:bg-slate-50"
            >
              <Link href={primaryCta.href}>
                {primaryCta.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {secondaryCta ? (
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="rounded-full border border-white/60 bg-transparent px-6 text-base font-semibold text-black dark:text-white hover:bg-white/10"
              >
                <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-12 grid gap-6 rounded-3xl border border-white/30 bg-white/10 p-6 text-sm sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center sm:text-left">
              <p className="text-2xl font-semibold">{stat.value}</p>
              <p className="text-white/80">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
