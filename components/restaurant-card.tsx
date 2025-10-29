'use client';

import { Star, TrendingUp, TrendingDown } from "lucide-react";

import { colors } from "@/config/colors";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

export interface RestaurantData {
  id: string;
  name: string;
  cuisine: string;
  status: "active" | "inactive";
  todayOrders: number;
  todayRevenue: number;
  totalMenuItems: number;
  rating: number;
  trend: "up" | "down";
  trendPercentage: number;
}

interface RestaurantCardProps {
  restaurant: RestaurantData;
  onClick?: () => void;
}

export function RestaurantCard({ restaurant, onClick }: RestaurantCardProps) {
  return (
    <Card 
      className="p-6 cursor-pointer transition-all hover:shadow-xl border-2" 
      onClick={onClick}
      style={{ 
        backgroundColor: colors.background.primary,
        borderColor: colors.border.light 
      }}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold" style={{ color: colors.text.primary }}>
              {restaurant.name}
            </h3>
            <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
              {restaurant.cuisine}
            </p>
          </div>
          <Badge 
            variant={restaurant.status === "active" ? "default" : "secondary"}
            className="capitalize font-semibold"
            style={{
              backgroundColor: restaurant.status === "active" ? colors.success[500] : colors.neutral[400],
              color: colors.text.inverse
            }}
          >
            {restaurant.status}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: colors.border.light }}>
          <div>
            <p className="text-xs font-semibold" style={{ color: colors.text.tertiary }}>
              Today's Orders
            </p>
            <p className="text-2xl font-bold mt-1" style={{ color: colors.text.primary }}>
              {restaurant.todayOrders}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold" style={{ color: colors.text.tertiary }}>
              Revenue
            </p>
            <p className="text-2xl font-bold mt-1" style={{ color: colors.primary[600] }}>
              ${restaurant.todayRevenue.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold" style={{ color: colors.text.tertiary }}>
              Menu Items
            </p>
            <p className="text-2xl font-bold mt-1" style={{ color: colors.text.primary }}>
              {restaurant.totalMenuItems}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: colors.border.light }}>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5" style={{ color: colors.warning[500], fill: colors.warning[500] }} />
            <span className="font-semibold text-lg" style={{ color: colors.text.primary }}>
              {restaurant.rating.toFixed(1)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {restaurant.trend === "up" ? (
              <TrendingUp className="h-5 w-5" style={{ color: colors.success[600] }} />
            ) : (
              <TrendingDown className="h-5 w-5" style={{ color: colors.danger[600] }} />
            )}
            <span 
              className="font-semibold text-sm"
              style={{ color: restaurant.trend === "up" ? colors.success[600] : colors.danger[600] }}
            >
              {restaurant.trendPercentage}%
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
