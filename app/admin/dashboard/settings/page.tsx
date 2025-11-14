"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Save, Store } from "lucide-react";
import { toast } from "sonner";

import { colors } from "@/config/colors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  status: "active" | "inactive";
  slug: string;
  logoUrl?: string;
  description?: string;
}

export default function RestaurantSettingsPage() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [formState, setFormState] = useState({
    name: "",
    cuisine: "",
    status: "active" as "active" | "inactive",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.restaurant) {
            setRestaurant(data.restaurant);
            setFormState({
              name: data.restaurant.name,
              cuisine: data.restaurant.cuisine,
              status: data.restaurant.status,
            });
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load restaurant details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurant();
  }, []);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.name || !formState.cuisine) {
      toast.error("All fields are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/restaurant`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        const message = error?.message ?? "Failed to update restaurant.";
        toast.error(message);
        return;
      }

      toast.success("Restaurant updated successfully!");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-lg">Loading restaurant details...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Card className="p-8 text-center border-2 max-w-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Store className="h-8 w-8" />
          </div>
          <p className="text-lg font-semibold">No Restaurant Found</p>
          <p className="text-sm mt-1">Please create a restaurant first</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Restaurant Settings</h2>
        <p className="text-sm mt-1">Manage your restaurant information</p>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Restaurant Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold">
                Restaurant Name *
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g., The Burger Palace"
                  value={formState.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="cuisine" className="text-sm font-semibold">
                Cuisine Type *
              </label>
              <Input
                id="cuisine"
                name="cuisine"
                type="text"
                placeholder="e.g., American - Burgers, Italian"
                value={formState.cuisine}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-semibold">
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={formState.status}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full h-9 rounded-md border px-3 py-1 text-sm"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full text-white font-semibold"
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
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6 border-2">
        <CardHeader>
          <CardTitle>Restaurant Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between py-3 border-b">
              <span className="font-semibold">Restaurant ID</span>
              <span className="font-mono text-sm">{restaurant.id}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="font-semibold">Current Status</span>
              <span className="font-semibold px-3 py-1 rounded-full text-sm">
                {restaurant.status.charAt(0).toUpperCase() +
                  restaurant.status.slice(1)}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="font-semibold">Restaurant Name</span>
              <span className="text-sm">{restaurant.name}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="font-semibold">Cuisine</span>
              <span className="text-sm">{restaurant.cuisine}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="font-semibold">Slug</span>
              <span className="font-mono text-sm">
                {restaurant.slug || "—"}
              </span>
            </div>
            {restaurant.description && (
              <div className="py-3 border-b">
                <span className="block font-semibold mb-1">Description</span>
                <p className="text-sm text-muted-foreground">
                  {restaurant.description}
                </p>
              </div>
            )}
            <div className="py-3">
              <span className="block font-semibold mb-1">
                Public Ordering Link
              </span>
              <Link
                href={`/${restaurant.slug || restaurant.name}/1`}
                target="_blank"
                className="text-sm text-blue-600 underline break-all"
              >
                {`/${restaurant.slug || restaurant.name}/1`}
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">
                Share this link or QR for customers to order from table 1.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
