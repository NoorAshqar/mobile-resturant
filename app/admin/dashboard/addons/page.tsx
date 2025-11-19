"use client";

import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { colors } from "@/config/colors";

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

interface AddonFormProps {
  addon?: Addon;
  onSuccess: () => void;
  onCancel: () => void;
}

function AddonForm({ addon, onSuccess, onCancel }: AddonFormProps) {
  const [formState, setFormState] = useState<Addon>(
    addon ?? {
      id: "",
      name: "",
      description: "",
      price: 0,
      category: "",
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

    if (!formState.name || formState.price === undefined) {
      toast.error("Name and price are required.");
      return;
    }

    if (formState.price < 0) {
      toast.error("Price must be greater than or equal to 0.");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = addon?.id
        ? `${API_BASE_URL}/api/addon/${addon.id}`
        : `${API_BASE_URL}/api/addon`;

      const method = addon?.id ? "PUT" : "POST";

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
        const message = error?.message ?? "Failed to save addon.";
        toast.error(message);
        return;
      }

      toast.success(addon?.id ? "Addon updated!" : "Addon created!");
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
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">
          {addon?.id ? "Edit Addon" : "Add New Addon"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold">
                Addon Name *
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="e.g., Extra Cheese"
                value={formState.name}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-semibold">
                Category
              </label>
              <Input
                id="category"
                name="category"
                type="text"
                placeholder="e.g., Toppings, Extras"
                value={formState.category}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-semibold">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Describe the addon..."
              value={formState.description}
              onChange={handleChange}
              disabled={isSubmitting}
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

            <div className="space-y-2 flex items-end">
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
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 text-black dark:text-white font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : addon?.id ? "Update Addon" : "Create Addon"}
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
      </div>
    </Card>
  );
}

export default function AddonManagementPage() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [filteredAddons, setFilteredAddons] = useState<Addon[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddon, setEditingAddon] = useState<Addon | undefined>(
    undefined,
  );

  const fetchAddons = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/addon`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setAddons(data.addons);
        setFilteredAddons(data.addons);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load addons");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddons();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = addons.filter(
      (addon) =>
        addon.name.toLowerCase().includes(query) ||
        addon.category.toLowerCase().includes(query) ||
        addon.description.toLowerCase().includes(query),
    );
    setFilteredAddons(filtered);
  }, [searchQuery, addons]);

  const handleAdd = () => {
    setEditingAddon(undefined);
    setShowForm(true);
  };

  const handleEdit = (addon: Addon) => {
    setEditingAddon(addon);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this addon?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/addon/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Addon deleted!");
        fetchAddons();
      } else {
        toast.error("Failed to delete addon");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAddon(undefined);
    fetchAddons();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAddon(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">Loading addons...</p>
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
              <h2 className="text-2xl font-bold">Addons</h2>
              <p className="text-sm mt-1">Manage product addons and extras</p>
            </div>
            <Button onClick={handleAdd} className="font-semibold shadow-md">
              <Plus className="mr-2 h-5 w-5" />
              Add Addon
            </Button>
          </div>

          {/* Search */}
          <Card className="p-4 border-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search addons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>
          </Card>

          {/* Addons Grid */}
          {filteredAddons.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {filteredAddons.map((addon) => (
                <Card
                  key={addon.id}
                  className="overflow-hidden border-2 transition-all hover:shadow-lg"
                >
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-lg">{addon.name}</h3>
                        <Badge
                          className="font-semibold"
                          style={{
                            backgroundColor: addon.available
                              ? colors.success[500]
                              : colors.neutral[400],
                          }}
                        >
                          {addon.available ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                      {addon.category && (
                        <p className="text-xs font-semibold mb-2">
                          {addon.category}
                        </p>
                      )}
                      {addon.description && (
                        <p className="text-sm line-clamp-2">{addon.description}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-2xl font-bold">
                        ${addon.price.toFixed(2)}
                      </span>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(addon)}
                          className="border-2"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(addon.id)}
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
                {searchQuery ? "No addons found" : "No addons yet"}
              </p>
              <p className="text-sm mt-1">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Click 'Add Addon' to get started"}
              </p>
            </Card>
          )}
        </>
      ) : (
        <AddonForm
          addon={editingAddon}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}

