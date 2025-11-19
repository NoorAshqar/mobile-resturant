"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";

export interface Addon {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
}

interface AddonSelectorProps {
  addons: Addon[];
  selectedAddonIds: string[];
  onSelectionChange: (addonIds: string[]) => void;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}

export function AddonSelector({
  addons,
  selectedAddonIds,
  onSelectionChange,
  isOpen,
  onClose,
  onConfirm,
  itemName,
}: AddonSelectorProps) {
  const [localSelection, setLocalSelection] = useState<string[]>(selectedAddonIds);

  const handleToggleAddon = (addonId: string) => {
    setLocalSelection((prev) => {
      if (prev.includes(addonId)) {
        return prev.filter((id) => id !== addonId);
      } else {
        return [...prev, addonId];
      }
    });
  };

  const handleConfirm = () => {
    onSelectionChange(localSelection);
    onConfirm();
  };

  const handleCancel = () => {
    setLocalSelection(selectedAddonIds);
    onClose();
  };

  const selectedAddons = addons.filter((addon) =>
    localSelection.includes(addon.id),
  );
  const totalAddonPrice = selectedAddons.reduce(
    (sum, addon) => sum + addon.price,
    0,
  );

  return (
    <Sheet open={isOpen} onOpenChange={handleCancel}>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Customize {itemName}</SheetTitle>
          <SheetDescription>
            Select addons to customize your order
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-3 py-4">
          {addons.length > 0 ? (
            addons.map((addon) => {
              const isSelected = localSelection.includes(addon.id);
              return (
                <Card
                  key={addon.id}
                  className={`cursor-pointer border-2 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/40"
                  }`}
                  onClick={() => handleToggleAddon(addon.id)}
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                            isSelected
                              ? "border-primary bg-primary"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold">{addon.name}</h4>
                          {addon.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {addon.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="font-bold">+${addon.price.toFixed(2)}</span>
                  </div>
                </Card>
              );
            })
          ) : (
            <p className="text-center text-gray-500 py-8">
              No addons available for this item
            </p>
          )}
        </div>

        <SheetFooter className="flex-col gap-2 sm:flex-row">
          <div className="flex-1 text-sm font-semibold">
            {selectedAddons.length > 0 && (
              <span>
                {selectedAddons.length} addon{selectedAddons.length > 1 ? "s" : ""} selected (+${totalAddonPrice.toFixed(2)})
              </span>
            )}
          </div>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="font-semibold">
            Add to Order
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

