"use client";

import { Lock, Search, Sparkles } from "lucide-react";

import { MenuItem, MenuItemType } from "@/components/menu-item";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TableMenuViewProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filteredMenuItems: MenuItemType[];
  orderItemsByMenuId: Map<string, { id: string; quantity: number }>;
  onAddMenuItem: (menuItemId: string) => void;
  onChangeQuantity: (orderItemId: string, quantity: number) => void;
  onRemoveItem: (orderItemId: string) => void;
  isVisible: boolean;
  canEdit: boolean;
  lockMessage?: string;
}

export function TableMenuView({
  categories,
  selectedCategory,
  onSelectCategory,
  searchTerm,
  onSearchChange,
  filteredMenuItems,
  orderItemsByMenuId,
  onAddMenuItem,
  onChangeQuantity,
  onRemoveItem,
  isVisible,
  canEdit,
  lockMessage,
}: TableMenuViewProps) {
  const handleIncrement = (menuItemId: string, orderItemId?: string, quantity?: number) => {
    if (!orderItemId || quantity === undefined) {
      onAddMenuItem(menuItemId);
      return;
    }
    onChangeQuantity(orderItemId, quantity + 1);
  };

  const handleDecrement = (orderItemId?: string, quantity?: number) => {
    if (!orderItemId || quantity === undefined) {
      return;
    }
    if (quantity <= 1) {
      onRemoveItem(orderItemId);
      return;
    }
    onChangeQuantity(orderItemId, quantity - 1);
  };

  return (
    <div className={`${isVisible ? "block" : "hidden"} lg:block`}>
      <Card className="rounded-3xl border-0 bg-card p-6 text-card-foreground shadow-xl ring-1 ring-border/10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search dishes, ingredients, vibes"
              className="h-12 w-full rounded-2xl border border-border bg-muted/40 pl-12 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
          {(selectedCategory !== "All" || searchTerm) && (
            <Button
              variant="ghost"
              onClick={() => {
                onSelectCategory("All");
                onSearchChange("");
              }}
              className="h-12 rounded-2xl text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              Clear filters
            </Button>
          )}
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                selectedCategory === category
                  ? "border-transparent bg-primary text-primary-foreground shadow"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-4 w-4" />
            Pro tip
          </div>
          <p className="mt-1 text-primary/90">
            Tap a category or search for ingredients to build the perfect order. Your bill updates on the right instantly.
          </p>
        </div>

        {!canEdit ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Lock className="h-4 w-4" />
              {lockMessage ?? "Order submitted"}
            </div>
            <p className="mt-1">
              {lockMessage ??
                "This ticket is already in the kitchen. Add another dish to automatically start a fresh round for this table."}
            </p>
          </div>
        ) : null}

        {filteredMenuItems.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-border bg-muted/40 px-6 py-12 text-center">
            <p className="text-lg font-semibold text-foreground">No dishes match that vibe</p>
            <p className="mt-2 text-sm text-muted-foreground">Try a different search or reset the filters to see everything on the menu.</p>
            <Button
              variant="outline"
              className="mt-4 rounded-full border-border text-sm font-semibold"
              onClick={() => {
                onSelectCategory("All");
                onSearchChange("");
              }}
            >
              Reset filters
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {filteredMenuItems.map((item) => {
              const existing = orderItemsByMenuId.get(item.id);
              return (
                <MenuItem
                  key={item.id}
                  item={item}
                  quantity={existing?.quantity ?? 0}
                  onAdd={() => handleIncrement(item.id, existing?.id, existing?.quantity)}
                  onRemove={() => handleDecrement(existing?.id, existing?.quantity)}
                  disabled={!canEdit}
                />
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
