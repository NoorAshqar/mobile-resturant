"use client";

import { Image, Link2, Loader2, Store, UtensilsCrossed } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

interface FormState {
  name: string;
  cuisine: string;
  slug: string;
  logoUrl: string;
  description: string;
}

export function CreateRestaurantForm() {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>({
    name: "",
    cuisine: "",
    slug: "",
    logoUrl: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [useFileUpload, setUseFileUpload] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    if (name === "logoUrl") {
      setFormState((prev) => ({ ...prev, [name]: value }));
      setLogoPreview(value);
      setUseFileUpload(false);
    } else {
      setFormState((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setUseFileUpload(true);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return null;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("logo", logoFile);

      const response = await fetch(`${API_BASE_URL}/api/upload/restaurant/logo`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Failed to upload logo");
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error("Logo upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload logo");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.name || !formState.cuisine || !formState.slug) {
      toast.error("Name, cuisine and slug are required.");
      return;
    }

    const sanitizedSlug = formState.slug
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    if (!sanitizedSlug) {
      toast.error("Please enter a valid slug (letters, numbers and dashes).");
      return;
    }

    setIsSubmitting(true);

    try {
      let logoUrl = formState.logoUrl.trim();

      // Upload file if a file was selected
      if (useFileUpload && logoFile) {
        const uploadedUrl = await handleUploadLogo();
        if (!uploadedUrl) {
          setIsSubmitting(false);
          return;
        }
        // Construct full URL if it's a relative path
        logoUrl = uploadedUrl.startsWith("http") 
          ? uploadedUrl 
          : `${API_BASE_URL}${uploadedUrl}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/dashboard/restaurant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formState.name.trim(),
          cuisine: formState.cuisine.trim(),
          slug: sanitizedSlug,
          logoUrl: logoUrl,
          description: formState.description.trim(),
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
      <Card className="w-full max-w-3xl border-2 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl shadow-xl">
            <Store className="h-12 w-12 text-black dark:text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">
              Create Your Restaurant
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Set up your restaurant profile to start managing orders and menus
            </CardDescription>
            <p className="mt-2 text-xs text-muted-foreground">
              This information powers your public menu, table QR codes, and
              customer-facing ordering experience.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold">
                  Restaurant Name *
                </label>
                <div className="relative">
                  <UtensilsCrossed className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
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
                <label htmlFor="slug" className="block text-sm font-semibold">
                  Restaurant Slug (URL) *
                </label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="slug"
                    name="slug"
                    type="text"
                    placeholder="e.g., the-burger-palace"
                    value={formState.slug}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="pl-9"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Used in links and QR codes. Only lowercase letters, numbers,
                  and dashes.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="logoUrl"
                  className="block text-sm font-semibold"
                >
                  Logo
                </label>
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="radio"
                        name="logoSource"
                        checked={!useFileUpload}
                        onChange={() => {
                          setUseFileUpload(false);
                          setLogoFile(null);
                        }}
                        disabled={isSubmitting || isUploading}
                        className="h-4 w-4"
                      />
                      <span>Use URL</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="radio"
                        name="logoSource"
                        checked={useFileUpload}
                        onChange={() => {
                          setUseFileUpload(true);
                          setFormState((prev) => ({ ...prev, logoUrl: "" }));
                        }}
                        disabled={isSubmitting || isUploading}
                        className="h-4 w-4"
                      />
                      <span>Upload File</span>
                    </label>
                  </div>
                  {!useFileUpload ? (
                    <div className="relative">
                      <Image className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                      <Input
                        id="logoUrl"
                        name="logoUrl"
                        type="url"
                        placeholder="https://your-cdn.com/logo.png"
                        value={formState.logoUrl}
                        onChange={handleChange}
                        disabled={isSubmitting || isUploading}
                        className="pl-9"
                      />
                    </div>
                  ) : (
                    <div>
                      <Input
                        id="logoFile"
                        name="logoFile"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isSubmitting || isUploading}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Accepted: JPEG, PNG, GIF, WebP (max 5MB)
                      </p>
                    </div>
                  )}
                  {logoPreview && (
                    <div className="mt-2">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-24 w-24 object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="cuisine"
                  className="block text-sm font-semibold"
                >
                  Cuisine Type *
                </label>
                <Input
                  id="cuisine"
                  name="cuisine"
                  type="text"
                  placeholder="e.g., American - Burgers, Italian, Asian Fusion"
                  value={formState.cuisine}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold"
                >
                  Short Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="Tell customers what makes your restaurant special."
                  value={formState.description}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full text-black dark:text-white font-semibold transition-all hover:shadow-xl"
              disabled={isSubmitting || isUploading}
            >
              {(isSubmitting || isUploading) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? "Uploading..." : "Creating Restaurant…"}
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
