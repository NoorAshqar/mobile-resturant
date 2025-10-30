'use client';

import { useEffect, useState } from "react";
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        <p className="text-lg" style={{ color: colors.text.secondary }}>
          Loading restaurant details...
        </p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Card 
          className="p-8 text-center border-2 max-w-md"
          style={{ 
            backgroundColor: colors.background.primary,
            borderColor: colors.border.light 
          }}
        >
          <div 
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.neutral[100] }}
          >
            <Store className="h-8 w-8" style={{ color: colors.text.tertiary }} />
          </div>
          <p className="text-lg font-semibold" style={{ color: colors.text.primary }}>
            No Restaurant Found
          </p>
          <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
            Please create a restaurant first
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
          Restaurant Settings
        </h2>
        <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
          Manage your restaurant information
        </p>
      </div>

      <Card 
        className="border-2"
        style={{ 
          backgroundColor: colors.background.primary,
          borderColor: colors.border.light 
        }}
      >
        <CardHeader>
          <CardTitle style={{ color: colors.text.primary }}>
            Restaurant Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold" style={{ color: colors.text.primary }}>
                Restaurant Name *
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: colors.text.tertiary }} />
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
                  style={{ 
                    borderColor: colors.border.DEFAULT,
                    backgroundColor: colors.background.primary 
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="cuisine" className="text-sm font-semibold" style={{ color: colors.text.primary }}>
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
                style={{ 
                  borderColor: colors.border.DEFAULT,
                  backgroundColor: colors.background.primary 
                }}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-semibold" style={{ color: colors.text.primary }}>
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
                style={{ 
                  borderColor: colors.border.DEFAULT,
                  backgroundColor: colors.background.primary,
                  color: colors.text.primary
                }}
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
                style={{ backgroundColor: colors.primary[600] }}
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

      <Card 
        className="mt-6 border-2"
        style={{ 
          backgroundColor: colors.background.primary,
          borderColor: colors.border.light 
        }}
      >
        <CardHeader>
          <CardTitle style={{ color: colors.text.primary }}>
            Restaurant Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between py-3 border-b" style={{ borderColor: colors.border.light }}>
              <span className="font-semibold" style={{ color: colors.text.secondary }}>
                Restaurant ID
              </span>
              <span className="font-mono text-sm" style={{ color: colors.text.primary }}>
                {restaurant.id}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b" style={{ borderColor: colors.border.light }}>
              <span className="font-semibold" style={{ color: colors.text.secondary }}>
                Current Status
              </span>
              <span 
                className="font-semibold px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: restaurant.status === "active" ? colors.success[100] : colors.neutral[200],
                  color: restaurant.status === "active" ? colors.success[700] : colors.neutral[700]
                }}
              >
                {restaurant.status.charAt(0).toUpperCase() + restaurant.status.slice(1)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

