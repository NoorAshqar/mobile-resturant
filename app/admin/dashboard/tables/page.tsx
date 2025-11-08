"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, Table as TableIcon } from "lucide-react";
import { toast } from "sonner";

import { colors } from "@/config/colors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TableForm } from "@/components/table-form";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: string;
  location: string;
}

export default function TableManagementPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [filteredTables, setFilteredTables] = useState<Table[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | undefined>(
    undefined,
  );

  const fetchTables = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/table`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setTables(data.tables);
        setFilteredTables(data.tables);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load tables");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = tables.filter(
      (table) =>
        table.number.toString().includes(query) ||
        table.capacity.toString().includes(query) ||
        table.status.toLowerCase().includes(query) ||
        table.location.toLowerCase().includes(query),
    );
    setFilteredTables(filtered);
  }, [searchQuery, tables]);

  const handleAdd = () => {
    setEditingTable(undefined);
    setShowForm(true);
  };

  const handleEdit = (table: Table) => {
    setEditingTable(table);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this table?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/table/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Table deleted!");
        fetchTables();
      } else {
        toast.error("Failed to delete table");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingTable(undefined);
    fetchTables();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTable(undefined);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return colors.success[600];
      case "occupied":
        return colors.primary[600];
      case "reserved":
        return colors.warning[600];
      case "out_of_order":
        return colors.danger[600];
      default:
        return colors.neutral[400];
    }
  };

  const getStatusLabel = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">Loading tables...</p>
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
              <h2 className="text-2xl font-bold">Tables</h2>
              <p className="text-sm mt-1">Manage your restaurant tables</p>
            </div>
            <Button
              onClick={handleAdd}
              className="text-white font-semibold shadow-md"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Table
            </Button>
          </div>

          {/* Search */}
          <Card className="p-4 border-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search tables by number, capacity, status, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>
          </Card>

          {/* Tables Grid */}
          {filteredTables.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {filteredTables.map((table) => (
                <Card
                  key={table.id}
                  className="overflow-hidden border-2 transition-all hover:shadow-lg"
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl">
                          <TableIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">
                            Table {table.number}
                          </h3>
                          <p className="text-sm">
                            {table.capacity}{" "}
                            {table.capacity === 1 ? "seat" : "seats"}
                          </p>
                        </div>
                      </div>
                      <Badge className="font-semibold">
                        {getStatusLabel(table.status)}
                      </Badge>
                    </div>

                    {table.location && (
                      <div className="pt-2 border-t">
                        <p className="text-sm">
                          <span className="font-semibold">Location: </span>
                          {table.location}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(table)}
                        className="flex-1 border-2"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(table.id)}
                        className="border-2 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-2">
              <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4">
                <TableIcon className="h-10 w-10" />
              </div>
              <p className="text-lg font-semibold">
                {searchQuery ? "No tables found" : "No tables yet"}
              </p>
              <p className="text-sm mt-1">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Click 'Add Table' to get started"}
              </p>
            </Card>
          )}
        </>
      ) : (
        <TableForm
          table={editingTable}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}
