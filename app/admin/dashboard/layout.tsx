import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { colors } from "@/config/colors";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SignOutButton } from "@/components/sign-out-button";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token");

  if (!token) {
    redirect("/admin");
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: colors.background.secondary }}>
      <AdminSidebar />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <div 
          className="flex h-20 items-center justify-between border-b-2 px-6 shadow-sm"
          style={{ 
            backgroundColor: colors.background.primary,
            borderColor: colors.border.light 
          }}
        >
          <div>
            <h1 className="text-xl font-bold" style={{ color: colors.text.primary }}>
              Restaurant Management
            </h1>
            <p className="text-sm" style={{ color: colors.text.secondary }}>
              Manage your restaurant operations
            </p>
          </div>
          <SignOutButton />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

