'use client';

import { useEffect, useState } from "react";
import { Receipt, Search, Clock, DollarSign, Table as TableIcon } from "lucide-react";
import { toast } from "sonner";

import { colors } from "@/config/colors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.tableNumber.toString().includes(query) ||
          order.items.some((item) =>
            item.name.toLowerCase().includes(query)
          ) ||
          order.id.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, orders]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/order/admin/list`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        setFilteredOrders(data.orders);
      } else {
        toast.error("Failed to load orders");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return colors.primary[600];
      case "completed":
        return colors.success[600];
      case "cancelled":
        return colors.danger[600];
      default:
        return colors.neutral[400];
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalRevenue = orders
    .filter((order) => order.status === "completed")
    .reduce((sum, order) => sum + order.total, 0);

  const activeOrders = orders.filter((order) => order.status === "active").length;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg" style={{ color: colors.text.secondary }}>
          Loading orders...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
            Orders
          </h2>
          <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
            View and manage all restaurant orders
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="p-4 border-2"
          style={{ 
            backgroundColor: colors.background.primary,
            borderColor: colors.border.light 
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: colors.text.secondary }}>
                Active Orders
              </p>
              <p className="text-2xl font-bold mt-1" style={{ color: colors.text.primary }}>
                {activeOrders}
              </p>
            </div>
            <div 
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: colors.primary[100] }}
            >
              <Receipt className="h-6 w-6" style={{ color: colors.primary[600] }} />
            </div>
          </div>
        </Card>

        <Card 
          className="p-4 border-2"
          style={{ 
            backgroundColor: colors.background.primary,
            borderColor: colors.border.light 
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: colors.text.secondary }}>
                Total Revenue
              </p>
              <p className="text-2xl font-bold mt-1" style={{ color: colors.text.primary }}>
                ${totalRevenue.toFixed(2)}
              </p>
            </div>
            <div 
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: colors.success[100] }}
            >
              <DollarSign className="h-6 w-6" style={{ color: colors.success[600] }} />
            </div>
          </div>
        </Card>

        <Card 
          className="p-4 border-2"
          style={{ 
            backgroundColor: colors.background.primary,
            borderColor: colors.border.light 
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: colors.text.secondary }}>
                Total Orders
              </p>
              <p className="text-2xl font-bold mt-1" style={{ color: colors.text.primary }}>
                {orders.length}
              </p>
            </div>
            <div 
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: colors.secondary[100] }}
            >
              <TableIcon className="h-6 w-6" style={{ color: colors.secondary[600] }} />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card 
        className="p-4 border-2"
        style={{ 
          backgroundColor: colors.background.primary,
          borderColor: colors.border.light 
        }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search 
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" 
              style={{ color: colors.text.tertiary }} 
            />
            <Input
              type="text"
              placeholder="Search by table number, item name, or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base"
              style={{ 
                borderColor: colors.border.DEFAULT,
                backgroundColor: colors.background.primary 
              }}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setStatusFilter("all")}
              className={`border-2 ${statusFilter === "all" ? "shadow-md" : ""}`}
              style={{
                backgroundColor: statusFilter === "all" ? colors.primary[600] : colors.background.primary,
                color: statusFilter === "all" ? colors.text.inverse : colors.text.primary,
                borderColor: statusFilter === "all" ? colors.primary[600] : colors.border.DEFAULT,
              }}
            >
              All
            </Button>
            <Button
              variant="outline"
              onClick={() => setStatusFilter("active")}
              className={`border-2 ${statusFilter === "active" ? "shadow-md" : ""}`}
              style={{
                backgroundColor: statusFilter === "active" ? colors.primary[600] : colors.background.primary,
                color: statusFilter === "active" ? colors.text.inverse : colors.text.primary,
                borderColor: statusFilter === "active" ? colors.primary[600] : colors.border.DEFAULT,
              }}
            >
              Active
            </Button>
            <Button
              variant="outline"
              onClick={() => setStatusFilter("completed")}
              className={`border-2 ${statusFilter === "completed" ? "shadow-md" : ""}`}
              style={{
                backgroundColor: statusFilter === "completed" ? colors.success[600] : colors.background.primary,
                color: statusFilter === "completed" ? colors.text.inverse : colors.text.primary,
                borderColor: statusFilter === "completed" ? colors.success[600] : colors.border.DEFAULT,
              }}
            >
              Completed
            </Button>
            <Button
              variant="outline"
              onClick={() => setStatusFilter("cancelled")}
              className={`border-2 ${statusFilter === "cancelled" ? "shadow-md" : ""}`}
              style={{
                backgroundColor: statusFilter === "cancelled" ? colors.danger[600] : colors.background.primary,
                color: statusFilter === "cancelled" ? colors.text.inverse : colors.text.primary,
                borderColor: statusFilter === "cancelled" ? colors.danger[600] : colors.border.DEFAULT,
              }}
            >
              Cancelled
            </Button>
          </div>
        </div>
      </Card>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card 
              key={order.id}
              className="overflow-hidden border-2 transition-all hover:shadow-lg"
              style={{ 
                backgroundColor: colors.background.primary,
                borderColor: colors.border.light 
              }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ backgroundColor: colors.primary[100] }}
                    >
                      <TableIcon className="h-6 w-6" style={{ color: colors.primary[600] }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: colors.text.primary }}>
                        Table {order.tableNumber}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4" style={{ color: colors.text.tertiary }} />
                        <p className="text-sm" style={{ color: colors.text.secondary }}>
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    className="font-semibold"
                    style={{ 
                      backgroundColor: getStatusColor(order.status),
                      color: colors.text.inverse 
                    }}
                  >
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>

                <div className="mb-4 pt-4 border-t-2" style={{ borderColor: colors.border.light }}>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-semibold" style={{ color: colors.text.primary }}>
                            {item.name}
                          </span>
                          <span className="text-xs" style={{ color: colors.text.tertiary }}>
                            x{item.quantity}
                          </span>
                        </div>
                        <span className="font-semibold" style={{ color: colors.text.primary }}>
                          ${item.subtotal.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t-2" style={{ borderColor: colors.border.light }}>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: colors.text.secondary }}>Subtotal:</span>
                      <span className="font-semibold ml-4" style={{ color: colors.text.primary }}>
                        ${order.subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: colors.text.secondary }}>Tax:</span>
                      <span className="font-semibold ml-4" style={{ color: colors.text.primary }}>
                        ${order.tax.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: colors.text.secondary }}>
                      Total
                    </p>
                    <p className="text-2xl font-bold" style={{ color: colors.primary[600] }}>
                      ${order.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card 
          className="p-12 text-center border-2"
          style={{ 
            backgroundColor: colors.background.primary,
            borderColor: colors.border.light 
          }}
        >
          <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: colors.neutral[100] }}>
            <Receipt className="h-10 w-10" style={{ color: colors.text.tertiary }} />
          </div>
          <p className="text-lg font-semibold" style={{ color: colors.text.primary }}>
            {searchQuery || statusFilter !== "all" ? "No orders found" : "No orders yet"}
          </p>
          <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
            {searchQuery || statusFilter !== "all" ? "Try adjusting your filters" : "Orders will appear here once customers place them"}
          </p>
        </Card>
      )}
    </div>
  );
}

