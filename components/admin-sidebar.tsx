'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UtensilsCrossed, Settings, Store } from "lucide-react";

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
    name: "Restaurant Settings",
    href: "/admin/dashboard/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div 
      className="flex h-screen w-64 flex-col border-r-2"
      style={{ 
        backgroundColor: colors.background.primary,
        borderColor: colors.border.light 
      }}
    >
      {/* Logo/Brand */}
      <div 
        className="flex h-20 items-center gap-3 border-b-2 px-6"
        style={{ borderColor: colors.border.light }}
      >
        <div 
          className="flex h-12 w-12 items-center justify-center rounded-xl shadow-md"
          style={{ backgroundColor: colors.primary[600] }}
        >
          <Store className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold" style={{ color: colors.text.primary }}>
            Admin Panel
          </h1>
          <p className="text-xs" style={{ color: colors.text.secondary }}>
            Restaurant Manager
          </p>
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
              style={{
                backgroundColor: isActive ? colors.primary[600] : 'transparent',
                color: isActive ? colors.text.inverse : colors.text.primary,
              }}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div 
        className="border-t-2 p-4"
        style={{ borderColor: colors.border.light }}
      >
        <p className="text-xs text-center" style={{ color: colors.text.tertiary }}>
          © 2025 Restaurant Manager
        </p>
      </div>
    </div>
  );
}

