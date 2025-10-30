'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Store, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

import { colors } from "@/config/colors";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

interface FormState {
  name: string;
  cuisine: string;
}

export function CreateRestaurantForm() {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>({
    name: "",
    cuisine: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.name || !formState.cuisine) {
      toast.error("Restaurant name and cuisine type are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/restaurant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formState.name,
          cuisine: formState.cuisine,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        const message = error?.message ?? "Unable to create restaurant.";
        toast.error(message);
        return;
      }

      toast.success("Restaurant created successfully!");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg border-2 shadow-2xl" style={{ backgroundColor: colors.background.primary, borderColor: colors.border.light }}>
        <CardHeader className="text-center space-y-4">
          <div 
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl shadow-xl"
            style={{ backgroundColor: colors.primary[600] }}
          >
            <Store className="h-12 w-12 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold" style={{ color: colors.text.primary }}>
              Create Your Restaurant
            </CardTitle>
            <CardDescription className="text-base mt-2" style={{ color: colors.text.secondary }}>
              Set up your restaurant profile to start managing orders and menus
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-semibold" style={{ color: colors.text.primary }}>
                Restaurant Name
              </label>
              <div className="relative">
                <UtensilsCrossed className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: colors.text.tertiary }} />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g., The Burger Palace"
                  value={formState.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="pl-10"
                  style={{ 
                    borderColor: colors.border.DEFAULT,
                    backgroundColor: colors.background.primary 
                  }}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="cuisine" className="block text-sm font-semibold" style={{ color: colors.text.primary }}>
                Cuisine Type
              </label>
              <Input
                id="cuisine"
                name="cuisine"
                type="text"
                placeholder="e.g., American - Burgers, Italian, Asian Fusion"
                value={formState.cuisine}
                onChange={handleChange}
                disabled={isSubmitting}
                style={{ 
                  borderColor: colors.border.DEFAULT,
                  backgroundColor: colors.background.primary 
                }}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full text-white transition-all hover:shadow-xl"
              disabled={isSubmitting}
              style={{ backgroundColor: colors.primary[600] }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Restaurant…
                </>
              ) : (
                <>
                  <Store className="mr-2 h-5 w-5" />
                  Create Restaurant
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
