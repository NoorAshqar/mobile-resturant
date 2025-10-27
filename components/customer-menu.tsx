'use client';

import { useMemo, useState } from "react";
import { MapPin, Search, Star } from "lucide-react";
import { toast } from "sonner";

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
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>Delivering to Home</span>
          </div>

          <h1 className="mb-1">{restaurant.name}</h1>
          <p className="mb-2 text-sm text-gray-600">{restaurant.cuisine}</p>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>{restaurant.rating.toFixed(1)}</span>
            </div>
            <span className="text-gray-400">|</span>
            <span>{restaurant.deliveryTime}</span>
            <span className="text-gray-400">|</span>
            <span>${restaurant.deliveryFee.toFixed(2)} delivery</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="mx-auto mb-4 max-w-2xl px-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <Badge
                key={category}
                variant={isActive ? "default" : "outline"}
                className={`cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-green-600 hover:bg-green-700"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-3 px-4">
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
          <div className="py-12 text-center text-gray-500">No items found</div>
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
