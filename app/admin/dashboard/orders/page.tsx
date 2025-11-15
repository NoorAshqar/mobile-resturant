"use client";

import { useEffect, useState } from "react";
import {
  Receipt,
  Search,
  Clock,
  DollarSign,
  Table as TableIcon,
} from "lucide-react";
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
  payment?: {
    method: string | null;
    status: "unpaid" | "pending" | "paid" | "failed";
    reference: string | null;
  };
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
          order.items.some((item) => item.name.toLowerCase().includes(query)) ||
          order.id.toLowerCase().includes(query),
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

  const getPaymentBadgeClasses = (status?: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-amber-100 text-amber-900";
      case "failed":
        return "bg-rose-100 text-rose-900";
      default:
        return "bg-slate-200 text-slate-900";
    }
  };

  const getPaymentLabel = (status?: string) => {
    if (!status) return "Unpaid";
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

  const activeOrders = orders.filter(
    (order) => order.status === "active",
  ).length;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Orders</h2>
          <p className="text-sm mt-1">View and manage all restaurant orders</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Active Orders</p>
              <p className="text-2xl font-bold mt-1">{activeOrders}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl">
              <Receipt className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">
                ${totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Total Orders</p>
              <p className="text-2xl font-bold mt-1">{orders.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl">
              <TableIcon className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 border-2">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search by table number, item name, or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setStatusFilter("all")}
              className={`border-2 ${
                statusFilter === "all" ? "shadow-md" : ""
              }`}
            >
              All
            </Button>
            <Button
              variant="outline"
              onClick={() => setStatusFilter("active")}
              className={`border-2 ${
                statusFilter === "active" ? "shadow-md" : ""
              }`}
            >
              Active
            </Button>
            <Button
              variant="outline"
              onClick={() => setStatusFilter("completed")}
              className={`border-2 ${
                statusFilter === "completed" ? "shadow-md" : ""
              }`}
            >
              Completed
            </Button>
            <Button
              variant="outline"
              onClick={() => setStatusFilter("cancelled")}
              className={`border-2 ${
                statusFilter === "cancelled" ? "shadow-md" : ""
              }`}
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
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl">
                      <TableIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        Table {order.tableNumber}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4" />
                        <p className="text-sm">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                  <Badge className="font-semibold">
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>

                <div className="mb-4 pt-4 border-t-2">
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{item.name}</span>
                          <span className="text-xs">x{item.quantity}</span>
                        </div>
                        <span className="font-semibold">
                          ${item.subtotal.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span className="font-semibold ml-4">
                        ${order.subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax:</span>
                      <span className="font-semibold ml-4">
                        ${order.tax.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">Total</p>
                    <p className="text-2xl font-bold">
                      ${order.total.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <div>
                    <p className="text-sm font-semibold">Payment</p>
                    <p className="text-xs text-muted-foreground">
                      {order.payment?.reference ?? "Awaiting reference"}
                    </p>
                  </div>
                  <Badge
                    className={`font-semibold ${getPaymentBadgeClasses(order.payment?.status)}`}
                  >
                    {getPaymentLabel(order.payment?.status)}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center border-2">
          <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4">
            <Receipt className="h-10 w-10" />
          </div>
          <p className="text-lg font-semibold">
            {searchQuery || statusFilter !== "all"
              ? "No orders found"
              : "No orders yet"}
          </p>
          <p className="text-sm mt-1">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Orders will appear here once customers place them"}
          </p>
        </Card>
      )}
    </div>
  );
}
