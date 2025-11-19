"use client";

import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { MenuItemForm } from "@/components/menu-item-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { colors } from "@/config/colors";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular: boolean;
  vegetarian: boolean;
  available: boolean;
}

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>(
    undefined,
  );

  const fetchMenuItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/menu`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setMenuItems(data.menuItems);
        setFilteredItems(data.menuItems);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load menu items");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query),
    );
    setFilteredItems(filtered);
  }, [searchQuery, menuItems]);

  const handleAdd = () => {
    setEditingItem(undefined);
    setShowForm(true);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/menu/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Menu item deleted!");
        fetchMenuItems();
      } else {
        toast.error("Failed to delete menu item");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingItem(undefined);
    fetchMenuItems();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingItem(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">Loading menu items...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {!showForm ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Menu Items</h2>
              <p className="text-sm mt-1">Manage your restaurant menu items</p>
            </div>
            <Button onClick={handleAdd} className="font-semibold shadow-md">
              <Plus className="mr-2 h-5 w-5" />
              Add Menu Item
            </Button>
          </div>

          {/* Search */}
          <Card className="p-4 border-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>
          </Card>

          {/* Menu Items Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden border-2 transition-all hover:shadow-lg"
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                      fill
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      {item.popular && (
                        <Badge className="font-semibold">Popular</Badge>
                      )}
                      {item.vegetarian && (
                        <Badge className="font-semibold">Veg</Badge>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        <Badge
                          className="font-semibold"
                          style={{
                            backgroundColor: item.available
                              ? colors.success[500]
                              : colors.neutral[400],
                          }}
                        >
                          {item.available ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                      <p className="text-xs font-semibold mb-2">
                        {item.category}
                      </p>
                      <p className="text-sm line-clamp-2">{item.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-2xl font-bold">
                        ${item.price.toFixed(2)}
                      </span>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                          className="border-2"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(item.id)}
                          className="border-2 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-2">
              <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4">
                <Search className="h-10 w-10" />
              </div>
              <p className="text-lg font-semibold">
                {searchQuery ? "No menu items found" : "No menu items yet"}
              </p>
              <p className="text-sm mt-1">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Click 'Add Menu Item' to get started"}
              </p>
            </Card>
          )}
        </>
      ) : (
        <MenuItemForm
          item={editingItem}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}
