"use client";

import { useState } from "react";
import { Loader2, Save, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

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
    },
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
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
      console.error(error);
      toast.error("Something went wrong. Please try again.");
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

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 text-white font-semibold"
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
