"use client";

import { Check } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Independent",
    price: "$89",
    cadence: "per month",
    description: "Perfect for single-location concepts with under 20 tables.",
    perks: [
      "Unlimited menu updates",
      "QR kit generator",
      "Email support",
      "Theme presets",
    ],
  },
  {
    name: "Multi-venue",
    price: "$249",
    cadence: "per month",
    description: "Layered menus, multiple floors, and CRM exports included.",
    perks: [
      "Shared inventory pools",
      "Staff access control",
      "Priority chat",
      "Advanced theming",
    ],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Let’s chat",
    cadence: "",
    description:
      "National groups, dark kitchens, or stadium service with custom SLAs.",
    perks: [
      "White-glove setup",
      "Custom analytics",
      "Premium hardware kit",
      "Dedicated CSM",
    ],
  },
];

interface PricingPlansProps {
  title?: string;
  description?: string;
}

export function PricingPlans({
  title = "Uncomplicated pricing",
  description = "Pick a plan that matches your floor. All plans include tablet-friendly dashboards and unlimited URLs.",
}: PricingPlansProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16" id="pricing">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-semibold text-text-primary sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 text-base text-muted-foreground">{description}</p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`flex h-full flex-col rounded-3xl border border-border/70 bg-card/80 p-6 shadow-sm ${
              plan.highlight ? "ring-2 ring-primary/50" : ""
            }`}
          >
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                {plan.name}
              </p>
              <p className="text-3xl font-semibold">{plan.price}</p>
              {plan.cadence ? (
                <p className="text-xs text-muted-foreground">{plan.cadence}</p>
              ) : null}
              <p className="text-sm text-muted-foreground">
                {plan.description}
              </p>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              {plan.perks.map((perk) => (
                <div key={perk} className="flex items-start gap-2">
                  <span className="mt-0.5 rounded-full bg-primary/10 p-1">
                    <Check className="h-3 w-3 text-primary" />
                  </span>
                  <span>{perk}</span>
                </div>
              ))}
            </div>

            <Button className="mt-8 rounded-full" variant={plan.highlight ? "default" : "outline"}>
              {plan.highlight ? "Start free trial" : "Talk to sales"}
            </Button>
          </Card>
        ))}
      </div>
    </section>
  );
}
