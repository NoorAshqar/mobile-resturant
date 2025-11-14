"use client";

import { Quote } from "lucide-react";

import { Card } from "@/components/ui/card";

const testimonials = [
  {
    quote:
      "We swapped out paper menus in 36 hours. Average table turn dropped by 22% and upsells finally feel natural.",
    name: "Layla Karim",
    role: "GM, Ember Street Food Hall",
  },
  {
    quote:
      "The multi-theme controls let our rooftop bar run neon gradients, while the cafe downstairs stays soft and neutral.",
    name: "Marco Santoro",
    role: "Owner, Riviera Collective",
  },
  {
    quote:
      "Dark mode plus QR ordering cut lights-out service issues to almost zero. The chefs get clear pacing signals now.",
    name: "Chef Nina Ortiz",
    role: "Executive Chef, Harbor & Slate",
  },
];

interface TestimonialsProps {
  title?: string;
  description?: string;
}

export function Testimonials({
  title = "Loved by busy dining rooms",
  description = "From chef-driven pop-ups to multi-level dining rooms, Kareem Eats keeps service moving.",
}: TestimonialsProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-semibold text-text-primary sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 text-base text-muted-foreground">{description}</p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <Card
            key={testimonial.name}
            className="flex h-full flex-col gap-4 rounded-3xl border border-border/70 bg-card/80 p-6 shadow-sm"
          >
            <Quote className="h-6 w-6 text-primary" />
            <p className="text-sm text-muted-foreground">{testimonial.quote}</p>
            <div>
              <p className="text-sm font-semibold">{testimonial.name}</p>
              <p className="text-xs text-muted-foreground">{testimonial.role}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
