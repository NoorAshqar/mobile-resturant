'use client';

import { Minus, Plus, Sprout } from "lucide-react";

import { colors } from "@/config/colors";
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
    <Card 
      className="overflow-hidden border-2 transition-all hover:shadow-lg"
      style={{ 
        backgroundColor: colors.background.primary,
        borderColor: colors.border.light 
      }}
    >
      <div className="flex gap-4 p-4">
        <div 
          className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl shadow-md"
          style={{ backgroundColor: colors.neutral[100] }}
        >
          <ImageWithFallback
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
          />
          {item.popular ? (
            <Badge 
              className="absolute left-2 top-2 text-xs font-bold shadow-md"
              style={{ 
                backgroundColor: colors.primary[600],
                color: colors.text.inverse 
              }}
            >
              Popular
            </Badge>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-bold text-lg truncate" style={{ color: colors.text.primary }}>
                {item.name}
              </h3>
              {item.vegetarian ? (
                <Badge
                  variant="outline"
                  className="mt-1 flex items-center gap-1 text-xs font-semibold"
                  style={{ 
                    borderColor: colors.success[500],
                    color: colors.success[600],
                    backgroundColor: colors.success[50]
                  }}
                >
                  <Sprout className="h-3 w-3" />
                  Vegetarian
                </Badge>
              ) : null}
            </div>
          </div>

          <p className="text-sm line-clamp-2 mb-3" style={{ color: colors.text.secondary }}>
            {item.description}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xl font-bold" style={{ color: colors.primary[600] }}>
              ${item.price.toFixed(2)}
            </span>

            {quantity === 0 ? (
              <Button
                size="sm"
                onClick={onAdd}
                className="h-9 px-4 text-white font-semibold shadow-md transition-all hover:shadow-lg"
                style={{ backgroundColor: colors.primary[600] }}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRemove}
                  className="h-9 w-9 p-0 border-2"
                  style={{ borderColor: colors.border.DEFAULT }}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-bold text-lg" style={{ color: colors.text.primary }}>
                  {quantity}
                </span>
                <Button
                  size="sm"
                  onClick={onAdd}
                  className="h-9 w-9 p-0 text-white shadow-md"
                  style={{ backgroundColor: colors.primary[600] }}
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
