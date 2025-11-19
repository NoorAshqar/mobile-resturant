"use client";

import { Image as ImageIcon, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
}

interface MenuItemData {
  id?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular: boolean;
  vegetarian: boolean;
  available: boolean;
  addons?: Addon[];
}

interface MenuItemFormProps {
  item?: MenuItemData;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MenuItemForm({ item, onSuccess, onCancel }: MenuItemFormProps) {
  const [formState, setFormState] = useState<MenuItemData>(
    item ?? {
      name: "",
      description: "",
      price: 0,
      image: "",
      category: "",
      popular: false,
      vegetarian: false,
      available: true,
      addons: [],
    },
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableAddons, setAvailableAddons] = useState<Addon[]>([]);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>(
    item?.addons?.map((a) => a.id) || [],
  );

  useEffect(() => {
    const fetchAddons = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/addon`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setAvailableAddons(data.addons || []);
        }
      } catch (error) {
        console.error("Failed to fetch addons", error);
      }
    };
    fetchAddons();
  }, []);

  useEffect(() => {
    if (item?.addons) {
      setSelectedAddonIds(item.addons.map((a) => a.id));
    }
  }, [item]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = event.target;

    if (type === "checkbox") {
      const checked = (event.target as HTMLInputElement).checked;
      setFormState((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "price") {
      setFormState((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormState((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !formState.name ||
      !formState.description ||
      !formState.image ||
      !formState.category
    ) {
      toast.error("All fields are required.");
      return;
    }

    if (formState.price <= 0) {
      toast.error("Price must be greater than 0.");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = item?.id
        ? `${API_BASE_URL}/api/menu/${item.id}`
        : `${API_BASE_URL}/api/menu`;

      const method = item?.id ? "PUT" : "POST";

      // Prepare request body without the addons property from formState
      const { addons: _, ...formDataWithoutAddons } = formState;
      const requestBody = {
        ...formDataWithoutAddons,
        addons: selectedAddonIds,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        const message = error?.message ?? "Failed to save menu item.";
        toast.error(message);
        return;
      }

      toast.success(item?.id ? "Menu item updated!" : "Menu item created!");
      onSuccess();
    } catch (error) {
      console.error("Menu item form error:", error);
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        toast.error("Cannot connect to server. Please check if the server is running.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>
          {item?.id ? "Edit Menu Item" : "Add New Menu Item"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold">
                Item Name *
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="e.g., Classic Burger"
                value={formState.name}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-semibold">
                Category *
              </label>
              <Input
                id="category"
                name="category"
                type="text"
                placeholder="e.g., Burgers, Pizza"
                value={formState.category}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-semibold">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Describe your menu item..."
              value={formState.description}
              onChange={handleChange}
              disabled={isSubmitting}
              required
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-semibold">
                Price ($) *
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formState.price}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="image" className="text-sm font-semibold">
                Image URL *
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
                <Input
                  id="image"
                  name="image"
                  type="url"
                  placeholder="https://..."
                  value={formState.image}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="popular"
                checked={formState.popular}
                onChange={handleChange}
                disabled={isSubmitting}
                className="h-5 w-5 rounded"
              />
              <span className="text-sm font-semibold">Popular Item</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="vegetarian"
                checked={formState.vegetarian}
                onChange={handleChange}
                disabled={isSubmitting}
                className="h-5 w-5 rounded"
              />
              <span className="text-sm font-semibold">Vegetarian</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="available"
                checked={formState.available}
                onChange={handleChange}
                disabled={isSubmitting}
                className="h-5 w-5 rounded"
              />
              <span className="text-sm font-semibold">Available</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Available Addons</label>
            <div className="border rounded-md p-4 max-h-48 overflow-y-auto space-y-2">
              {availableAddons.length > 0 ? (
                availableAddons.map((addon) => (
                  <label
                    key={addon.id}
                    className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAddonIds.includes(addon.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAddonIds([...selectedAddonIds, addon.id]);
                        } else {
                          setSelectedAddonIds(
                            selectedAddonIds.filter((id) => id !== addon.id),
                          );
                        }
                      }}
                      disabled={isSubmitting || !addon.available}
                      className="h-4 w-4 rounded"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium">{addon.name}</span>
                      {addon.category && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({addon.category})
                        </span>
                      )}
                      <span className="text-xs text-gray-500 ml-2">
                        +${addon.price.toFixed(2)}
                      </span>
                    </div>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No addons available. Create addons first.
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 text-black dark:text-white font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {item?.id ? "Update Item" : "Create Item"}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
