"use client";

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
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold">{restaurant.name}</h3>
            <p className="text-sm mt-1">{restaurant.cuisine}</p>
          </div>
          <Badge
            variant={restaurant.status === "active" ? "default" : "secondary"}
            className="capitalize font-semibold"
          >
            {restaurant.status}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs font-semibold">Today&apos;s Orders</p>
            <p className="text-2xl font-bold mt-1">{restaurant.todayOrders}</p>
          </div>

          <div>
            <p className="text-xs font-semibold">Revenue</p>
            <p className="text-2xl font-bold mt-1">
              ${restaurant.todayRevenue.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold">Menu Items</p>
            <p className="text-2xl font-bold mt-1">
              {restaurant.totalMenuItems}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            <span className="font-semibold text-lg">
              {restaurant.rating.toFixed(1)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {restaurant.trend === "up" ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
            <span className="font-semibold text-sm">
              {restaurant.trendPercentage}%
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
