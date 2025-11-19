"use client";

import {
  DollarSign,
  LayoutDashboard,
  Search,
  ShoppingBag,
  Star,
} from "lucide-react";
import { useMemo, useState } from "react";

import { colors } from "@/config/colors";
import { RestaurantCard, type RestaurantData } from "./restaurant-card";
import { Card } from "./ui/card";
import { Input } from "./ui/input";

interface RestaurantDashboardProps {
  restaurants: RestaurantData[];
}

export function RestaurantDashboard({ restaurants }: RestaurantDashboardProps) {
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
    const total = restaurants.reduce((sum, current) => sum + current.rating, 0);
    return (total / restaurants.length).toFixed(1);
  }, [restaurants]);

  const stats = [
    {
      icon: DollarSign,
      label: "Today's Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      subtext: "Total sales",
      color: colors.success[600],
      bgColor: colors.success[50],
    },
    {
      icon: ShoppingBag,
      label: "Total Orders",
      value: totalOrders.toString(),
      subtext: "Orders today",
      color: colors.secondary[600],
      bgColor: colors.secondary[50],
    },
    {
      icon: LayoutDashboard,
      label: "Active Locations",
      value: activeRestaurants.toString(),
      subtext: "Restaurants",
      color: colors.primary[600],
      bgColor: colors.primary[50],
    },
    {
      icon: Star,
      label: "Average Rating",
      value: avgRating,
      subtext: "Customer rating",
      color: colors.warning[600],
      bgColor: colors.warning[50],
    },
  ];

  return (
    <div className="min-h-full p-6 space-y-6">
      <div>
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Dashboard Overview</h2>
          <p className="text-sm mt-1">
            Track your restaurant&apos;s performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="p-6 border-2 transition-all hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-xs mt-1">{stat.subtext}</p>
                </div>
                <div className="p-3 rounded-xl">
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Search Bar */}
        <Card className="p-4 border-2 mt-6 mb-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search restaurants by name or cuisine..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>
        </Card>

        {/* Restaurant Details */}
        <div>
          <div className="mb-4">
            <h3 className="text-xl font-bold">Restaurant Details</h3>
            <p className="text-sm mt-1">
              {filteredRestaurants.length}{" "}
              {filteredRestaurants.length === 1 ? "location" : "locations"}
            </p>
          </div>

          {filteredRestaurants.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-2">
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8" />
              </div>
              <p className="text-lg font-semibold">No restaurants found</p>
              <p className="text-sm mt-1">Try adjusting your search criteria</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
