'use client';

import { useMemo, useState } from "react";
import { MapPin, Search, Star, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { colors } from "@/config/colors";
import { Cart } from "./cart";
import { MenuItem, type MenuItemType } from "./menu-item";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
}

interface CustomerMenuProps {
  restaurant: Restaurant;
  menuItems: MenuItemType[];
}

export function CustomerMenu({ restaurant, menuItems }: CustomerMenuProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<Map<string, number>>(new Map());

  const categories = useMemo(() => {
    const set = new Set<string>();
    menuItems.forEach((item) => set.add(item.category));
    return ["All", ...Array.from(set)];
  }, [menuItems]);

  const filteredItems = menuItems.filter((item) => {
    const normalisedQuery = searchQuery.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(normalisedQuery) ||
      item.description.toLowerCase().includes(normalisedQuery);
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddItem = (itemId: string) => {
    setCart((prev) => {
      const updated = new Map(prev);
      updated.set(itemId, (updated.get(itemId) ?? 0) + 1);
      return updated;
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setCart((prev) => {
      const updated = new Map(prev);
      const currentQty = updated.get(itemId) ?? 0;
      if (currentQty > 1) {
        updated.set(itemId, currentQty - 1);
      } else {
        updated.delete(itemId);
      }
      return updated;
    });
  };

  const handleClearItem = (itemId: string) => {
    setCart((prev) => {
      const updated = new Map(prev);
      updated.delete(itemId);
      return updated;
    });
  };

  const handleCheckout = () => {
    toast.success("Order placed successfully!");
    setCart(new Map());
  };

  const cartItems = Array.from(cart.entries())
    .map(([itemId, quantity]) => {
      const item = menuItems.find((candidate) => candidate.id === itemId);
      return item
        ? {
            item,
            quantity,
          }
        : undefined;
    })
    .filter((entry): entry is { item: MenuItemType; quantity: number } =>
      Boolean(entry),
    );

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: colors.background.secondary }}>
      {/* Restaurant Header */}
      <div 
        className="shadow-md border-b-2"
        style={{ 
          backgroundColor: colors.background.primary,
          borderColor: colors.border.light 
        }}
      >
        <div className="mx-auto max-w-3xl px-4 py-6">
          <div className="mb-4 flex items-center gap-2 text-sm" style={{ color: colors.text.secondary }}>
            <MapPin className="h-5 w-5" style={{ color: colors.primary[600] }} />
            <span className="font-semibold">Delivering to Home</span>
          </div>

          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text.primary }}>
            {restaurant.name}
          </h1>
          <p className="text-base mb-4" style={{ color: colors.text.secondary }}>
            {restaurant.cuisine}
          </p>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: colors.warning[50] }}
              >
                <Star className="h-5 w-5" style={{ color: colors.warning[500], fill: colors.warning[500] }} />
                <span className="font-bold" style={{ color: colors.text.primary }}>
                  {restaurant.rating.toFixed(1)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2" style={{ color: colors.text.secondary }}>
              <Clock className="h-5 w-5" style={{ color: colors.secondary[600] }} />
              <span className="font-semibold">{restaurant.deliveryTime}</span>
            </div>
            
            <div className="flex items-center gap-2" style={{ color: colors.text.secondary }}>
              <DollarSign className="h-5 w-5" style={{ color: colors.success[600] }} />
              <span className="font-semibold">${restaurant.deliveryFee.toFixed(2)} delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="relative">
          <Search 
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" 
            style={{ color: colors.text.tertiary }} 
          />
          <Input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-12 h-12 text-base border-2 shadow-sm"
            style={{ 
              borderColor: colors.border.DEFAULT,
              backgroundColor: colors.background.primary 
            }}
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="mx-auto mb-6 max-w-3xl px-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <Badge
                key={category}
                className={`cursor-pointer whitespace-nowrap px-4 py-2 text-sm font-semibold transition-all hover:shadow-md ${
                  isActive ? "shadow-md" : ""
                }`}
                onClick={() => setSelectedCategory(category)}
                style={{
                  backgroundColor: isActive ? colors.primary[600] : colors.background.primary,
                  color: isActive ? colors.text.inverse : colors.text.primary,
                  borderColor: isActive ? colors.primary[600] : colors.border.DEFAULT,
                  borderWidth: '2px',
                  borderStyle: 'solid'
                }}
              >
                {category}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Menu Items */}
      <div className="mx-auto max-w-3xl space-y-4 px-4 pb-8">
        {filteredItems.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            quantity={cart.get(item.id) ?? 0}
            onAdd={() => handleAddItem(item.id)}
            onRemove={() => handleRemoveItem(item.id)}
          />
        ))}

        {filteredItems.length === 0 ? (
          <div 
            className="py-16 text-center rounded-xl border-2"
            style={{ 
              backgroundColor: colors.background.primary,
              borderColor: colors.border.light 
            }}
          >
            <div 
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.neutral[100] }}
            >
              <Search className="h-10 w-10" style={{ color: colors.text.tertiary }} />
            </div>
            <p className="text-lg font-semibold" style={{ color: colors.text.primary }}>
              No items found
            </p>
            <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
              Try a different search or category
            </p>
          </div>
        ) : null}
      </div>

      <Cart
        items={cartItems}
        onRemoveItem={handleClearItem}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
