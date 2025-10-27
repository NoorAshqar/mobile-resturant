'use client';

import { useMemo, useState } from "react";
import {
  DollarSign,
  Eye,
  LayoutDashboard,
  Plus,
  Search,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

import { RestaurantCard, type RestaurantData } from "./restaurant-card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";

interface RestaurantDashboardProps {
  restaurants: RestaurantData[];
  onViewRestaurant?: (restaurantId: string) => void;
}

export function RestaurantDashboard({
  restaurants,
  onViewRestaurant,
}: RestaurantDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRestaurants = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return restaurants.filter(
      (restaurant) =>
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.cuisine.toLowerCase().includes(query),
    );
  }, [restaurants, searchQuery]);

  const totalRevenue = useMemo(
    () => restaurants.reduce((sum, current) => sum + current.todayRevenue, 0),
    [restaurants],
  );

  const totalOrders = useMemo(
    () => restaurants.reduce((sum, current) => sum + current.todayOrders, 0),
    [restaurants],
  );

  const activeRestaurants = useMemo(
    () => restaurants.filter((entry) => entry.status === "active").length,
    [restaurants],
  );

  const avgRating = useMemo(() => {
    if (restaurants.length === 0) {
      return "0.0";
    }
    const total = restaurants.reduce(
      (sum, current) => sum + current.rating,
      0,
    );
    return (total / restaurants.length).toFixed(1);
  }, [restaurants]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="mb-1">Restaurant Dashboard</h1>
              <p className="text-sm text-gray-600">Manage your restaurants</p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Restaurant
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card className="p-3">
              <div className="mb-1 flex items-center gap-2 text-green-600">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs">Total Revenue</span>
              </div>
              <p>${totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-600">Today</p>
            </Card>

            <Card className="p-3">
              <div className="mb-1 flex items-center gap-2 text-blue-600">
                <ShoppingBag className="h-4 w-4" />
                <span className="text-xs">Total Orders</span>
              </div>
              <p>{totalOrders}</p>
              <p className="text-xs text-gray-600">Today</p>
            </Card>

            <Card className="p-3">
              <div className="mb-1 flex items-center gap-2 text-purple-600">
                <LayoutDashboard className="h-4 w-4" />
                <span className="text-xs">Active</span>
              </div>
              <p>{activeRestaurants}</p>
              <p className="text-xs text-gray-600">Restaurants</p>
            </Card>

            <Card className="p-3">
              <div className="mb-1 flex items-center gap-2 text-yellow-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Avg Rating</span>
              </div>
              <p>{avgRating}</p>
              <p className="text-xs text-gray-600">All locations</p>
            </Card>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search restaurants..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2>Your Restaurants</h2>
          <Badge variant="secondary">{filteredRestaurants.length} locations</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filteredRestaurants.map((restaurant) => (
            <div key={restaurant.id} className="relative">
              <RestaurantCard
                restaurant={restaurant}
                onClick={() => onViewRestaurant?.(restaurant.id)}
              />
              <Button
                size="sm"
                variant="outline"
                className="absolute right-4 top-4"
                onClick={(event) => {
                  event.stopPropagation();
                  onViewRestaurant?.(restaurant.id);
                }}
              >
                <Eye className="mr-1 h-4 w-4" />
                View
              </Button>
            </div>
          ))}
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No restaurants found
          </div>
        ) : null}
      </div>
    </div>
  );
}
