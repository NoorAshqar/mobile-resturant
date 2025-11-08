"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Settings,
  Store,
  Table as TableIcon,
  Receipt,
} from "lucide-react";

import { colors } from "@/config/colors";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Menu Items",
    href: "/admin/dashboard/menu",
    icon: UtensilsCrossed,
  },
  {
    name: "Tables",
    href: "/admin/dashboard/tables",
    icon: TableIcon,
  },
  {
    name: "Orders",
    href: "/admin/dashboard/orders",
    icon: Receipt,
  },
  {
    name: "Restaurant Settings",
    href: "/admin/dashboard/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r-2">
      {/* Logo/Brand */}
      <div className="flex h-20 items-center gap-3 border-b-2 px-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl shadow-md">
          <Store className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold">Admin Panel</h1>
          <p className="text-xs">Restaurant Manager</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all hover:shadow-md"
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t-2 p-4">
        <p className="text-xs text-center">© 2025 Restaurant Manager</p>
      </div>
    </div>
  );
}
