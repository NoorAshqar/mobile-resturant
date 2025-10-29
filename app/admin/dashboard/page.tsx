import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { colors } from "@/config/colors";
import { CreateRestaurantForm } from "@/components/create-restaurant-form";
import type { RestaurantData } from "@/components/restaurant-card";
import { RestaurantDashboard } from "@/components/restaurant-dashboard";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:4000";

async function fetchDashboard(cookieHeader: string) {
  const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
    method: "GET",
    headers: {
      Cookie: cookieHeader,
    },
    cache: "no-store",
    credentials: "include",
  });

  if (response.status === 401) {
    redirect("/admin");
  }

  if (!response.ok) {
    throw new Error("Failed to load dashboard data.");
  }

  return (await response.json()) as { restaurant: RestaurantData | null };
}

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token");

  if (!token) {
    redirect("/admin");
  }

  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const data = await fetchDashboard(cookieHeader);

  if (!data.restaurant) {
    return (
      <div className="flex items-center justify-center p-6" style={{ backgroundColor: colors.background.secondary }}>
        <CreateRestaurantForm />
      </div>
    );
  }

  return <RestaurantDashboard restaurants={[data.restaurant]} />;
}
