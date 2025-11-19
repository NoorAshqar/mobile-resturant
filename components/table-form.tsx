"use client";

import { Loader2, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

interface TableData {
  id?: string;
  number: number;
  capacity: number;
  status: string;
  location: string;
}

interface TableFormProps {
  table?: TableData;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TableForm({ table, onSuccess, onCancel }: TableFormProps) {
  const [formState, setFormState] = useState<TableData>(
    table ?? {
      number: 0,
      capacity: 0,
      status: "available",
      location: "",
    },
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    if (name === "number" || name === "capacity") {
      setFormState((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormState((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.number || formState.number <= 0) {
      toast.error("Table number must be greater than 0.");
      return;
    }

    if (!formState.capacity || formState.capacity <= 0) {
      toast.error("Table capacity must be greater than 0.");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = table?.id
        ? `${API_BASE_URL}/api/table/${table.id}`
        : `${API_BASE_URL}/api/table`;

      const method = table?.id ? "PUT" : "POST";

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
        const message = error?.message ?? "Failed to save table.";
        toast.error(message);
        return;
      }

      toast.success(table?.id ? "Table updated!" : "Table created!");
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
        <CardTitle>{table?.id ? "Edit Table" : "Add New Table"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="number" className="text-sm font-semibold">
                Table Number *
              </label>
              <Input
                id="number"
                name="number"
                type="number"
                min="1"
                placeholder="e.g., 1, 2, 3"
                value={formState.number}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="capacity" className="text-sm font-semibold">
                Capacity (seats) *
              </label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                placeholder="e.g., 2, 4, 6"
                value={formState.capacity}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>
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
              required
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="out_of_order">Out of Order</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-semibold">
              Location
            </label>
            <Input
              id="location"
              name="location"
              type="text"
              placeholder="e.g., Window, Outdoor, VIP"
              value={formState.location}
              onChange={handleChange}
              disabled={isSubmitting}
            />
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
                  {table?.id ? "Update Table" : "Create Table"}
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
