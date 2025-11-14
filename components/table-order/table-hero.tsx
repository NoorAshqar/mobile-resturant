"use client";

import { ShoppingCart, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TableHeroProps {
  restaurantName: string;
  cuisine: string;
  tableNumber: number;
  capacity: number;
  totalItems: number;
  status: string;
  onBrowseMenu: () => void;
  onReviewOrder: () => void;
}

export function TableHero({
  restaurantName,
  cuisine,
  tableNumber,
  capacity,
  totalItems,
  status,
  onBrowseMenu,
  onReviewOrder,
}: TableHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-primary text-white shadow-2xl">
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative px-6 py-10 sm:px-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">Dining at</p>
            <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">{restaurantName}</h1>
            <p className="mt-3 text-base text-white/85">
              {cuisine} · Table {tableNumber}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
              <Badge className="rounded-full border-0 bg-white/15 text-white">
                {status}
              </Badge>
              <span className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-1">
                <Users className="h-4 w-4" />
                Seats {capacity}
              </span>
              <span className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-1">
                <ShoppingCart className="h-4 w-4" />
                {totalItems} item{totalItems === 1 ? "" : "s"}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={onBrowseMenu}
              className="h-12 rounded-full border border-white/40 bg-transparent px-6 text-white transition hover:bg-white/20"
              variant="secondary"
            >
              Browse menu
            </Button>
            <Button
              onClick={onReviewOrder}
              className="h-12 rounded-full bg-white px-6 text-slate-900 shadow-lg hover:bg-slate-100"
            >
              Review order
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
