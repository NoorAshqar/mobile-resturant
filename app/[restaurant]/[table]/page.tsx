"use client";

import { Loader2, ShoppingCart } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AddonSelector } from "@/components/addon-selector";
import { MenuItemType } from "@/components/menu-item";
import { TableMenuView } from "@/components/table-order/menu-view";
import { TableOrderSummary } from "@/components/table-order/order-summary";
import { RestaurantThemeWrapper } from "@/components/table-order/restaurant-theme-wrapper";
import { TableHero } from "@/components/table-order/table-hero";
import {
  type TableOrderDetails,
  type TableOrderItem,
} from "@/components/table-order/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
const DEFAULT_LAHZA_CURRENCY = process.env.NEXT_PUBLIC_LAHZA_CURRENCY ?? "ILS";

type ActiveView = "menu" | "summary";

export default function TableOrderPage() {
  const params = useParams();
  const restaurantName = params.restaurant as string;
  const tableNumber = params.table as string;

  const [order, setOrder] = useState<TableOrderDetails | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeView, setActiveView] = useState<ActiveView>("menu");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isLahzaReady, setIsLahzaReady] = useState(false);
  const [showAddonSelector, setShowAddonSelector] = useState(false);
  const [selectedMenuItemForAddons, setSelectedMenuItemForAddons] = useState<MenuItemType | null>(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/order/${restaurantName}/${tableNumber}`,
          { credentials: "include" },
        );

        if (response.ok) {
          const data = await response.json();
          setOrder(data.order);
        } else {
          setOrder(null);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load order");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchMenuItems = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/public/restaurant/${restaurantName}`,
          { credentials: "include" },
        );

        if (response.ok) {
          const data = await response.json();
          setMenuItems(data.restaurant.menuItems || []);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load menu");
      }
    };

    fetchOrder();
    fetchMenuItems();
  }, [restaurantName, tableNumber]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.LahzaPopup) {
      setIsLahzaReady(true);
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      "script[data-lahza-loader]",
    );

    const markReady = () => setIsLahzaReady(true);

    if (existingScript) {
      existingScript.addEventListener("load", markReady);
      return () => {
        existingScript.removeEventListener("load", markReady);
      };
    }

    const script = document.createElement("script");
    script.src = "https://js.lahza.io/inline.min.js";
    script.async = true;
    script.dataset.lahzaLoader = "true";
    script.onload = markReady;
    script.onerror = () => {
      console.error("[LAHTHA_SCRIPT_ERROR] Failed to load Lahza popup script.");
      toast.error("Unable to load Lahza payment widget.");
    };
    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", markReady);
    };
  }, []);

  const isEditableOrder = order?.status === "building";

  const handleAddItem = async (menuItemId: string, addonIds: string[] = []) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/order/${restaurantName}/${tableNumber}/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ menuItemId, quantity: 1, addonIds }),
          credentials: "include",
        },
      );

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        toast.success("Item added to order");
        setShowAddonSelector(false);
        setSelectedMenuItemForAddons(null);
        setSelectedAddonIds([]);
      } else {
        toast.error("Failed to add item");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const handleMenuItemAdd = (menuItemId: string) => {
    const menuItem = menuItems.find((item) => item.id === menuItemId);
    if (menuItem && menuItem.addons && menuItem.addons.length > 0) {
      setSelectedMenuItemForAddons(menuItem);
      setSelectedAddonIds([]);
      setShowAddonSelector(true);
    } else {
      handleAddItem(menuItemId);
    }
  };

  const handleAddonConfirm = () => {
    if (selectedMenuItemForAddons) {
      handleAddItem(selectedMenuItemForAddons.id, selectedAddonIds);
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (!order || !isEditableOrder) {
      toast.error("Order already submitted to kitchen.");
      return;
    }
    if (newQuantity <= 0) {
      await handleRemoveItem(itemId);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/order/${restaurantName}/${tableNumber}/items/${itemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity: newQuantity }),
          credentials: "include",
        },
      );

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      } else {
        toast.error("Failed to update quantity");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!order || !isEditableOrder) {
      toast.error("Order already submitted to kitchen.");
      return;
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/order/${restaurantName}/${tableNumber}/items/${itemId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        toast.success("Item removed");
      } else {
        toast.error("Failed to remove item");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(new Set(menuItems.map((item) => item.category))),
    ],
    [menuItems],
  );

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      if (!matchesCategory) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return (
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.description.toLowerCase().includes(normalizedSearch) ||
        item.category.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [menuItems, selectedCategory, normalizedSearch]);

  const orderItemsByMenuId = useMemo(
    () =>
      new Map(
        order?.items.map((item) => [item.menuItemId, item as TableOrderItem]) ??
          [],
      ),
    [order],
  );

  const menuItemsById = useMemo(
    () => new Map(menuItems.map((item) => [item.id, item])),
    [menuItems],
  );

  const totalItems = order
    ? order.items.reduce((count, item) => count + item.quantity, 0)
    : 0;

  const scrollToSection = (sectionId: string) => {
    if (typeof window === "undefined") {
      return;
    }

    const target = document.getElementById(sectionId);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmitOrder = async () => {
    if (!order) {
      return;
    }

    if (!isEditableOrder) {
      toast.info("Order already sent to the kitchen.");
      return;
    }

    if (order.items.length === 0) {
      toast.error("Add at least one item before sending the order.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/order/${restaurantName}/${tableNumber}/submit`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(data?.message ?? "Failed to send order.");
        return;
      }

      toast.success("Order sent to the kitchen! Add more items anytime.");

      // Fetch the new empty order for the next round
      const newOrderResponse = await fetch(
        `${API_BASE_URL}/api/order/${restaurantName}/${tableNumber}`,
        { credentials: "include" },
      );

      if (newOrderResponse.ok) {
        const newOrderData = await newOrderResponse.json();
        setOrder(newOrderData.order);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to send order. Please try again.");
    }
  };

  const handleSummaryQuantityChange = (itemId: string, quantity: number) => {
    if (!isEditableOrder) {
      return;
    }
    if (quantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    handleUpdateQuantity(itemId, quantity);
  };

  const orderLahzaConfig = order?.restaurant.paymentConfig?.lahza;
  const lahzaPublicKey = orderLahzaConfig?.publicKey ?? null;
  const lahzaCurrency =
    orderLahzaConfig?.currency ?? DEFAULT_LAHZA_CURRENCY ?? "ILS";

  const handleLahzaPayment = () => {
    if (!order) {
      toast.error("Order not found.");
      return;
    }

    if (order.items.length === 0) {
      toast.info("Add at least one item before paying.");
      return;
    }

    if (!lahzaPublicKey) {
      toast.error("Lahza public key is not configured.");
      return;
    }

    if (typeof window === "undefined" || !window.LahzaPopup || !isLahzaReady) {
      toast.error("Lahza payment widget is not ready yet.");
      return;
    }

    const amountInMinorUnits = Math.round(order.total * 100);
    if (!Number.isFinite(amountInMinorUnits) || amountInMinorUnits <= 0) {
      toast.error("Total must be greater than zero before paying.");
      return;
    }

    setIsProcessingPayment(true);

    try {
      const popup = new window.LahzaPopup();
      popup.newTransaction({
        key: lahzaPublicKey,
        amount: amountInMinorUnits,
        currency: lahzaCurrency,
        metadata: {
          orderId: order.id,
          restaurantId: order.restaurant.id,
          restaurantName: order.restaurant.name,
          tableId: order.table.id,
          tableNumber: order.table.number,
          total: order.total,
        },
        onSuccess: async (transaction) => {
          try {
            const response = await fetch(
              `${API_BASE_URL}/api/order/${restaurantName}/${tableNumber}/payment`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                  status: "paid",
                  method: "lahza",
                  reference: transaction.reference,
                  metadata: transaction,
                }),
              },
            );

            if (response.ok) {
              const data = await response.json();
              setOrder(data.order);
              toast.success("Payment completed successfully.");
            } else {
              toast.error("Payment completed but failed to sync order.");
            }
          } catch (error) {
            console.error(error);
            toast.error("Payment completed but failed to sync order.");
          } finally {
            setIsProcessingPayment(false);
          }
        },
        onCancel: () => {
          toast.info("Payment window closed.");
          setIsProcessingPayment(false);
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Unable to initialize Lahza payment.");
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        <p className="mt-4 text-lg font-semibold text-slate-800">
          Getting your table ready
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          We’re pulling the freshest menu and your current order.
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <ShoppingCart className="mb-4 h-14 w-14 text-orange-400" />
        <p className="text-2xl font-semibold text-slate-900">
          We couldn’t find that table
        </p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Refresh the page or ask a team member to confirm your table code.
        </p>
      </div>
    );
  }

  return (
    <RestaurantThemeWrapper
      themePalette={order.restaurant.themePalette}
      themeMode={order.restaurant.themeMode}
    >
      <div className="min-h-screen bg-background pb-24 text-foreground lg:pb-16">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <TableHero
            restaurantName={order.restaurant.name}
            cuisine={order.restaurant.cuisine}
            tableNumber={order.table.number}
            capacity={order.table.capacity}
            totalItems={totalItems}
            status={order.status}
            onBrowseMenu={() => {
              setActiveView("menu");
              scrollToSection("table-menu");
            }}
            onReviewOrder={() => {
              setActiveView("summary");
              scrollToSection("order-summary");
            }}
          />

          <div className="mt-6 flex gap-3 rounded-2xl bg-card/80 p-2 shadow-sm lg:hidden">
            {[
              { id: "menu", label: "Menu" },
              { id: "summary", label: "Your Order" },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveView(id as ActiveView)}
                className={`flex-1 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  activeView === id
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row">
            <div id="table-menu" className="flex-1">
              <TableMenuView
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filteredMenuItems={filteredMenuItems}
                orderItemsByMenuId={orderItemsByMenuId}
                onAddMenuItem={handleMenuItemAdd}
                onChangeQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                isVisible={activeView === "menu"}
                canEdit={isEditableOrder}
              />
            </div>

            <div id="order-summary">
              <TableOrderSummary
                order={order}
                menuItemsById={menuItemsById}
                isVisible={activeView === "summary"}
                canEdit={isEditableOrder}
                onUpdateQuantity={handleSummaryQuantityChange}
                onRemoveItem={handleRemoveItem}
                onResumeOrdering={() => {
                  setActiveView("menu");
                  scrollToSection("table-menu");
                }}
                onSubmitOrder={handleSubmitOrder}
                restaurantName={restaurantName}
                tableNumber={tableNumber}
                paymentStatus={order.payment?.status ?? "unpaid"}
                paymentReference={order.payment?.reference ?? null}
                onPayWithLahza={handleLahzaPayment}
                isProcessingPayment={isProcessingPayment}
                isLahzaReady={isLahzaReady}
                isLahzaConfigured={Boolean(lahzaPublicKey)}
              />
            </div>
          </div>
        </div>
      </div>

      {selectedMenuItemForAddons && (
        <AddonSelector
          addons={selectedMenuItemForAddons.addons || []}
          selectedAddonIds={selectedAddonIds}
          onSelectionChange={setSelectedAddonIds}
          isOpen={showAddonSelector}
          onClose={() => {
            setShowAddonSelector(false);
            setSelectedMenuItemForAddons(null);
            setSelectedAddonIds([]);
          }}
          onConfirm={handleAddonConfirm}
          itemName={selectedMenuItemForAddons.name}
        />
      )}
    </RestaurantThemeWrapper>
  );
}
