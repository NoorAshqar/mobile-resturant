"use client";

import { ChevronDown, ChevronUp, Clock, Receipt } from "lucide-react";
import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface HistoricalOrder {
  id: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  paid: boolean;
  submittedAt: string;
  createdAt: string;
}

interface OrderSession {
  sessionKey: string;
  orders: HistoricalOrder[];
  totalAmount: number;
  firstSubmittedAt: string;
  lastSubmittedAt: string;
}

interface OrderHistoryData {
  sessions: OrderSession[];
  grandTotal: number;
  orderCount: number;
}

interface OrderHistoryProps {
  restaurantName: string;
  tableNumber: string;
  isVisible: boolean;
}

export function OrderHistory({
  restaurantName,
  tableNumber,
  isVisible,
}: OrderHistoryProps) {
  const [history, setHistory] = useState<OrderHistoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/order/${restaurantName}/${tableNumber}/history`,
          { credentials: "include" },
        );

        if (response.ok) {
          const data = await response.json();
          setHistory(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isVisible) {
      fetchHistory();
    }
  }, [restaurantName, tableNumber, isVisible]);

  const toggleSession = (sessionKey: string) => {
    setExpandedSessions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sessionKey)) {
        newSet.delete(sessionKey);
      } else {
        newSet.add(sessionKey);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!isVisible) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="rounded-3xl border-0 bg-card p-6 shadow-xl ring-1 ring-border/10">
        <p className="text-center text-sm text-muted-foreground">
          Loading order history...
        </p>
      </Card>
    );
  }

  if (!history || history.sessions.length === 0) {
    return (
      <Card className="rounded-3xl border-0 bg-card p-6 shadow-xl ring-1 ring-border/10">
        <div className="text-center">
          <Receipt className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
          <p className="font-semibold text-foreground">No unpaid orders yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your submitted orders will appear here until paid.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-0 bg-gradient-to-br from-primary to-primary/80 p-6 text-black dark:text-white shadow-xl">
        <p className="text-xs uppercase tracking-[0.4em] text-black dark:text-white/70">
          Total Unpaid
        </p>
        <p className="mt-2 text-4xl font-bold">
          ${history.grandTotal.toFixed(2)}
        </p>
        <p className="mt-2 text-sm text-white/80">
          {history.orderCount} {history.orderCount === 1 ? "order" : "orders"}{" "}
          across {history.sessions.length}{" "}
          {history.sessions.length === 1 ? "session" : "sessions"}
        </p>
      </Card>

      <div className="space-y-3">
        {history.sessions.map((session) => {
          const isExpanded = expandedSessions.has(session.sessionKey);
          return (
            <Card
              key={session.sessionKey}
              className="rounded-3xl border-0 bg-card shadow-xl ring-1 ring-border/10"
            >
              <button
                type="button"
                onClick={() => toggleSession(session.sessionKey)}
                className="w-full p-6 text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <p className="text-sm font-semibold text-foreground">
                        {formatDate(session.firstSubmittedAt)}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {session.orders.length}{" "}
                      {session.orders.length === 1 ? "order" : "orders"}{" "}
                      submitted
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold text-foreground">
                      ${session.totalAmount.toFixed(2)}
                    </p>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border px-6 pb-6">
                  <div className="mt-4 space-y-3">
                    {session.orders.map((order, index) => (
                      <div
                        key={order.id}
                        className="rounded-2xl bg-muted/40 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Order #{index + 1}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(order.submittedAt)}
                          </p>
                        </div>

                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex-1">
                                <span className="font-medium text-foreground">
                                  {item.quantity}× {item.name}
                                </span>
                              </div>
                              <span className="font-semibold text-foreground">
                                ${item.subtotal.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal</span>
                            <span>${order.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Tax</span>
                            <span>${order.tax.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-foreground">
                            <span>Total</span>
                            <span>${order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
