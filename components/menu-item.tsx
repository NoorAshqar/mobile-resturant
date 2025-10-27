'use client';

import { Minus, Plus, Sprout } from "lucide-react";

import { ImageWithFallback } from "./figma/image-with-fallback";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export interface MenuItemType {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
  vegetarian?: boolean;
}

interface MenuItemProps {
  item: MenuItemType;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

export function MenuItem({ item, quantity, onAdd, onRemove }: MenuItemProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex gap-3 p-3">
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
          <ImageWithFallback
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
          />
          {item.popular ? (
            <Badge className="absolute left-1 top-1 bg-orange-500 text-white text-xs">
              Popular
            </Badge>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="truncate">{item.name}</h3>
              {item.vegetarian ? (
                <Badge
                  variant="outline"
                  className="mt-1 flex items-center gap-1 border-green-500 text-xs text-green-600"
                >
                  <Sprout className="h-3 w-3" />
                  Veg
                </Badge>
              ) : null}
            </div>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-green-600">${item.price.toFixed(2)}</span>

            {quantity === 0 ? (
              <Button
                size="sm"
                onClick={onAdd}
                className="h-8 px-3 bg-green-600 hover:bg-green-700"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRemove}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-6 text-center">{quantity}</span>
                <Button
                  size="sm"
                  onClick={onAdd}
                  className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
