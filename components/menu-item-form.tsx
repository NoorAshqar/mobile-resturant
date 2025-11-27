"use client";

import { Image as ImageIcon, Loader2, Save, Upload, X } from "lucide-react";
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
  images?: string[];
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
  const [isUploading, setIsUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<Array<{ url: string; file?: File }>>([]);
  const [isDragging, setIsDragging] = useState(false);
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
    // Load existing images
    if (item?.images && item.images.length > 0) {
      const previews = item.images.map((img) => ({
        url: img.startsWith("http") ? img : `${API_BASE_URL}${img}`,
      }));
      setImagePreviews(previews);
    } else if (item?.image) {
      // Fallback to single image for backward compatibility
      setImagePreviews([{
        url: item.image.startsWith("http") ? item.image : `${API_BASE_URL}${item.image}`,
      }]);
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      addFiles(files);
    }
  };

  const addFiles = (files: File[]) => {
    const newFiles: File[] = [];
    const newPreviews: Array<{ url: string; file?: File }> = [];

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum size is 5MB.`);
          return;
        }
        newFiles.push(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push({ url: reader.result as string, file });
          if (newPreviews.length === newFiles.length) {
            setImageFiles((prev) => [...prev, ...newFiles]);
            setImagePreviews((prev) => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        toast.error(`${file.name} is not an image file.`);
      }
    });
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      addFiles(files);
    }
  };

  const handleUploadImages = async (productId?: string): Promise<string[]> => {
    if (imageFiles.length === 0) return [];

    setIsUploading(true);
    try {
      const formData = new FormData();
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });
      if (productId) {
        formData.append("productId", productId);
      }

      const response = await fetch(`${API_BASE_URL}/api/upload/product/multiple`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Failed to upload images");
      }

      const data = await response.json();
      return data.imageUrls || [];
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload images");
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !formState.name ||
      !formState.description ||
      !formState.category
    ) {
      toast.error("Name, description, and category are required.");
      return;
    }

    if (formState.price <= 0) {
      toast.error("Price must be greater than 0.");
      return;
    }

    if (imagePreviews.length === 0) {
      toast.error("Please upload at least one image.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get existing image URLs (from previews that don't have files)
      const existingImages = imagePreviews
        .filter((preview) => !preview.file)
        .map((preview) => {
          // Convert full URLs back to relative paths if needed
          if (preview.url.startsWith(API_BASE_URL)) {
            return preview.url.replace(API_BASE_URL, "");
          }
          return preview.url;
        });

      // Upload new files
      let uploadedImages: string[] = [];
      if (imageFiles.length > 0) {
        uploadedImages = await handleUploadImages(item?.id);
        if (uploadedImages.length === 0 && imageFiles.length > 0) {
          setIsSubmitting(false);
          return;
        }
        // Construct full URLs if they're relative paths
        uploadedImages = uploadedImages.map((url) =>
          url.startsWith("http") ? url : `${API_BASE_URL}${url}`
        );
      }

      // Combine existing and new images
      const allImages = [...existingImages, ...uploadedImages];
      const primaryImage = allImages[0] || "";

      const url = item?.id
        ? `${API_BASE_URL}/api/menu/${item.id}`
        : `${API_BASE_URL}/api/menu`;

      const method = item?.id ? "PUT" : "POST";

      // Prepare request body
      const { addons: _, ...formDataWithoutAddons } = formState;
      const requestBody = {
        ...formDataWithoutAddons,
        image: primaryImage, // Keep for backward compatibility
        images: allImages,
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

      const responseData = await response.json();
      const savedItemId = responseData.menuItem?.id || item?.id;

      // If we uploaded files and now have the product ID, move them to the correct location
      if (imageFiles.length > 0 && savedItemId && !item?.id) {
        // Re-upload with the correct product ID to move to proper folder
        const formData = new FormData();
        imageFiles.forEach((file) => {
          formData.append("images", file);
        });
        formData.append("productId", savedItemId);
        const moveResponse = await fetch(`${API_BASE_URL}/api/upload/product/multiple`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        if (moveResponse.ok) {
          const moveData = await moveResponse.json();
          const newImageUrls = (moveData.imageUrls || []).map((url: string) =>
            url.startsWith("http") ? url : `${API_BASE_URL}${url}`
          );
          // Update the menu item with the new paths
          await fetch(`${API_BASE_URL}/api/menu/${savedItemId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ images: newImageUrls, image: newImageUrls[0] || "" }),
            credentials: "include",
          });
        }
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

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold">
                Images * (Upload multiple images)
              </label>
              
              {/* Drag and Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-lg p-6 transition-all
                  ${isDragging 
                    ? "border-primary bg-primary/5" 
                    : "border-gray-300 dark:border-gray-700 hover:border-primary/50"
                  }
                  ${isSubmitting || isUploading ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                `}
                onClick={() => document.getElementById("imageFiles")?.click()}
              >
                <input
                  id="imageFiles"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  disabled={isSubmitting || isUploading}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="mb-4 rounded-full bg-primary/10 p-4">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-sm font-medium mb-1">
                    {isDragging ? "Drop images here" : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF, WebP up to 5MB each (max 10 images)
                  </p>
                </div>
              </div>

              {/* Image Previews Grid */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700"
                    >
                      <img
                        src={preview.url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        disabled={isSubmitting || isUploading}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded font-semibold">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading images...</span>
                </div>
              )}
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
              disabled={isSubmitting || isUploading}
            >
              {(isSubmitting || isUploading) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? "Uploading..." : "Saving..."}
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
