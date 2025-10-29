'use client';

import { ShoppingCart, X } from "lucide-react";

import { colors } from "@/config/colors";
import { MenuItemType } from "./menu-item";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

interface CartItem {
  item: MenuItemType;
  quantity: number;
}

interface CartProps {
  items: CartItem[];
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
}

export function Cart({ items, onRemoveItem, onCheckout }: CartProps) {
  const totalItems = items.reduce((sum, entry) => sum + entry.quantity, 0);
  const subtotal = items.reduce(
    (sum, entry) => sum + entry.item.price * entry.quantity,
    0,
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-2xl transition-all hover:scale-110 text-white"
          style={{ backgroundColor: colors.primary[600] }}
        >
          <ShoppingCart className="h-7 w-7" />
          {totalItems > 0 ? (
            <Badge 
              className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full p-0 text-sm font-bold border-2"
              style={{ 
                backgroundColor: colors.secondary[600],
                color: colors.text.inverse,
                borderColor: colors.background.primary
              }}
            >
              {totalItems}
            </Badge>
          ) : null}
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="h-[85vh]" style={{ backgroundColor: colors.background.primary }}>
        <SheetHeader>
          <SheetTitle className="text-2xl" style={{ color: colors.text.primary }}>
            Your Order
          </SheetTitle>
        </SheetHeader>

        <div className="flex h-full flex-col py-6">
          {items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <div 
                  className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.neutral[100] }}
                >
                  <ShoppingCart className="h-12 w-12" style={{ color: colors.text.tertiary }} />
                </div>
                <p className="text-lg font-semibold" style={{ color: colors.text.secondary }}>
                  Your cart is empty
                </p>
                <p className="text-sm mt-1" style={{ color: colors.text.tertiary }}>
                  Add items to get started
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex-1 space-y-3 overflow-y-auto">
                {items.map(({ item, quantity }) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-xl p-4 border-2"
                    style={{ 
                      backgroundColor: colors.background.secondary,
                      borderColor: colors.border.light 
                    }}
                  >
                    <div className="flex-1">
                      <div className="mb-2 flex items-start justify-between">
                        <h4 className="font-bold" style={{ color: colors.text.primary }}>
                          {item.name}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveItem(item.id)}
                          className="ml-2 h-8 w-8 p-0 hover:bg-red-50"
                        >
                          <X className="h-5 w-5" style={{ color: colors.danger[600] }} />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold" style={{ color: colors.text.secondary }}>
                          Quantity: {quantity}
                        </span>
                        <span className="text-lg font-bold" style={{ color: colors.primary[600] }}>
                          ${(item.price * quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div 
                className="space-y-4 border-t-2 pt-6"
                style={{ borderColor: colors.border.DEFAULT }}
              >
                <div className="flex items-center justify-between text-base">
                  <span className="font-semibold" style={{ color: colors.text.secondary }}>
                    Subtotal
                  </span>
                  <span className="font-bold" style={{ color: colors.text.primary }}>
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: colors.text.secondary }}>Delivery Fee</span>
                  <span style={{ color: colors.text.primary }}>$2.99</span>
                </div>
                <div 
                  className="flex items-center justify-between border-t-2 pt-4"
                  style={{ borderColor: colors.border.DEFAULT }}
                >
                  <span className="text-xl font-bold" style={{ color: colors.text.primary }}>
                    Total
                  </span>
                  <span className="text-2xl font-bold" style={{ color: colors.primary[600] }}>
                    ${(subtotal + 2.99).toFixed(2)}
                  </span>
                </div>

                <Button
                  onClick={onCheckout}
                  className="w-full h-14 text-lg font-bold text-white shadow-lg hover:shadow-xl"
                  style={{ backgroundColor: colors.primary[600] }}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
