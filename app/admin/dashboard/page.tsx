import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { RestaurantDashboard } from "@/components/restaurant-dashboard";
import { SignOutButton } from "@/components/sign-out-button";
import type { RestaurantData } from "@/components/restaurant-card";

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

  return (await response.json()) as { restaurants: RestaurantData[] };
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

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="sticky top-0 z-40 border-b bg-white shadow-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Overview of restaurants and performance metrics.
            </p>
          </div>
          <SignOutButton />
        </div>
      </div>
      <RestaurantDashboard restaurants={data.restaurants} />
    </div>
  );
}
