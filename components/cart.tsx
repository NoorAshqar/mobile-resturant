'use client';

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
        <Button className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full bg-green-600 shadow-lg hover:bg-green-700">
          <ShoppingCart className="h-6 w-6" />
          {totalItems > 0 ? (
            <Badge className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 p-0 text-white">
              {totalItems}
            </Badge>
          ) : null}
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Your Order</SheetTitle>
        </SheetHeader>

        <div className="flex h-full flex-col py-4">
          {items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-gray-500">
              <div className="text-center">
                <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <p>Your cart is empty</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex-1 space-y-3 overflow-y-auto">
                {items.map(({ item, quantity }) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
                  >
                    <div className="flex-1">
                      <div className="mb-1 flex items-start justify-between">
                        <h4>{item.name}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveItem(item.id)}
                          className="ml-2 h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Qty: {quantity}</span>
                        <span className="text-green-600">
                          ${(item.price * quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Delivery Fee</span>
                  <span>$2.99</span>
                </div>
                <div className="flex items-center justify-between border-t pt-2">
                  <span>Total</span>
                  <span className="text-green-600">
                    ${(subtotal + 2.99).toFixed(2)}
                  </span>
                </div>

                <Button
                  onClick={onCheckout}
                  className="w-full bg-green-600 hover:bg-green-700"
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
