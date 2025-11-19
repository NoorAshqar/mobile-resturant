"use client";

import { ShoppingCart, X } from "lucide-react";

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
        <Button className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-2xl transition-all hover:scale-110 text-black dark:text-white">
          <ShoppingCart className="h-7 w-7" />
          {totalItems > 0 ? (
            <Badge className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full p-0 text-sm font-bold border-2">
              {totalItems}
            </Badge>
          ) : null}
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle className="text-2xl">Your Order</SheetTitle>
        </SheetHeader>

        <div className="flex h-full flex-col py-6">
          {items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full">
                  <ShoppingCart className="h-12 w-12" />
                </div>
                <p className="text-lg font-semibold">Your cart is empty</p>
                <p className="text-sm mt-1">Add items to get started</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex-1 space-y-3 overflow-y-auto">
                {items.map(({ item, quantity }) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-xl p-4 border-2"
                  >
                    <div className="flex-1">
                      <div className="mb-2 flex items-start justify-between">
                        <h4 className="font-bold">{item.name}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveItem(item.id)}
                          className="ml-2 h-8 w-8 p-0 hover:bg-red-50"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">
                          Quantity: {quantity}
                        </span>
                        <span className="text-lg font-bold">
                          ${(item.price * quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t-2 pt-6">
                <div className="flex items-center justify-between text-base">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span>$2.99</span>
                </div>
                <div className="flex items-center justify-between border-t-2 pt-4">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-2xl font-bold">
                    ${(subtotal + 2.99).toFixed(2)}
                  </span>
                </div>

                <Button
                  onClick={onCheckout}
                  className="w-full h-14 text-lg font-bold text-black dark:text-white shadow-lg hover:shadow-xl"
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
