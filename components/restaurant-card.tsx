'use client';

import {
  DollarSign,
  ShoppingBag,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

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
  const trendIcon =
    restaurant.trend === "up" ? (
      <TrendingUp className="h-4 w-4" />
    ) : (
      <TrendingDown className="h-4 w-4" />
    );

  const trendColour =
    restaurant.trend === "up" ? "text-green-600" : "text-red-600";

  return (
    <Card
      className="cursor-pointer p-4 transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-1">{restaurant.name}</h3>
          <p className="text-sm text-gray-600">{restaurant.cuisine}</p>
        </div>
        <Badge
          variant={restaurant.status === "active" ? "default" : "secondary"}
          className={
            restaurant.status === "active" ? "bg-green-600 text-white" : ""
          }
        >
          {restaurant.status}
        </Badge>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-blue-50 p-3">
          <div className="mb-1 flex items-center gap-2 text-blue-600">
            <ShoppingBag className="h-4 w-4" />
            <span className="text-xs">Orders Today</span>
          </div>
          <p className="text-blue-900">{restaurant.todayOrders}</p>
        </div>

        <div className="rounded-lg bg-green-50 p-3">
          <div className="mb-1 flex items-center gap-2 text-green-600">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs">Revenue</span>
          </div>
          <p className="text-green-900">
            ${restaurant.todayRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-gray-600">
            <Users className="h-4 w-4 text-gray-400" />
            <span>{restaurant.totalMenuItems} items</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>{restaurant.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className={`flex items-center gap-1 ${trendColour}`}>
          {trendIcon}
          <span className="text-xs">{restaurant.trendPercentage}%</span>
        </div>
      </div>
    </Card>
  );
}
