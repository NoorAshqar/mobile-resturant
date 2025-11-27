"use client";

import {
  ChefHat,
  ChevronDown,
  ChevronUp,
  Loader2,
  Minus,
  Plus,
  Receipt,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { ImageWithFallback } from "@/components/figma/image-with-fallback";
import { MenuItemType } from "@/components/menu-item";
import {
  TableOrderDetails,
  TableOrderPaymentStatus,
  SubmittedOrder,
} from "@/components/table-order/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface TableOrderSummaryProps {
  order: TableOrderDetails;
  menuItemsById: Map<string, MenuItemType>;
  isVisible: boolean;
  canEdit: boolean;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onResumeOrdering: () => void;
  onSubmitOrder: () => void;
  restaurantName: string;
  tableNumber: string;
  paymentStatus: TableOrderPaymentStatus;
  paymentReference: string | null;
  onPayWithLahza: (tipAmount?: number) => void;
  isProcessingPayment: boolean;
  isLahzaReady: boolean;
  isLahzaConfigured: boolean;
  submittedOrders: SubmittedOrder[];
  flowConfig: {
    orderingEnabled: boolean;
    paymentEnabled: boolean;
    requirePaymentBeforeOrder: boolean;
  };
  tipsConfig: { enabled: boolean; percentages: number[] };
}

export function TableOrderSummary({
  order,
  menuItemsById,
  isVisible,
  canEdit,
  onUpdateQuantity,
  onRemoveItem,
  onResumeOrdering,
  onSubmitOrder,
  restaurantName,
  tableNumber,
  paymentStatus,
  paymentReference,
  onPayWithLahza,
  isProcessingPayment,
  isLahzaReady,
  isLahzaConfigured,
  submittedOrders,
  flowConfig,
  tipsConfig,
}: TableOrderSummaryProps) {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [tipInput, setTipInput] = useState<string>("");
  const { orderingEnabled, paymentEnabled, requirePaymentBeforeOrder } = flowConfig;

  const toggleOrderExpanded = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const isPaid = paymentStatus === "paid";
  const displayItems = isPaid ? [] : order.items;
  const displaySubmittedOrders = isPaid ? [] : submittedOrders;
  const currentOrderSubtotal = isPaid ? 0 : order.subtotal;
  const currentOrderTax = 0;
  const currentOrderTotal = currentOrderSubtotal;
  const sessionOrderCount =
    displaySubmittedOrders.length + (displayItems.length > 0 ? 1 : 0);

  const grandSubtotal =
    displaySubmittedOrders.reduce((sum, o) => sum + o.subtotal, 0) +
    currentOrderSubtotal;
  const grandTax = 0;
  const grandTotal = grandSubtotal;

  const numericTip = Number.parseFloat(tipInput);
  const tipAmount = Number.isFinite(numericTip) && numericTip > 0 ? numericTip : 0;

  const finalTotal = grandTotal + tipAmount;
  const hasBalance = grandTotal > 0;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const paymentStatusLabels: Record<TableOrderPaymentStatus, string> = {
    unpaid: "Unpaid",
    pending: "Pending",
    paid: "Paid",
    failed: "Failed",
  };

  const paymentStatusMessages: Record<TableOrderPaymentStatus, string> = {
    unpaid: "Use Lahza to pay securely from your phone.",
    pending: "We received your payment and are waiting for confirmation.",
    paid: "Thanks! Your payment is confirmed.",
    failed: "The last attempt failed. Please try again or ask for help.",
  };

  const paymentBadgeClasses: Record<TableOrderPaymentStatus, string> = {
    unpaid: "bg-slate-200 text-slate-900",
    pending: "bg-amber-100 text-amber-900",
    paid: "bg-emerald-100 text-emerald-900",
    failed: "bg-rose-100 text-rose-900",
  };

  const paymentRequiredBeforeOrder =
    requirePaymentBeforeOrder && paymentEnabled && paymentStatus !== "paid";

  const disableLahzaButton =
    !canEdit ||
    !paymentEnabled ||
    !isLahzaConfigured ||
    !isLahzaReady ||
    isProcessingPayment ||
    !hasBalance ||
    paymentStatus === "paid" ||
    paymentStatus === "pending";

  const submitDisabled =
    !canEdit ||
    !orderingEnabled ||
    order.items.length === 0 ||
    (paymentRequiredBeforeOrder && disableLahzaButton);

  const handleSubmitClick = () => {
    if (paymentRequiredBeforeOrder) {
      onPayWithLahza(tipAmount);
      return;
    }
    onSubmitOrder();
  };

  return (
    <div className={`${isVisible ? "block" : "hidden"} lg:block lg:w-[380px]`}>
      <div>
        <Card className="rounded-3xl border-0 bg-card p-6 text-card-foreground shadow-xl ring-1 ring-border/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
                Current order
              </p>
              <p className="text-2xl font-semibold text-foreground">
                {displayItems.length === 0
                  ? "No items yet"
                  : `${displayItems.length} ${displayItems.length === 1 ? "item" : "items"
                  }`}
              </p>
            </div>
            <div className="rounded-2xl bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">
              <Receipt className="mr-2 inline h-4 w-4 text-primary" />
              Table {order.table.number}
            </div>
          </div>

          {!canEdit && displayItems.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm">
              <p className="font-semibold text-foreground">
                ✓ Order sent to kitchen
              </p>
              <p className="mt-1 text-muted-foreground">
                Your order is being prepared. Keep browsing the menu to add more
                items for another round!
              </p>
            </div>
          ) : null}

          {displayItems.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-6 text-center">
              <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="font-semibold text-foreground">
                Ready when you are
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add dishes from the menu and they’ll appear here.
              </p>
              <Button
                className="mt-4 w-full rounded-full"
                onClick={onResumeOrdering}
              >
                Start ordering
              </Button>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {displayItems.map((item) => {
                const menuItem = menuItemsById.get(item.menuItemId);
                return (
                  <div
                    key={item.id}
                    className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3"
                  >
                    {menuItem ? (
                      <div className="h-14 w-14 overflow-hidden rounded-xl bg-white">
                        <ImageWithFallback
                          src={menuItem.image}
                          alt={menuItem.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white">
                        <ChefHat className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ${item.price.toFixed(2)} each
                          </p>
                          {item.addons && item.addons.length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              {item.addons.map((addon) => (
                                <p key={addon.id} className="text-xs text-muted-foreground/80">
                                  + {addon.name} (+${addon.price.toFixed(2)})
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-bold text-foreground">
                          ${item.subtotal.toFixed(2)}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 rounded-full p-0"
                            onClick={() =>
                              onUpdateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={!canEdit}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm font-bold">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            className="h-8 w-8 rounded-full bg-primary p-0 text-black dark:text-white hover:bg-primary/90"
                            onClick={() =>
                              onUpdateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={!canEdit}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs font-semibold text-muted-foreground hover:text-red-500"
                          onClick={() => onRemoveItem(item.id)}
                          disabled={!canEdit}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {displaySubmittedOrders.length > 0 && (
            <div className="mt-6 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                MY CURRENT ORDERS
              </p>
              {displaySubmittedOrders.map((submittedOrder, index) => {
                const isExpanded = expandedOrders.has(submittedOrder.id);
                const displaySubtotal = submittedOrder.subtotal;
                const displayTax = 0;
                const displayTotal = displaySubtotal + displayTax;
                return (
                  <div
                    key={submittedOrder.id}
                    className="rounded-2xl border border-primary/20 bg-primary/5 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleOrderExpanded(submittedOrder.id)}
                      className="w-full p-4 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-bold uppercase tracking-wider text-primary">
                              Order #{displaySubmittedOrders.length - index}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              • {formatTime(submittedOrder.submittedAt)}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {submittedOrder.items.length}{" "}
                            {submittedOrder.items.length === 1
                              ? "item"
                              : "items"}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-lg font-bold text-foreground">
                            ${displayTotal.toFixed(2)}
                          </p>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-primary/20 bg-background/50 p-4">
                        <div className="space-y-3">
                          {submittedOrder.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start justify-between"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-foreground">
                                  {item.quantity}× {item.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  ${item.price.toFixed(2)} each
                                </p>
                                {item.addons && item.addons.length > 0 && (
                                  <div className="mt-1 space-y-0.5">
                                    {item.addons.map((addon) => (
                                      <p key={addon.id} className="text-xs text-muted-foreground/80">
                                        + {addon.name} (+${addon.price.toFixed(2)})
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <p className="text-sm font-bold text-foreground">
                                ${item.subtotal.toFixed(2)}
                              </p>
                            </div>
                          ))}

                          <div className="mt-4 space-y-2 border-t border-border pt-3 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                              <span>Subtotal</span>
                              <span>${displaySubtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-foreground">
                              <span>Total</span>
                              <span>${displayTotal.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 space-y-3 rounded-2xl bg-muted/40 px-4 py-4 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-foreground">
                ${grandSubtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3 text-base font-bold text-foreground">
              <span>Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {sessionOrderCount > 1 && !isPaid && (
            <p className="mt-2 text-xs font-semibold uppercase tracking-tight text-muted-foreground">
              Paying for {sessionOrderCount} orders together
            </p>
          )}

          {tipsConfig.enabled && !isPaid && (
            <div className="mt-6 space-y-3 rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-4 text-sm">
              <p className="font-semibold text-foreground">Add a tip</p>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={tipInput}
                onChange={(e) => setTipInput(e.target.value)}
                placeholder="Enter a tip amount"
                className="w-full text-sm font-semibold"
              />
              <div className="flex justify-between text-sm font-medium">
                <span>Tip amount</span>
                <span>${tipAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          {paymentEnabled && (
            <div className="mt-6 space-y-3 rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Payment status
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {paymentStatusMessages[paymentStatus]}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentBadgeClasses[paymentStatus]}`}
                >
                  {paymentStatusLabels[paymentStatus]}
                </span>
              </div>

              {paymentReference && (
                <p className="text-xs text-muted-foreground">
                  Reference:{" "}
                  <span className="font-semibold">{paymentReference}</span>
                </p>
              )}

              <Button
                className="mt-2 w-full rounded-full text-sm font-semibold"
                onClick={() => onPayWithLahza(tipAmount)}
                disabled={disableLahzaButton}
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing with Lahza...
                  </>
                ) : (
                  `Pay $${finalTotal.toFixed(2)} with Lahza`
                )}
              </Button>

              {paymentRequiredBeforeOrder && (
                <p className="text-xs text-amber-600">
                  Payment is required before sending this order.
                </p>
              )}

              {!isLahzaConfigured && (
                <p className="text-xs text-amber-600">
                  Lahza public key is not configured. Please contact the
                  restaurant admin.
                </p>
              )}
              {!isLahzaReady && isLahzaConfigured && (
                <p className="text-xs text-muted-foreground">
                  Loading Lahza payment widget...
                </p>
              )}
              <p className="text-xs text-muted-foreground">Powered by Lahza.</p>
            </div>
          )}
          {!paymentEnabled && (
            <div className="mt-6 space-y-3 rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-4 text-sm text-muted-foreground">
              <p className="text-sm font-semibold text-foreground">Payments disabled</p>
              <p>
                This restaurant is not accepting payments through the app right now.
                Please settle your bill with the staff.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Fixed Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden">
        <div className="mx-auto max-w-md">
          <Button
            className="w-full rounded-full text-base font-semibold shadow-xl"
            onClick={handleSubmitClick}
            disabled={submitDisabled}
          >
            {paymentRequiredBeforeOrder
              ? isProcessingPayment
                ? "Processing payment..."
                : "Pay & send to kitchen"
              : canEdit
                ? "Send order to kitchen"
                : "Order sent"}
          </Button>
        </div>
      </div>

      {/* Desktop Submit Button */}
      <div className="hidden lg:block">
        <Card className="mt-4 rounded-3xl border-0 bg-card p-4 shadow-xl ring-1 ring-border/10">
          <Button
            className="w-full rounded-full text-base font-semibold"
            onClick={handleSubmitClick}
            disabled={submitDisabled}
          >
            {paymentRequiredBeforeOrder
              ? isProcessingPayment
                ? "Processing payment..."
                : "Pay & send to kitchen"
              : canEdit
                ? "Send order to kitchen"
                : "Order sent"}
          </Button>
        </Card>

        <Card className="mt-4 rounded-3xl border-0 bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white shadow-xl">
          <p className="text-sm font-semibold text-white/80">
            Need anything else?
          </p>
          <p className="mt-2 text-base">
            Flag a server or keep exploring the menu. Your progress is saved
            automatically.
          </p>
          <Button
            variant="secondary"
            className="mt-4 w-full rounded-full bg-white/15 text-sm font-semibold text-black dark:text-white hover:bg-white/25"
            onClick={onResumeOrdering}
          >
            Keep browsing
          </Button>
        </Card>
      </div>
    </div>
  );
}
