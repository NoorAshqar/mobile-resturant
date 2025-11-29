"use client";

import {
  Clock,
  DollarSign,
  Receipt,
  Search,
  Table as TableIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { colors } from "@/config/colors";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
const WS_BASE_URL = (() => {
  const url = API_BASE_URL.replace(/^https?:\/\//i, "");
  const protocol = API_BASE_URL.startsWith("https") ? "wss" : "ws";
  return `${protocol}://${url}`;
})();

type OrderStatus = "building" | "submitted" | "completed" | "cancelled";
type PaymentStatus = "unpaid" | "pending" | "paid" | "failed";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  restaurantId?: string;
  tableNumber: number;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  paid?: boolean;
  paidAt?: string | null;
  payment?: {
    method: string | null;
    status: PaymentStatus;
    reference: string | null;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [liveConnected, setLiveConnected] = useState(false);
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set());
  const wsRef = useRef<WebSocket | null>(null);
  const statusFilters = useMemo(
    () => [
      { id: "all" as const, label: "All" },
      { id: "submitted" as const, label: "Submitted" },
      { id: "building" as const, label: "Building" },
      { id: "completed" as const, label: "Completed" },
      { id: "cancelled" as const, label: "Cancelled" },
    ],
    [],
  );
  const statusOptions: OrderStatus[] = [
    "submitted",
    "completed",
    "cancelled",
    "building",
  ];

  const setOrderUpdating = (orderId: string, isUpdating: boolean) => {
    setUpdatingOrders((prev) => {
      const next = new Set(prev);
      if (isUpdating) {
        next.add(orderId);
      } else {
        next.delete(orderId);
      }
      return next;
    });
  };

  const upsertOrder = (incoming: Order) => {
    if (!incoming?.id) return;

    setOrders((previous) => {
      const existingIndex = previous.findIndex(
        (order) => order.id === incoming.id,
      );
      const nextOrders = [...previous];
      if (existingIndex >= 0) {
        nextOrders[existingIndex] = {
          ...nextOrders[existingIndex],
          ...incoming,
        };
      } else {
        nextOrders.unshift(incoming);
      }
      nextOrders.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      return nextOrders;
    });
  };

  const startWebSocket = () => {
    try {
      if (wsRef.current) {
        wsRef.current.close();
      }
      const wsUrl = `${WS_BASE_URL}/ws/orders`;
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setLiveConnected(true);
      };
      socket.onclose = () => {
        setLiveConnected(false);
      };
      socket.onerror = (error) => {
        setLiveConnected(false);
      };
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message?.type === "order:update" && message.payload) {
            upsertOrder(message.payload as Order);
          }
        } catch (error) {
          console.error("[WS_MESSAGE_ERROR]", error);
        }
      };
    } catch (error) {
      console.error("[WS_INIT_ERROR]", error);
      setLiveConnected(false);
    }
  };

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

  const handleStatusChange = async (
    orderId: string,
    nextStatus: OrderStatus,
  ) => {
    setOrderUpdating(orderId, true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/order/admin/${orderId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: nextStatus }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data?.order) {
          upsertOrder(data.order);
        }
        toast.success("Order status updated");
      } else {
        toast.error("Failed to update order status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update order status");
    } finally {
      setOrderUpdating(orderId, false);
    }
  };

  useEffect(() => {
    fetchOrders();
    startWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const visibleOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.status !== "building" || order.payment?.status === "paid",
    );
  }, [orders]);

  useEffect(() => {
    let filtered = visibleOrders;

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
  }, [searchQuery, statusFilter, visibleOrders]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "submitted":
        return colors.primary[600];
      case "building":
        return colors.warning[600];
      case "completed":
        return colors.success[600];
      case "cancelled":
        return colors.danger[600];
      default:
        return colors.neutral[400];
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    if (status === "building") return "Building (in progress)";
    if (status === "submitted") return "Submitted";
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
    (order) => order.status === "submitted" || order.status === "building",
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
        <Badge
          className={`px-3 py-1 text-xs font-semibold ${
            liveConnected
              ? "bg-emerald-100 text-emerald-800"
              : "bg-slate-200 text-slate-800"
          }`}
        >
          {liveConnected ? "Live updates" : "Live feed offline"}
        </Badge>
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
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <Button
                key={filter.id}
                variant="outline"
                onClick={() => setStatusFilter(filter.id)}
                className={`border-2 ${
                  statusFilter === filter.id ? "shadow-md" : ""
                }`}
              >
                {filter.label}
              </Button>
            ))}
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
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <Badge
                    style={{
                      backgroundColor: getStatusColor(order.status),
                      color: "#fff",
                    }}
                    className="font-semibold"
                  >
                    {getStatusLabel(order.status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    #{order.id.slice(-6)}
                  </span>
                </div>
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
                    className={`font-semibold ${getPaymentBadgeClasses(
                      order.payment?.status,
                    )}`}
                  >
                    {getPaymentLabel(order.payment?.status)}
                  </Badge>
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">Manage status</p>
                      <p className="text-xs text-muted-foreground">
                        Keep the kitchen and staff in sync in real-time.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((status) => {
                      const isCurrent = order.status === status;
                      const isUpdating = updatingOrders.has(order.id);
                      return (
                        <Button
                          key={status}
                          size="sm"
                          variant={isCurrent ? "default" : "outline"}
                          disabled={isCurrent || isUpdating}
                          onClick={() => handleStatusChange(order.id, status)}
                        >
                          {isCurrent ? "Current" : getStatusLabel(status)}
                        </Button>
                      );
                    })}
                  </div>
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
