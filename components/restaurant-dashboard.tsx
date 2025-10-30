'use client';

import { useMemo, useState } from "react";
import {
  DollarSign,
  LayoutDashboard,
  Search,
  ShoppingBag,
  Star,
  TrendingUp,
} from "lucide-react";

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
    const total = restaurants.reduce(
      (sum, current) => sum + current.rating,
      0,
    );
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
    <div className="min-h-full p-6 space-y-6" style={{ backgroundColor: colors.background.secondary }}>
      <div>
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
            Dashboard Overview
          </h2>
          <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
            Track your restaurant's performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="p-6 border-2 transition-all hover:shadow-lg"
              style={{ 
                backgroundColor: colors.background.primary,
                borderColor: colors.border.light 
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: colors.text.secondary }}>
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold" style={{ color: colors.text.primary }}>
                    {stat.value}
                  </p>
                  <p className="text-xs mt-1" style={{ color: colors.text.tertiary }}>
                    {stat.subtext}
                  </p>
                </div>
                <div 
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: stat.bgColor }}
                >
                  <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Search Bar */}
        <Card 
          className="p-4 border-2"
          style={{ 
            backgroundColor: colors.background.primary,
            borderColor: colors.border.light 
          }}
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: colors.text.tertiary }} />
            <Input
              type="text"
              placeholder="Search restaurants by name or cuisine..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-12 h-12 text-base"
              style={{ 
                borderColor: colors.border.DEFAULT,
                backgroundColor: colors.background.primary 
              }}
            />
          </div>
        </Card>

        {/* Restaurant Details */}
        <div>
          <div className="mb-4">
            <h3 className="text-xl font-bold" style={{ color: colors.text.primary }}>
              Restaurant Details
            </h3>
            <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
              {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'location' : 'locations'}
            </p>
          </div>

          {filteredRestaurants.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                />
              ))}
            </div>
          ) : (
            <Card 
              className="p-12 text-center border-2"
              style={{ 
                backgroundColor: colors.background.primary,
                borderColor: colors.border.light 
              }}
            >
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: colors.neutral[100] }}>
                <Search className="h-8 w-8" style={{ color: colors.text.tertiary }} />
              </div>
              <p className="text-lg font-semibold" style={{ color: colors.text.primary }}>
                No restaurants found
              </p>
              <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
                Try adjusting your search criteria
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
