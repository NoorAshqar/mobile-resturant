"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Minus, Trash2, ShoppingCart, Receipt } from "lucide-react";
import { toast } from "sonner";

import { colors } from "@/config/colors";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/figma/image-with-fallback";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  restaurant: {
    id: string;
    name: string;
    cuisine: string;
  };
  table: {
    id: string;
    number: number;
    capacity: number;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
  vegetarian?: boolean;
}

export default function TableOrderPage() {
  const params = useParams();
  const restaurantName = params.restaurant as string;
  const tableNumber = params.table as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/order/${restaurantName}/${tableNumber}`,
          { credentials: "include" },
        );

        if (response.ok) {
          const data = await response.json();
          setOrder(data.order);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load order");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchMenuItems = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/public/restaurant/${restaurantName}`,
          { credentials: "include" },
        );

        if (response.ok) {
          const data = await response.json();
          setMenuItems(data.restaurant.menuItems || []);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load menu");
      }
    };

    fetchOrder();
    fetchMenuItems();
  }, [restaurantName, tableNumber]);

  const handleAddItem = async (menuItemId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/order/${restaurantName}/${tableNumber}/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ menuItemId, quantity: 1 }),
          credentials: "include",
        },
      );

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        toast.success("Item added to order");
      } else {
        toast.error("Failed to add item");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/order/${restaurantName}/${tableNumber}/items/${itemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity: newQuantity }),
          credentials: "include",
        },
      );

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      } else {
        toast.error("Failed to update quantity");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/order/${restaurantName}/${tableNumber}/items/${itemId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        toast.success("Item removed");
      } else {
        toast.error("Failed to remove item");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const categories = [
    "All",
    ...Array.from(new Set(menuItems.map((item) => item.category))),
  ];
  const filteredMenuItems =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Order not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="shadow-md border-b-2 sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{order.restaurant.name}</h1>
              <p className="text-base mt-1">Table {order.table.number}</p>
            </div>
            <Button
              onClick={() => setShowMenu(!showMenu)}
              className="text-white font-semibold shadow-md"
            >
              {showMenu ? (
                <>
                  <Receipt className="mr-2 h-5 w-5" />
                  View Bill
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add Items
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {showMenu ? (
        /* Menu View */
        <div className="mx-auto max-w-4xl px-4 py-6">
          {/* Categories */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <Badge
                  key={category}
                  className={`cursor-pointer whitespace-nowrap px-4 py-2 text-sm font-semibold transition-all hover:shadow-md ${
                    isActive ? "shadow-md" : ""
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              );
            })}
          </div>

          {/* Menu Items */}
          <div className="space-y-4">
            {filteredMenuItems.map((item) => {
              const orderItem = order.items.find(
                (oi) => oi.menuItemId === item.id,
              );
              const quantity = orderItem?.quantity || 0;

              if (!orderItem) {
                return null;
              }

              return (
                <Card
                  key={item.id}
                  className="overflow-hidden border-2 transition-all hover:shadow-lg"
                >
                  <div className="flex gap-4 p-4">
                    <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl shadow-md">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                      {item.popular && (
                        <Badge className="absolute left-2 top-2 text-xs font-bold shadow-md">
                          Popular
                        </Badge>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg truncate">
                            {item.name}
                          </h3>
                          {item.vegetarian && (
                            <Badge
                              variant="outline"
                              className="mt-1 flex items-center gap-1 text-xs font-semibold"
                            >
                              Vegetarian
                            </Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-sm line-clamp-2 mb-3">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold">
                          ${item.price.toFixed(2)}
                        </span>

                        {quantity === 0 ? (
                          <Button
                            size="sm"
                            onClick={() => handleAddItem(item.id)}
                            className="h-9 px-4 text-white font-semibold shadow-md transition-all hover:shadow-lg"
                          >
                            <Plus className="mr-1 h-4 w-4" />
                            Add
                          </Button>
                        ) : (
                          <div className="flex items-center gap-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleUpdateQuantity(orderItem.id, quantity - 1)
                              }
                              className="h-9 w-9 p-0 border-2"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-bold text-lg">
                              {quantity}
                            </span>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleUpdateQuantity(orderItem.id, quantity + 1)
                              }
                              className="h-9 w-9 p-0 text-white shadow-md"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        /* Bill View */
        <div className="mx-auto max-w-4xl px-4 py-6">
          <Card className="border-2 mb-6">
            <div className="p-6">
              <div className="mb-6 pb-4 border-b-2">
                <h2 className="text-2xl font-bold mb-2">Order Summary</h2>
                <p className="text-sm">
                  {order.items.length}{" "}
                  {order.items.length === 1 ? "item" : "items"}
                </p>
              </div>

              {order.items.length === 0 ? (
                <div className="py-8 text-center">
                  <ShoppingCart className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-lg font-semibold">No items in order</p>
                  <p className="text-sm mt-1">
                    Click &quot;Add Items&quot; to start ordering
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 rounded-lg border-2"
                      >
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-4">
                            <span className="text-sm">
                              ${item.price.toFixed(2)} × {item.quantity}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity - 1)
                              }
                              className="h-8 w-8 p-0 border-2"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-bold">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity + 1)
                              }
                              className="h-8 w-8 p-0 text-white"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-lg font-bold w-24 text-right">
                            ${item.subtotal.toFixed(2)}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveItem(item.id)}
                            className="h-8 w-8 p-0 border-2 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 pt-4 border-t-2">
                    <div className="flex justify-between text-base">
                      <span>Subtotal:</span>
                      <span className="font-semibold">
                        ${order.subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span>Tax (10%):</span>
                      <span className="font-semibold">
                        ${order.tax.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xl pt-2 border-t-2">
                      <span className="font-bold">Total:</span>
                      <span className="font-bold">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
